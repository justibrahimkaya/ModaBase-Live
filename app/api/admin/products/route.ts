import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Body parser'ı tamamen devre dışı bırak
export const config = {
  api: {
    bodyParser: false,
  },
}

// Body size limit - 100MB
export const maxDuration = 300 // 5 dakika

// GET: Tüm ürünleri getir
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          variants: true,
          _count: {
            select: {
              reviews: true,
              orderItems: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.product.count({ where: whereClause })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Products API Error:', error)
    return NextResponse.json(
      { error: 'Ürünler getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST: Yeni ürün ekle - Raw body handling
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/admin/products çağrıldı')
  
  const authError = await requireAdmin(request)
  if (authError) {
    console.log('❌ Auth hatası:', authError)
    return authError
  }

  try {
    // Content-Type kontrolü
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ 
        error: 'Content-Type must be application/json' 
      }, { status: 400 })
    }

    // Raw body okuma - chunked
    const chunks: Uint8Array[] = []
    const reader = request.body?.getReader()
    
    if (!reader) {
      return NextResponse.json({ error: 'Request body okunamadı' }, { status: 400 })
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) chunks.push(value)
      }
    } catch (readError) {
      console.error('Body reading error:', readError)
      return NextResponse.json({ error: 'Body okuma hatası' }, { status: 400 })
    }

    // Buffer'ları birleştir
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const buffer = new Uint8Array(totalLength)
    let offset = 0
    
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.length
    }

    // Text'e çevir
    const bodyText = new TextDecoder().decode(buffer)
    
    // Debug için log
    console.log('📄 Body text length:', bodyText.length)
    console.log('📄 Body text preview:', bodyText.substring(0, 500))
    
    let body
    try {
      body = JSON.parse(bodyText)
      console.log('✅ JSON parse başarılı')
      console.log('📦 Parsed body:', JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('❌ Body text start:', bodyText.substring(0, 500))
      return NextResponse.json({ 
        error: 'JSON parse hatası: Geçersiz veri formatı',
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 400 })
    }

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

    console.log('🔍 Validasyon kontrolü...')
    console.log('Name:', name)
    console.log('Slug:', slug)
    console.log('Price:', price)
    console.log('CategoryId:', categoryId)
    
    if (!name || !slug || !price || !categoryId) {
      console.log('❌ Zorunlu alanlar eksik')
      return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 })
    }
    
    console.log('✅ Validasyon başarılı')

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

    if (imageArray.length > 20) {
      return NextResponse.json({ error: 'En fazla 20 fotoğraf yükleyebilirsiniz.' }, { status: 400 })
    }

    // Slug benzersizlik kontrolü
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })
    
    if (existingProduct) {
      return NextResponse.json({ error: 'Bu slug zaten kullanılıyor.' }, { status: 400 })
    }

    console.log('💾 Veritabanına kaydediliyor...')
    
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

      // Varyantları ekle
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((variant: any) => ({
            productId: product.id,
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

      console.log('✅ Ürün başarıyla oluşturuldu:', product.id)
      return product
    })

    console.log('🎉 Transaction başarılı, ürün döndürülüyor')
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Product creation error:', error)
    
    // Unique constraint hatası
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'slug') {
        return NextResponse.json({ error: 'Bu slug zaten kullanılıyor.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Bu ürün zaten mevcut.' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Ürün eklenemedi: ' + error.message }, { status: 400 })
  }
}
