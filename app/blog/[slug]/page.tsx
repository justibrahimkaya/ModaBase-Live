'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, User, ArrowLeft, Share2, Eye } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  tags: string[]
  image: string
  readTime: number
  category: string
  viewCount: number
}

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.slug) {
      fetchBlogPost(params.slug as string)
    }
  }, [params.slug])

  const fetchBlogPost = async (slug: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/blog/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else {
        setError('Blog yazısı bulunamadı')
      }
    } catch (error) {
      console.error('Blog post fetch error:', error)
      setError('Blog yazısı yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const sharePost = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link kopyalandı!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Blog yazısı yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Hata!</p>
              <p>{error || 'Blog yazısı bulunamadı'}</p>
            </div>
            <Link 
              href="/blog"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Blog'a Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 bg-gray-200">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
              {post.category}
            </span>
            <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
            <div className="flex items-center text-white text-sm">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {post.author}
              </div>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
              </div>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {post.readTime} dk okuma
              </div>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.viewCount} görüntüleme
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Blog'a Dön
            </Link>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share Button */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={sharePost}
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Paylaş
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 