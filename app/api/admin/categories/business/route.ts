import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireBusinessAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET: İşletme sahibinin kategorilerini getir
export async function GET(request: NextRequest) {
  const authResult = await requireBusinessAdmin(request)
  if (authResult && 'error' in authResult) return authResult

  if (!authResult || !('businessId' in authResult)) {
    return NextResponse.json({ error: 'İşletme bilgisi bulunamadı.' }, { status: 401 })
  }

  // İşletme sahibinin ID'sini al
  const businessId = authResult.businessId

  const categories = await prisma.category.findMany({
    where: {
      businessId: businessId
    },
    include: {
      _count: {
        select: {
          products: true
        }
      },
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        include: {
          _count: {
            select: {
              products: true
            }
          }
        }
      }
    },
    orderBy: [
      { parentId: 'asc' },
      { name: 'asc' }
    ]
  })
  return NextResponse.json(categories)
}

// POST: İşletme sahibi için yeni kategori ekle
export async function POST(request: NextRequest) {
  const authResult = await requireBusinessAdmin(request)
  if (authResult && 'error' in authResult) return authResult

  if (!authResult || !('businessId' in authResult)) {
    return NextResponse.json({ error: 'İşletme bilgisi bulunamadı.' }, { status: 401 })
  }

  const businessId = authResult.businessId
  const body = await request.json()
  const { name, slug, description, image, parentId } = body
  
  if (!name || !slug) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 })
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        businessId: businessId
      }
    })
    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Business category creation error:', error)
    
    // Unique constraint hatası
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'name') {
        return NextResponse.json({ error: 'Bu kategori adı zaten mevcut.' }, { status: 400 })
      }
      if (field === 'slug') {
        return NextResponse.json({ error: 'Bu kategori slug\'ı zaten mevcut.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Bu kategori zaten mevcut.' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Kategori eklenemedi: ' + error.message }, { status: 400 })
  }
} 