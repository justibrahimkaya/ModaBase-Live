import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const discount = searchParams.get('discount')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Filtreleme koşulları
    const where: any = {}

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (discount === 'true') {
      where.originalPrice = {
        not: null,
        gt: where.price || {}
      }
    }

    // Sıralama
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Ürünleri getir - ⚡ OPTIMIZED
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          originalPrice: true,
          stock: true,
          images: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: { 
              reviews: true 
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // ⚡ FAST: Rating hesaplama tek seferde
    const productsWithRating = products.map((product: any) => {
      const reviews = product.reviews || [];
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
        : 0

      // Images'ı parse et ve ilk fotoğrafı al
      let image = ''
      try {
        const images = JSON.parse(product.images || '[]')
        image = images[0] || ''
      } catch (error) {
        console.error('Image parse error:', error)
        image = ''
      }

      // İndirim hesapla
      let discount = 0
      if (product.originalPrice && product.originalPrice > product.price) {
        discount = Math.round((1 - product.price / product.originalPrice) * 100)
      }

      return {
        ...product,
        image, // İlk fotoğrafı image olarak kullan
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
        rating: Math.round(averageRating * 10) / 10, // rating field'ı için
        reviews: reviews.length, // reviews field'ı için
        discount
      }
    })

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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
