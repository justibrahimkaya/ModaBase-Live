import { NextRequest, NextResponse } from 'next/server'
import { getSuperAdminUser } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // First check if it's a super admin
    const superAdminUser = await getSuperAdminUser(request)
    
    if (superAdminUser) {
      return NextResponse.json({
        id: superAdminUser.id,
        email: superAdminUser.email,
        name: superAdminUser.name,
        surname: superAdminUser.surname,
        role: 'SITE_ADMIN'
      })
    }

    // Check if it's a business admin
    const businessSessionId = request.cookies.get('session_business')?.value
    
    if (businessSessionId) {
      const business = await prisma.business.findUnique({
        where: { id: businessSessionId },
        select: {
          id: true,
          email: true,
          contactName: true,
          contactSurname: true,
          businessName: true,
          adminStatus: true,
          isActive: true
        }
      })

      if (business && business.adminStatus === 'APPROVED' && business.isActive) {
        return NextResponse.json({
          id: business.id,
          email: business.email,
          name: business.contactName,
          surname: business.contactSurname,
          businessName: business.businessName,
          role: 'BUSINESS_ADMIN'
        })
      }
    }

    // No valid session found
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Admin profile error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
