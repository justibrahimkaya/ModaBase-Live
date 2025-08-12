import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET: Belirli bir ürün için yorumları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const rating = searchParams.get('rating') // Belirli rating'e göre filtrele

    if (!productId) {
      return NextResponse.json({ error: 'Product ID gerekli' }, { status: 400 })
    }

    const skip = (page - 1) * limit

    // Filtreleme koşulları
    const where: any = {
      productId,
      isApproved: true // Sadece onaylı yorumları göster
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    // Sıralama
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Yorumları getir
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              image: true
            }
          },
          helpfulVotes: {
            select: {
              isHelpful: true
            }
          },
          _count: {
            select: {
              helpfulVotes: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    // Yorumları işle
    const processedReviews = reviews.map(review => ({
      ...review,
      images: review.images ? JSON.parse(review.images) : [],
      helpfulVotes: review.helpfulVotes.filter(v => v.isHelpful).length,
      unhelpfulVotes: review.helpfulVotes.filter(v => !v.isHelpful).length
    }))

    // Genel istatistikler
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true }
    })

    // Rating dağılımı
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId, isApproved: true },
      _count: { rating: true }
    })

    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    }

    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating
    })

    return NextResponse.json({
      reviews: processedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
        ratingDistribution: distribution
      }
    })

  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({ error: 'Yorumlar getirilirken hata oluştu' }, { status: 500 })
  }
}

// POST: Yeni yorum ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, title, comment, images, orderItemId } = body

    // Validation
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 })
    }

    // Kullanıcı bu ürüne daha önce yorum yapmış mı?
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'Bu ürüne zaten yorum yaptınız' }, { status: 400 })
    }

    // Eğer orderItemId verilmişse, kullanıcının bu ürünü satın aldığını doğrula
    let isVerifiedPurchase = false
    if (orderItemId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          id: orderItemId,
          productId,
          order: {
            userId: session.user.id,
            status: 'DELIVERED' // Sadece teslim edilmiş siparişler
          }
        }
      })

      if (orderItem) {
        isVerifiedPurchase = true
      }
    }

    // Yorum oluştur
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        orderItemId: orderItemId || null,
        rating,
        title: title || null,
        comment: comment || null,
        images: images ? JSON.stringify(images) : null,
        isVerifiedPurchase,
        isApproved: false // Admin onayı beklesin
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      ...review,
      images: review.images ? JSON.parse(review.images) : [],
      message: 'Yorumunuz başarıyla eklendi. Onay bekliyor.'
    })

  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json({ error: 'Yorum eklenirken hata oluştu' }, { status: 500 })
  }
}

// PUT: Yorum güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, rating, title, comment, images } = body

    // Validation
    if (!reviewId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 })
    }

    // Kullanıcının kendi yorumu mu?
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview || existingReview.userId !== session.user.id) {
      return NextResponse.json({ error: 'Bu yorumu düzenleyemezsiniz' }, { status: 403 })
    }

    // Yorumu güncelle
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        title: title || null,
        comment: comment || null,
        images: images ? JSON.stringify(images) : null,
        isApproved: false // Yeniden onay beklesin
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      ...updatedReview,
      images: updatedReview.images ? JSON.parse(updatedReview.images) : [],
      message: 'Yorumunuz güncellendi. Onay bekliyor.'
    })

  } catch (error) {
    console.error('Reviews PUT error:', error)
    return NextResponse.json({ error: 'Yorum güncellenirken hata oluştu' }, { status: 500 })
  }
}

// DELETE: Yorum sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID gerekli' }, { status: 400 })
    }

    // Kullanıcının kendi yorumu mu?
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview || existingReview.userId !== session.user.id) {
      return NextResponse.json({ error: 'Bu yorumu silemezsiniz' }, { status: 403 })
    }

    await prisma.review.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({ message: 'Yorum silindi' })

  } catch (error) {
    console.error('Reviews DELETE error:', error)
    return NextResponse.json({ error: 'Yorum silinirken hata oluştu' }, { status: 500 })
  }
}
