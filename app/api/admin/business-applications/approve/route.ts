import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/emailService'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// POST - Approve business application
export async function POST(request: NextRequest) {
  try {
    // Authentication check for admin
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 401 })
    }

    const { applicationId } = await request.json()

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Başvuru ID gerekli' },
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

    // Approve the application
    const updatedBusiness = await prisma.business.update({
      where: { id: applicationId },
      data: {
        adminStatus: 'APPROVED',
        approvedAt: new Date(),
        isActive: true,
        // TODO: Add approvedBy field with admin ID
        // approvedBy: session.user.id
      }
    })

    // Send approval email notification
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

      await EmailService.sendBusinessApprovalEmail(application.email, application.businessName)
      console.log('Approval email sent successfully to:', application.email)
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Başvuru başarıyla onaylandı',
      business: {
        id: updatedBusiness.id,
        businessName: application.businessName,
        status: 'APPROVED'
      }
    })

  } catch (error) {
    console.error('Error approving business application:', error)
    return NextResponse.json(
      { error: 'Başvuru onaylanırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
