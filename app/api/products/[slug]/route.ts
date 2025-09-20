import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                surname: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    // Ortalama rating hesapla
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
      : 0

    const productWithDetails = {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10
    }

    return NextResponse.json(productWithDetails)

  } catch (error) {
    console.error('Product Detail API Error:', error)
    return NextResponse.json(
      { error: 'Ürün detayı getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
