import ProductDetail from '@/components/ProductDetail'
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

    let images = [];
    try {
      images = JSON.parse(product.images || '[]');
    } catch (e) {
      images = [];
    }
    const mainImage = images[0] || '/default-product.jpg'

    return {
      title: `${product.name} - ${product.category?.name || 'Moda'} | ModaBase`,
      description: product.description || `${product.name} ürününü ModaBase'den güvenle satın alın.`,
      openGraph: {
        title: `${product.name} | ModaBase`,
        description: product.description || `${product.name} - En uygun fiyatlarla ModaBase'de!`,
        images: [mainImage],
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

    // Parse images safely
    let images = [];
    try {
      images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
    } catch (e) {
      console.error('Error parsing images:', e);
      images = [];
    }

    // Product structured data JSON-LD
    const getValidImageUrl = () => {
      if (images && images.length > 0) {
        const firstImage = images[0];
        if (firstImage && firstImage.startsWith('http') && !firstImage.startsWith('data:image/')) {
          return firstImage;
        }
      }
      return 'https://www.modabase.com.tr/default-product.svg';
    };

    const productStructuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description || `${product.name} - En uygun fiyatlarla ModaBase'de!`,
      "image": getValidImageUrl(),
      "brand": {
        "@type": "Brand", 
        "name": product.category?.business?.businessName || "ModaBase"
      },
      "category": product.category?.name,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "TRY",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": `https://www.modabase.com.tr/product/${product.slug || product.id}`,
        "seller": {
          "@type": "Organization",
          "name": "ModaBase",
          "url": "https://www.modabase.com.tr"
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "TR",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "returnMethod": "https://schema.org/ReturnByMail",
          "merchantReturnDays": "14",
          "returnFees": "https://schema.org/OriginalShippingFees"
        }
      }
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productStructuredData)
          }}
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
