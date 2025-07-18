import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Ürün güncelle
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = params
    const body = await request.json()
    const { 
      name, 
      slug, 
      description, 
      price, 
      originalPrice, 
      images, 
      stock, 
      minStockLevel, 
      maxStockLevel, 
      categoryId,
      variants = []
    } = body

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 })
    }

    // Slug benzersizlik kontrolü (mevcut ürün hariç)
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })
    
    if (existingProduct && existingProduct.id !== id) {
      return NextResponse.json({ error: 'Bu slug zaten kullanılıyor.' }, { status: 400 })
    }

    // Transaction kullanarak ürün ve varyantları birlikte güncelle
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          description: description || '',
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          images: typeof images === 'string' ? images : JSON.stringify(images || []),
          stock: parseInt(stock) || 0,
          minStockLevel: parseInt(minStockLevel) || 5,
          maxStockLevel: maxStockLevel ? parseInt(maxStockLevel) : null,
          categoryId
        }
      })

      // Mevcut varyantları sil
      await tx.productVariant.deleteMany({
        where: { productId: id }
      })

      // Yeni varyantları ekle
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((variant: any) => ({
            productId: product.id,
            size: variant.size || null,
            color: variant.color || null,
            colorCode: variant.colorCode || null,
            stock: parseInt(variant.stock) || 0,
            price: variant.price ? parseFloat(variant.price) : null,
            sku: variant.sku || null,
            isActive: variant.isActive !== false
          }))
        })
      }

      return await tx.product.findUnique({
        where: { id: product.id },
        include: { 
          category: true,
          variants: true
        }
      })
    })
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Ürün güncelleme hatası:', error)
    return NextResponse.json({ 
      error: error.message || 'Ürün güncellenemedi.' 
    }, { status: 500 })
  }
}

// Ürün sil
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = params
    // Cascade delete ile varyantları da siler
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ürün silme hatası:', error)
    return NextResponse.json({ 
      error: error.message || 'Ürün silinemedi.' 
    }, { status: 500 })
  }
}
