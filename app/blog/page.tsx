import { Metadata } from 'next'
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowRight,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  author: string
  publishedAt: Date | null
  tags: string[]
  image: string
  readTime: number
  category: string
  viewCount: number
}

// Blog Metadata - SEO Optimized
export const metadata: Metadata = {
  title: 'Blog - Moda Trendleri ve Stil İpuçları | ModaBase',
  description: 'En yeni moda trendleri, stil ipuçları, moda haberleri ve sezon önerileri. ModaBase blog ile moda dünyasındaki gelişmeleri takip edin.',
  keywords: [
    'moda blog', 'moda trendleri', 'stil ipuçları', 'moda haberleri',
    'sezon modası', 'moda rehberi', 'stil önerileri', 'fashion blog',
    'modabase blog', 'kadın modası', 'erkek modası', 'trend analizi'
  ],
  openGraph: {
    title: 'Blog - Moda Trendleri ve Stil İpuçları | ModaBase',
    description: 'En yeni moda trendleri, stil ipuçları ve moda haberleri. ModaBase blog ile moda dünyasını keşfedin.',
    images: ['/og-blog.jpg'],
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModaBase Blog - Moda Trendleri ve Stil İpuçları',
    description: 'En yeni moda trendleri, stil ipuçları ve moda haberleri burada!',
    images: ['/twitter-blog.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/blog'
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

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        author: true,
        publishedAt: true,
        tags: true,
        image: true,
        readTime: true,
        category: true,
        viewCount: true
      }
    })
    return posts
  } catch (error) {
    console.error('Blog posts fetch error:', error)
    return []
  }
}



export default async function BlogPage() {
  const posts = await getBlogPosts()

  // JSON-LD Structured Data for Blog
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "ModaBase Blog",
    "description": "Moda trendleri, stil ipuçları ve moda haberleri",
    "url": "https://modabase.com.tr/blog",
    "publisher": {
      "@type": "Organization",
      "name": "ModaBase",
      "url": "https://modabase.com.tr"
    },
    "blogPost": posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "url": `https://modabase.com.tr/blog/${post.slug}`,
      "datePublished": post.publishedAt?.toISOString(),
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "ModaBase"
      },
      "description": post.excerpt,
      "wordCount": post.readTime * 200 // Tahmini kelime sayısı
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 mr-3" />
                <h1 className="text-4xl font-bold">ModaBase Blog</h1>
              </div>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Moda trendleri, stil önerileri ve alışveriş rehberleri
              </p>
            </div>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz blog yazısı yok</h3>
              <p className="text-gray-600">Yakında ilginç içeriklerle karşınızda olacağız.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {/* Image */}
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="mx-2">•</div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {post.publishedAt?.toLocaleDateString('tr-TR')}
                      </div>
                      <div className="mx-2">•</div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime} dk okuma
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Read More */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Devamını Oku
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  )
}