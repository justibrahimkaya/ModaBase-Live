import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET - List pending business applications
export async function GET(request: NextRequest) {
  try {
    // Authentication check for admin
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 401 })
    }

    const applications = await prisma.business.findMany({
      where: {
        adminStatus: 'PENDING'
      },
      select: {
        id: true,
        businessName: true,
        businessType: true,
        taxNumber: true,
        email: true,
        phone: true,
        contactName: true,
        contactSurname: true,
        address: true,
        city: true,
        adminStatus: true,
        appliedAt: true,
        rejectionReason: true
      },
      orderBy: {
        appliedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      applications: applications
    })

  } catch (error) {
    console.error('Error fetching business applications:', error)
    return NextResponse.json(
      { error: 'Başvurular listelenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
