import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
import { processProductImages } from '@/lib/imageProcessor'

export const dynamic = 'force-dynamic'

// Next.js 15 body parser configuration
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}

// Body size limit - 100MB for Next.js 15
export const maxDuration = 300 // 5 dakika

// Memory-efficient body parser for Next.js 15
async function parseLargeBody(request: NextRequest): Promise<any> {
  console.log('🔧 Next.js 15 body parsing başlatıldı')
  
  const contentType = request.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Content-Type must be application/json')
  }

  // Chunked reading with memory management
  const chunks: Uint8Array[] = []
  const reader = request.body?.getReader()
  
  if (!reader) {
    throw new Error('Request body okunamadı')
  }

  let totalSize = 0
  const maxSize = 100 * 1024 * 1024 // 100MB limit

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      if (value) {
        totalSize += value.length
        if (totalSize > maxSize) {
          throw new Error('Request body çok büyük (100MB limit)')
        }
        chunks.push(value)
      }
    }
  } catch (readError) {
    console.error('Body reading error:', readError)
    throw new Error('Body okuma hatası')
  } finally {
    reader.releaseLock()
  }

  // Efficient buffer concatenation
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const buffer = new Uint8Array(totalLength)
  let offset = 0
  
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.length
  }

  // Clear chunks array to free memory
  chunks.length = 0

  // Text decoding with error handling
  const bodyText = new TextDecoder().decode(buffer)
  
  console.log('📄 Body text length:', bodyText.length, 'bytes')
  
  try {
    const body = JSON.parse(bodyText)
    console.log('✅ JSON parse başarılı')
    return body
  } catch (parseError) {
    console.error('❌ JSON parse error:', parseError)
    console.error('❌ Body text preview:', bodyText.substring(0, 500))
    throw new Error('JSON parse hatası: Geçersiz veri formatı')
  }
}

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

// POST: Yeni ürün ekle - Next.js 15 optimized
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/admin/products çağrıldı (Next.js 15)')
  
  const authError = await requireAdmin(request)
  if (authError) {
    console.log('❌ Auth hatası:', authError)
    return authError
  }

  try {
    // Next.js 15 optimized body parsing
    const body = await parseLargeBody(request)
    console.log('✅ Body parsing tamamlandı')
    console.log('📦 Parsed body preview:', JSON.stringify(body, null, 2).substring(0, 500))

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

    // Fotoğraf validasyonu ve işleme
    let imageArray: string[] = []
    try {
      imageArray = typeof images === 'string' ? JSON.parse(images) : images || []
      console.log('🖼️ Resim işleme başlatılıyor...')
      console.log('Resim sayisi:', imageArray.length)
      
      // Base64 resimleri kontrol et
      const base64Count = imageArray.filter(img => img.startsWith('data:image')).length
      console.log('Base64 resim sayisi:', base64Count)
      
      if (base64Count > 0) {
        console.log('🔄 Base64 resimler optimize ediliyor...')
        imageArray = await processProductImages(imageArray)
        console.log('✅ Resimler optimize edildi!')
      }
      
    } catch (error) {
      console.error('❌ Resim işleme hatası:', error)
      return NextResponse.json({ error: 'Fotoğraf verisi geçersiz.' }, { status: 400 })
    }

    if (imageArray.length === 0) {
      console.log('❌ Hiç resim yok')
      return NextResponse.json({ error: 'En az 1 fotoğraf yüklemelisiniz.' }, { status: 400 })
    }

    if (imageArray.length > 20) {
      console.log('❌ Çok fazla resim:', imageArray.length)
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
          images: JSON.stringify(imageArray),
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

      // Varyantları ekle - DEBUG LOGLARI
      console.log('🔍 VARYANT DEBUG:')
      console.log('variants tipi:', typeof variants)
      console.log('variants değeri:', variants)
      console.log('variants uzunluk:', variants?.length || 0)
      
      if (variants && variants.length > 0) {
        console.log('✅ Varyantlar ekleniyor...')
        console.log('Varyant detayları:')
        variants.forEach((variant: any, index: number) => {
          console.log(`Varyant ${index + 1}:`, {
            size: variant.size,
            color: variant.color,
            colorCode: variant.colorCode,
            stock: variant.stock,
            price: variant.price,
            sku: variant.sku,
            isActive: variant.isActive
          })
        })
        
        const variantData = variants.map((variant: any) => ({
          productId: product.id,
          size: variant.size,
          color: variant.color,
          colorCode: variant.colorCode,
          stock: parseInt(variant.stock) || 0,
          price: variant.price ? parseFloat(variant.price) : null,
          sku: variant.sku,
          isActive: variant.isActive !== false
        }))
        
        console.log('📦 Veritabanına gönderilecek varyant verisi:', variantData)
        
        await tx.productVariant.createMany({
          data: variantData
        })
        
        console.log('✅ Varyantlar başarıyla eklendi')
      } else {
        console.log('❌ Hiç varyant yok veya boş array')
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
