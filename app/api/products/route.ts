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
    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
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

    // Ürünleri getir
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: { reviews: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // Ortalama rating hesapla
    const productsWithRating = await Promise.all(
      products.map(async (product: any) => {
        const reviews = await prisma.review.findMany({
          where: { productId: product.id },
          select: { rating: true }
        })

        const averageRating = reviews.length > 0
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
          : 0

        return {
          ...product,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length
        }
      })
    )

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
