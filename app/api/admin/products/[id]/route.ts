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
      variants = [],
      // Gelişmiş SEO alanları
      metaTitle,
      metaDescription,
      keywords,
      altText,
      brand,
      sku,
      gtin,
      mpn,
      condition,
      availability,
      material,
      color,
      size,
      weight,
      dimensions,
      warranty,
      countryOfOrigin,
      // Sosyal medya
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      // Yapılandırılmış veri
      structuredData,
      canonicalUrl,
      hreflang,
      // Analitik
      googleAnalyticsId,
      googleTagManagerId,
      facebookPixelId,
      // Arama motoru
      robotsMeta,
      sitemapPriority,
      changeFrequency,
      lastModified
    } = body

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 })
    }

    // Fotoğraf validasyonu
    let imageArray: string[] = []
    try {
      imageArray = typeof images === 'string' ? JSON.parse(images) : images || []
    } catch (error) {
      return NextResponse.json({ error: 'Fotoğraf verisi geçersiz.' }, { status: 400 })
    }

    if (imageArray.length === 0) {
      return NextResponse.json({ error: 'En az 1 fotoğraf yüklemelisiniz.' }, { status: 400 })
    }

    if (imageArray.length > 8) {
      return NextResponse.json({ error: 'En fazla 8 fotoğraf yükleyebilirsiniz.' }, { status: 400 })
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
          categoryId,
          // Gelişmiş SEO alanları
          metaTitle,
          metaDescription,
          keywords,
          altText,
          brand,
          sku,
          gtin,
          mpn,
          condition,
          availability,
          material,
          color,
          size,
          weight,
          dimensions,
          warranty,
          countryOfOrigin,
          // Sosyal medya
          ogTitle,
          ogDescription,
          ogImage,
          ogType,
          twitterCard,
          twitterTitle,
          twitterDescription,
          twitterImage,
          // Yapılandırılmış veri
          structuredData,
          canonicalUrl,
          hreflang,
          // Analitik
          googleAnalyticsId,
          googleTagManagerId,
          facebookPixelId,
          // Arama motoru
          robotsMeta,
          sitemapPriority,
          changeFrequency,
          lastModified: lastModified ? new Date(lastModified) : new Date()
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
            productId: id,
            size: variant.size,
            color: variant.color,
            colorCode: variant.colorCode,
            stock: parseInt(variant.stock) || 0,
            price: variant.price ? parseFloat(variant.price) : null,
            sku: variant.sku,
            isActive: variant.isActive !== false
          }))
        })
      }

      return product
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Product update error:', error)
    
    // Unique constraint hatası
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'slug') {
        return NextResponse.json({ error: 'Bu slug zaten kullanılıyor.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Bu ürün zaten mevcut.' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Ürün güncellenemedi: ' + error.message }, { status: 400 })
  }
}

// Ürün sil
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = params

    // Ürünü sil (varyantlar cascade ile silinecek)
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Ürün başarıyla silindi' })
  } catch (error: any) {
    console.error('Product deletion error:', error)
    return NextResponse.json({ error: 'Ürün silinemedi: ' + error.message }, { status: 400 })
  }
}
