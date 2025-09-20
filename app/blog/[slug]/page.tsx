import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Calendar, Clock, User, ArrowLeft, Share2, Eye } from 'lucide-react'
import Link from 'next/link'
import { buildSafePrisma } from '@/lib/buildSafePrisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  publishedAt: Date | null
  tags: string | null
  image: string
  readTime: number
  category: string
  viewCount: number
}

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Dynamic Metadata for Blog Posts
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug: params.slug,
        isPublished: true
      }
    })

    if (!post) {
      return {
        title: 'Blog Yazısı Bulunamadı | ModaBase',
        description: 'Aradığınız blog yazısı bulunamadı. ModaBase blog sayfamızda diğer moda yazılarını keşfedin.'
      }
    }

    return {
      title: `${post.title} | ModaBase Blog`,
      description: post.excerpt || post.title,
      keywords: [
        post.title,
        post.category,
        ...(post.tags ? post.tags.split(',') : []),
        'moda blog',
        'modabase',
        'moda trendleri'
      ],
      openGraph: {
        title: `${post.title} | ModaBase Blog`,
        description: post.excerpt || post.title,
        images: [post.image],
        type: 'article',
        locale: 'tr_TR',
        publishedTime: post.publishedAt?.toISOString(),
        authors: [post.author],
        section: post.category,
        tags: post.tags ? post.tags.split(',') : []
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.title} | ModaBase Blog`,
        description: post.excerpt || post.title,
        images: [post.image]
      },
      alternates: {
        canonical: `https://www.modabase.com.tr/blog/${post.slug}`
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
      title: 'Blog | ModaBase',
      description: 'ModaBase Blog - Moda trendleri ve stil ipuçları'
    }
  }
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug: slug,
        isPublished: true
      }
    })

    if (post) {
      // View count'u artır
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } }
      })
    }

    return post
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return null
  }
}

async function getRelatedPosts(category: string, currentPostId: string): Promise<BlogPost[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        category: category,
        isPublished: true,
        id: { not: currentPostId }
      },
      take: 3,
      orderBy: {
        publishedAt: 'desc'
      }
    })
    return posts
  } catch (error) {
    console.error('Related posts fetch error:', error)
    return []
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.category, post.id)

  // JSON-LD Structured Data for Blog Post
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "url": `https://modabase.com.tr/blog/${post.slug}`,
    "datePublished": post.publishedAt?.toISOString(),
    "dateModified": post.publishedAt?.toISOString(),
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "ModaBase",
      "url": "https://modabase.com.tr",
      "logo": {
        "@type": "ImageObject",
        "url": "https://modabase.com.tr/ChatGPT Image 20 Haz 2025 14_16_10.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://modabase.com.tr/blog/${post.slug}`
    },
    "articleSection": post.category,
    "keywords": post.tags || "",
    "wordCount": post.readTime * 200,
    "timeRequired": `PT${post.readTime}M`
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
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-gray-700">Ana Sayfa</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-gray-700">Blog</Link>
              <span>/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>

            {/* Back Button */}
            <Link 
              href="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tüm Blog Yazıları
            </Link>

            {/* Category */}
            <div className="mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-8">
              <div className="flex items-center mr-6">
                <User className="w-4 h-4 mr-1" />
                {post.author}
              </div>
              <div className="flex items-center mr-6">
                <Calendar className="w-4 h-4 mr-1" />
                                        {post.publishedAt?.toLocaleDateString('tr-TR')}
              </div>
              <div className="flex items-center mr-6">
                <Clock className="w-4 h-4 mr-1" />
                {post.readTime} dakika okuma
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.viewCount} görüntüleme
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {(post.tags ? post.tags.split(',') : []).map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Bu yazıyı paylaş</h3>
                <div className="flex items-center space-x-3">
                  <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">İlgili Yazılar</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Devamını Oku →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </>
  )
}