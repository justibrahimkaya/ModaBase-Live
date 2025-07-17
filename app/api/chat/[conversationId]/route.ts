import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Belirli konuşmanın mesajlarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params
    const { searchParams } = new URL(request.url)
    const session = await getServerSession(authOptions)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    
    // Konuşmanın varlığını ve kullanıcı yetkilerini kontrol et
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        userId: true,
        guestName: true,
        guestEmail: true,
        subject: true,
        status: true,
        priority: true,
        department: true,
        isGuest: true,
        createdAt: true
      }
    })
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    
    // Yetki kontrolü
    let hasAccess = false
    
    if (session?.user?.id) {
      // Admin mi?
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })
      
      if (user?.role === 'ADMIN') {
        hasAccess = true
      } else if (conversation.userId === session.user.id) {
        hasAccess = true
      }
    }
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Mesajları getir
    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          senderId: true,
          senderType: true,
          content: true,
          messageType: true,
          isRead: true,
          readAt: true,
          createdAt: true
        }
      }),
      prisma.chatMessage.count({ where: { conversationId } })
    ])
    
    // Okunmamış mesajları işaretle
    if (session?.user?.id) {
      await prisma.chatMessage.updateMany({
        where: {
          conversationId,
          isRead: false,
          senderId: { not: session.user.id }
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
    }
    
    return NextResponse.json({
      conversation,
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get conversation messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Konuşma durumunu güncelle (sadece admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params
    const body = await request.json()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const { status, priority } = body
    
    const updatedConversation = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(status === 'closed' && { closedAt: new Date() })
      }
    })
    
    return NextResponse.json({ conversation: updatedConversation })
  } catch (error) {
    console.error('Update conversation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
