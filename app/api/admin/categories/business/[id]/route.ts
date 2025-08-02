import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireBusinessAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Kategori güncelle
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireBusinessAdmin(request)
  if (authResult && 'error' in authResult) return authResult

  if (!authResult || !('businessId' in authResult)) {
    return NextResponse.json({ error: 'İşletme bilgisi bulunamadı.' }, { status: 401 })
  }

  const businessId = authResult.businessId
  const { id } = params
  const body = await request.json()
  const { name, slug, description, image, parentId } = body
  
  if (!name || !slug) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 })
  }

  try {
    // Önce kategorinin bu işletmeye ait olduğunu kontrol et
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id,
        businessId: businessId
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Kategori bulunamadı veya yetkiniz yok.' }, { status: 404 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null
      }
    })
    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Business category update error:', error)
    
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
    
    return NextResponse.json({ error: 'Kategori güncellenemedi: ' + error.message }, { status: 400 })
  }
}

// Kategori sil
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireBusinessAdmin(request)
  if (authResult && 'error' in authResult) return authResult

  if (!authResult || !('businessId' in authResult)) {
    return NextResponse.json({ error: 'İşletme bilgisi bulunamadı.' }, { status: 401 })
  }

  const businessId = authResult.businessId
  const { id } = params

  try {
    // Önce kategorinin bu işletmeye ait olduğunu kontrol et
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id,
        businessId: businessId
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Kategori bulunamadı veya yetkiniz yok.' }, { status: 404 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Kategori silinemedi.' }, { status: 400 })
  }
} 