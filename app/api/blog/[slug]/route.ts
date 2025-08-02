import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Belirli bir blog yazısını getir
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        author: true,
        publishedAt: true,
        tags: true,
        image: true,
        readTime: true,
        category: true,
        viewCount: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      )
    }

    // Görüntüleme sayısını artır
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return NextResponse.json(
      { error: 'Blog yazısı yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 