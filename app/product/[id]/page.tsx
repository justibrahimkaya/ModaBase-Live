import ProductDetail from '@/components/ProductDetail'
import ProductSEOHead from '@/components/ProductSEOHead'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    // Ürünü veritabanından getir - önce ID ile dene, sonra slug ile
    let product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          include: {
            business: {
              select: {
                id: true,
                businessName: true
              }
            }
          }
        },
        variants: {
          where: {
            isActive: true
          },
          orderBy: [
            { size: 'asc' },
            { color: 'asc' }
          ]
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                surname: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    })

    // Eğer ID ile bulunamazsa slug ile dene
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: params.id },
        include: {
          category: {
            include: {
              business: {
                select: {
                  id: true,
                  businessName: true
                }
              }
            }
          },
          variants: {
            where: {
              isActive: true
            },
            orderBy: [
              { size: 'asc' },
              { color: 'asc' }
            ]
          },
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  surname: true
                }
              }
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        }
      })
    }

    if (!product) {
      notFound()
    }

    // Ortalama rating hesapla
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / product.reviews.length
      : 0

    // Benzer ürünleri getir
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id }
      },
      take: 4,
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
          }
        },
        _count: {
          select: { reviews: true }
        }
      }
    })

    return (
      <>
        <ProductSEOHead 
          product={{
            ...product,
            originalPrice: product.originalPrice || 0
          }}
          category={product.category}
        />
        <main className="min-h-screen bg-gray-50">
          <ProductDetail 
            product={{
              ...product,
              originalPrice: product.originalPrice || 0
            }}
            variants={product.variants}
            averageRating={averageRating}
            similarProducts={similarProducts.map((p: any) => ({
              ...p,
              originalPrice: p.originalPrice || 0
            }))}
          />
        </main>
      </>
    )
  } catch (error) {
    console.error('Product page error:', error)
    notFound()
  }
}
