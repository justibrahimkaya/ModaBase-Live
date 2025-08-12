import ProductDetail from '@/components/ProductDetail'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { cache } from 'react'

interface ProductPageProps {
  params: {
    id: string
  }
}

// Cache product data to avoid duplicate queries
const getProduct = cache(async (id: string) => {
  // Try to find by ID first
  let product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      originalPrice: true,
      images: true,
      stock: true,
      categoryId: true,
      sku: true,
      mpn: true,
      gtin: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          business: {
            select: {
              id: true,
              businessName: true
            }
          }
        }
      }
    }
  })

  // If not found by ID, try by slug
  if (!product) {
    product = await prisma.product.findUnique({
      where: { slug: id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        originalPrice: true,
        images: true,
        stock: true,
        categoryId: true,
        sku: true,
        mpn: true,
        gtin: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            business: {
              select: {
                id: true,
                businessName: true
              }
            }
          }
        }
      }
    })
  }

  return product
})

// Separate function for fetching related data
async function getProductRelatedData(productId: string) {
  const [variants, reviews, reviewCount] = await Promise.all([
    // Get variants
    prisma.productVariant.findMany({
      where: {
        productId,
        isActive: true
      },
      select: {
        id: true,
        productId: true,
        color: true,
        colorCode: true,
        size: true,
        stock: true,
        price: true,
        sku: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { size: 'asc' },
        { color: 'asc' }
      ]
    }),
    // Get reviews with minimal data
    prisma.review.findMany({
      where: { productId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            surname: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit initial reviews
    }),
    // Get review count
    prisma.review.count({
      where: { productId }
    })
  ])

  return { variants, reviews, reviewCount }
}

// Dynamic Metadata for Product Pages
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await getProduct(params.id)

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
        'online alışveriş'
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
        canonical: `https://www.modabase.com.tr/product/${product.slug || product.id}`
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
    // Get product data (cached)
    const product = await getProduct(params.id)

    if (!product) {
      notFound()
    }

    // Fetch related data in parallel
    const [relatedData, similarProducts] = await Promise.all([
      getProductRelatedData(product.id),
      // Get similar products with minimal data
      prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          stock: { gt: 0 } // Only show in-stock products
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          originalPrice: true,
          images: true,
          stock: true,
          categoryId: true,
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
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  surname: true
                }
              }
            },
            take: 1
          },
          _count: {
            select: { reviews: true }
          }
        },
        take: 4,
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    const { variants, reviews, reviewCount } = relatedData

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    // Prepare structured data
    const images = typeof product.images === 'string' 
      ? JSON.parse(product.images) 
      : product.images

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
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "condition": "https://schema.org/NewCondition",
        "url": `https://www.modabase.com.tr/product/${product.slug || product.id}`,
        "itemCondition": "https://schema.org/NewCondition",
        "validFrom": new Date().toISOString().split('T')[0],
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
      },
      "aggregateRating": averageRating > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": averageRating.toFixed(1),
        "reviewCount": reviewCount
      } : undefined,
      "sku": product.sku,
      "mpn": product.mpn,
      "gtin": product.gtin
    };

    // Prepare product data for component
    const fullProduct = {
      ...product,
      images,
      originalPrice: product.originalPrice || 0,
      variants,
      reviews,
      _count: { reviews: reviewCount },
      // Override category to ensure correct type
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: (product.category as any).slug || ''
      } : {
        id: '',
        name: '',
        slug: ''
      }
    }

    return (
      <>
        {/* Product JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productStructuredData)
          }}
        />
        
        <main className="min-h-screen bg-gray-50">
          <ProductDetail 
            product={fullProduct}
            variants={variants}
            averageRating={averageRating}
            similarProducts={similarProducts.map((p) => ({
              ...p,
              originalPrice: p.originalPrice || 0,
              images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
              reviewCount: p._count.reviews
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
