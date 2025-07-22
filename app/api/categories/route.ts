import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const main = searchParams.get('main')
    const parentId = searchParams.get('parentId')
    const includeBusiness = searchParams.get('includeBusiness') === 'true'

    let whereClause: any = { isActive: true }

    // Ana kategorileri getir (parentId null olanlar)
    if (main === 'true') {
      whereClause.parentId = null
    }
    
    // Belirli bir ana kategori altındaki alt kategorileri getir
    if (parentId) {
      whereClause.parentId = parentId
    }

    // İşletme kategorilerini dahil et
    if (includeBusiness) {
      // businessId null olanlar (sistem kategorileri) VEYA businessId olanlar (işletme kategorileri)
      whereClause.OR = [
        { businessId: null },
        { businessId: { not: null } }
      ]
    } else {
      // Sadece sistem kategorileri
      whereClause.businessId = null
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { products: true }
        },
        children: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        business: {
          select: {
            id: true,
            businessName: true
          }
        }
      },
      orderBy: [
        { businessId: 'asc' }, // Önce sistem kategorileri
        { name: 'asc' }
      ]
    })

    return NextResponse.json(categories)

  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: 'Kategoriler getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
