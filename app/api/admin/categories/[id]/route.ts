import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Kategori güncelle
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const { id } = params
  const body = await request.json()
  const { name, slug, description, image, parentId, businessId } = body
  if (!name || !slug) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 })
  }
  try {
    const category = await prisma.category.update({
      where: { id },
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
    console.error('Category update error:', error)
    
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
  const authError = await requireAdmin(request)
  if (authError) return authError

  const { id } = params
  try {
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Kategori silinemedi.' }, { status: 400 })
  }
}
