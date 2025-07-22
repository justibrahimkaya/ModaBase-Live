import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET: Tüm ürünleri getir
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const products = await prisma.product.findMany({
    include: { 
      category: true,
      variants: true
    }
  })
  return NextResponse.json(products)
}

// POST: Yeni ürün ekle
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
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

    // Slug benzersizlik kontrolü
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })
    
    if (existingProduct) {
      return NextResponse.json({ error: 'Bu slug zaten kullanılıyor.' }, { status: 400 })
    }

    // Transaction kullanarak ürün ve varyantları birlikte kaydet
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
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

      // Varyantları kaydet
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
    console.error('Ürün oluşturma hatası:', error)
    return NextResponse.json({ 
      error: error.message || 'Ürün eklenemedi.' 
    }, { status: 500 })
  }
}
