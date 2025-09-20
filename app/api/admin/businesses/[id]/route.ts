import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET: Belirli bir işletmenin detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const businessId = params.id

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        businessName: true,
        email: true,
        phone: true,
        address: true,
        businessType: true,
        city: true,
        district: true,
        adminStatus: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        approvedAt: true,
        rejectedAt: true,
        contactName: true,
        contactSurname: true,
        taxNumber: true,
        website: true,
        rejectionReason: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(business)
  } catch (error: any) {
    console.error('Business detail fetch error:', error)
    return NextResponse.json(
      { error: 'İşletme bilgileri getirilemedi: ' + error.message },
      { status: 500 }
    )
  }
} 