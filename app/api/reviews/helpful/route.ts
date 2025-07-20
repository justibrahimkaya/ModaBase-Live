import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST: Yararlı/yararsız oy ver
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, isHelpful } = body

    if (!reviewId || typeof isHelpful !== 'boolean') {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 })
    }

    // Kullanıcı ID'sini al
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Kullanıcının kendi yorumuna oy veremez
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true }
    })

    if (!review) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })
    }

    if (review.userId === user.id) {
      return NextResponse.json({ error: 'Kendi yorumunuza oy veremezsiniz' }, { status: 400 })
    }

    // Mevcut oy var mı?
    const existingVote = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId: user.id
        }
      }
    })

    if (existingVote) {
      if (existingVote.isHelpful === isHelpful) {
        // Aynı oy, sil
        await prisma.reviewHelpful.delete({
          where: { id: existingVote.id }
        })
        
        return NextResponse.json({ 
          message: 'Oyunuz kaldırıldı',
          action: 'removed'
        })
      } else {
        // Farklı oy, güncelle
        await prisma.reviewHelpful.update({
          where: { id: existingVote.id },
          data: { isHelpful }
        })
        
        return NextResponse.json({ 
          message: 'Oyunuz güncellendi',
          action: 'updated'
        })
      }
    } else {
      // Yeni oy
      await prisma.reviewHelpful.create({
        data: {
          reviewId,
          userId: user.id,
          isHelpful
        }
      })
      
      return NextResponse.json({ 
        message: 'Oyunuz kaydedildi',
        action: 'created'
      })
    }

  } catch (error) {
    console.error('Review helpful vote error:', error)
    return NextResponse.json({ error: 'Oy verilirken hata oluştu' }, { status: 500 })
  }
}

// GET: Kullanıcının belirli yorumlara verdiği oyları getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })
    }

    // Kullanıcı ID'sini al
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const reviewIds = searchParams.get('reviewIds')?.split(',') || []

    if (reviewIds.length === 0) {
      return NextResponse.json({ votes: {} })
    }

    const votes = await prisma.reviewHelpful.findMany({
      where: {
        reviewId: { in: reviewIds },
        userId: user.id
      },
      select: {
        reviewId: true,
        isHelpful: true
      }
    })

    const voteMap: Record<string, boolean> = {}
    votes.forEach(vote => {
      voteMap[vote.reviewId] = vote.isHelpful
    })

    return NextResponse.json({ votes: voteMap })

  } catch (error) {
    console.error('Review helpful votes GET error:', error)
    return NextResponse.json({ error: 'Oylar getirilirken hata oluştu' }, { status: 500 })
  }
}
