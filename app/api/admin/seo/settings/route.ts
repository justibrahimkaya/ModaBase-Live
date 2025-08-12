import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// SEO ayarlarını getir
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seoSettings = await prisma.sEOSettings.findMany({
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    return NextResponse.json(seoSettings)
  } catch (error) {
    console.error('SEO settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    )
  }
}

// Yeni SEO ayarı oluştur
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      pageType,
      pageId,
      pageSlug,
      metaTitle,
      metaDescription,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      structuredData,
      canonicalUrl,
      robotsMeta,
      hreflang,
      googleAnalyticsId,
      googleTagManagerId,
      facebookPixelId,
      isActive,
      priority
    } = body

    // SEO skoru hesapla
    const seoScore = calculateSEOScore({
      metaTitle,
      metaDescription,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      structuredData
    })

    const seoSettings = await prisma.sEOSettings.create({
      data: {
        pageType,
        pageId,
        pageSlug,
        metaTitle,
        metaDescription,
        keywords,
        ogTitle,
        ogDescription,
        ogImage,
        ogType,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
        structuredData,
        canonicalUrl,
        robotsMeta,
        hreflang,
        googleAnalyticsId,
        googleTagManagerId,
        facebookPixelId,
        isActive: isActive ?? true,
        priority: priority ?? 0,
        seoScore,
        lastAuditDate: new Date()
      }
    })

    return NextResponse.json(seoSettings)
  } catch (error) {
    console.error('SEO settings create error:', error)
    return NextResponse.json(
      { error: 'Failed to create SEO settings' },
      { status: 500 }
    )
  }
}

// SEO skoru hesaplama fonksiyonu
function calculateSEOScore(data: {
  metaTitle: string
  metaDescription: string
  keywords: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  structuredData?: string
}): number {
  let score = 0
  const maxScore = 100

  // Meta Title (25 puan)
  if (data.metaTitle) {
    score += Math.min(25, data.metaTitle.length * 0.5)
  }

  // Meta Description (20 puan)
  if (data.metaDescription) {
    score += Math.min(20, data.metaDescription.length * 0.2)
  }

  // Keywords (15 puan)
  if (data.keywords) {
    score += Math.min(15, data.keywords.split(',').length * 2)
  }

  // Open Graph (20 puan)
  if (data.ogTitle) score += 5
  if (data.ogDescription) score += 5
  if (data.ogImage) score += 5
  if (data.ogType) score += 5

  // Structured Data (20 puan)
  if (data.structuredData) {
    try {
      JSON.parse(data.structuredData)
      score += 20
    } catch {
      // Geçersiz JSON
    }
  }

  return Math.min(maxScore, Math.round(score))
} 