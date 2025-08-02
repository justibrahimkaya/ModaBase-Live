import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET: Tüm kategorileri getir
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const categories = await prisma.category.findMany({
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
      },
      business: {
        select: {
          id: true,
          businessName: true
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

// POST: Yeni kategori ekle
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const body = await request.json()
  const { name, slug, description, image, parentId, businessId } = body
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
        businessId: businessId || null
      }
    })
    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Category creation error:', error)
    
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
