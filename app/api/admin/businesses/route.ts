import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET: Tüm işletmeleri getir
export async function GET(request: NextRequest) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const businesses = await prisma.business.findMany({
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
        rejectedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(businesses)
  } catch (error: any) {
    console.error('Businesses fetch error:', error)
    return NextResponse.json({ error: 'İşletmeler getirilemedi: ' + error.message }, { status: 500 })
  }
}

// DELETE: İşletme sil
export async function DELETE(request: NextRequest) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        businessName: true,
        email: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    // Delete the business
    await prisma.business.delete({
      where: { id: businessId }
    })

    return NextResponse.json({
      success: true,
      message: 'İşletme başarıyla silindi',
      business: {
        id: business.id,
        businessName: business.businessName
      }
    })

  } catch (error: any) {
    console.error('Error deleting business:', error)
    return NextResponse.json(
      { error: 'İşletme silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 