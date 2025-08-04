import ProductDetail from '@/components/ProductDetail'
import ProductSEOHead from '@/components/ProductSEOHead'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface ProductPageProps {
  params: {
    id: string
  }
}

// Dynamic Metadata for Product Pages
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    // Ürünü getir
    let product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    })

    // Slug ile dene
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: params.id },
        include: {
          category: true
        }
      })
    }

    if (!product) {
      return {
        title: 'Ürün Bulunamadı | ModaBase',
        description: 'Aradığınız ürün bulunamadı. ModaBase\'de binlerce farklı ürün seçeneği sizleri bekliyor.'
      }
    }

    const images = JSON.parse(product.images || '[]')
    const mainImage = images[0] || '/default-product.jpg'

    return {
      title: `${product.name} - ${product.category?.name || 'Moda'} | ModaBase`,
      description: product.description || `${product.name} ürününü ModaBase'den güvenle satın alın. ${product.category?.name} kategorisinde en kaliteli ürünler burada!`,
      keywords: [
        product.name,
        product.category?.name || '',
        'modabase',
        'online alışveriş',
        'moda',
        'kaliteli ürün',
        'güvenli ödeme',
        'ücretsiz kargo'
      ],
      openGraph: {
        title: `${product.name} | ModaBase`,
        description: product.description || `${product.name} - En uygun fiyatlarla ModaBase'de!`,
        images: [mainImage],
        type: 'website',
        locale: 'tr_TR',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | ModaBase`,
        description: product.description || `${product.name} - En uygun fiyatlarla!`,
        images: [mainImage]
      },
      alternates: {
        canonical: `https://modabase.com.tr/product/${product.slug || product.id}`
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      }
    }
  } catch (error) {
    console.error('Generate metadata error:', error)
    return {
      title: 'Ürün | ModaBase',
      description: 'ModaBase - En kaliteli moda ürünleri'
    }
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
