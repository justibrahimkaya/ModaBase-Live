import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/emailService'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// POST - Reject business application
export async function POST(request: NextRequest) {
  try {
    // Authentication check for admin
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 401 })
    }

    const { applicationId, reason } = await request.json()

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Başvuru ID gerekli' },
        { status: 400 }
      )
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Red nedeni belirtilmelidir' },
        { status: 400 }
      )
    }

    // Check if application exists and is pending
    const application = await prisma.business.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        adminStatus: true,
        businessName: true,
        email: true,
        contactName: true,
        contactSurname: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Başvuru bulunamadı' },
        { status: 404 }
      )
    }

    if (application.adminStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Bu başvuru zaten değerlendirilmiş' },
        { status: 400 }
      )
    }

    // Reject the application
    const updatedBusiness = await prisma.business.update({
      where: { id: applicationId },
      data: {
        adminStatus: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason.trim(),
        isActive: false,
        // TODO: Add rejectedBy field with admin ID  
        // rejectedBy: session.user.id
      }
    })

    // Send rejection email notification
    try {
      EmailService.initialize({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
          pass: process.env.SMTP_PASS || 'yqarfkyevahfnenq'
        }
      })

      await EmailService.sendBusinessRejectionEmail(application.email, application.businessName, reason)
      console.log('Rejection email sent successfully to:', application.email)
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
      // Don't fail the rejection if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Başvuru reddedildi',
      business: {
        id: updatedBusiness.id,
        businessName: application.businessName,
        status: 'REJECTED',
        rejectionReason: reason.trim()
      }
    })

  } catch (error) {
    console.error('Error rejecting business application:', error)
    return NextResponse.json(
      { error: 'Başvuru reddedilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
