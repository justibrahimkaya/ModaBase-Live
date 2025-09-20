import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Blog yazılarını getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {
      isPublished: true
    }

    if (category) {
      where.category = category
    }

    if (tag) {
      where.tags = {
        has: tag
      }
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit,
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

    const total = await prisma.blogPost.count({ where })

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Blog posts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

// Yeni blog yazısı oluştur (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      author,
      tags,
      image,
      category,
      isPublished = false
    } = body

    // Slug oluştur
    const generatedSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Okuma süresini hesapla (ortalama 200 kelime/dakika)
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: generatedSlug,
        excerpt,
        content,
        author,
        tags,
        image,
        category,
        readTime,
        isPublished,
        publishedAt: isPublished ? new Date() : null
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Blog post create error:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
} 