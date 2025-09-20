import { MetadataRoute } from 'next'
import { buildSafePrisma } from '@/lib/buildSafePrisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.modabase.com.tr'

  // Build sırasında veritabanı bağlantısını devre dışı bırak
  if (!process.env.DATABASE_URL || process.env.NODE_ENV === 'production') {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
    ]
  }

  // Statik sayfalar
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    // SEO Landing Pages - ERKEK TRİKO ÖNCELİKLİ
    {
      url: `${baseUrl}/erkek-triko`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.98,  // En yüksek öncelik erkek triko'ya
    },
    {
      url: `${baseUrl}/triko`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.97,
    },
    {
      url: `${baseUrl}/erkek-kazak`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.96,
    },
    {
      url: `${baseUrl}/erkek-suveter`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.96,
    },
    {
      url: `${baseUrl}/erkek-hirka`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.96,
    },
    {
      url: `${baseUrl}/kadin-elbise`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/yazlik-elbise`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/triko-elbise`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/bluz-modelleri`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/kadin-pantolon`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/buyuk-beden`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/siyah-elbise`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/kadin-tisort`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ]

  // Kategoriler
  const categories = await buildSafePrisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true }
  })

  const categoryPages = categories.map((category: any) => ({
    url: `${baseUrl}/products?category=${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Ürünler
  const products = await buildSafePrisma.product.findMany({
    select: { id: true, slug: true, updatedAt: true }
  })

  const productPages = products
    .filter((product: any) => product.slug) // Sadece slug'ı olan ürünler
    .map((product: any) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  // Blog yazıları
  const blogPosts = await buildSafePrisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true }
  })

  const blogPages = blogPosts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...blogPages,
  ]
} 