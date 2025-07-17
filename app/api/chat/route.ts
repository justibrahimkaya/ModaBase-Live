import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Mesaj gönderme schema'sı
const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  content: z.string().min(1).max(5000),
  messageType: z.enum(['text', 'image', 'file']).default('text'),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  department: z.string().default('general')
})

// Konuşma listesini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = await getServerSession(authOptions)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'all'
    
    const skip = (page - 1) * limit
    
    // Admin kullanıcılar için tüm konuşmalar
    if (session?.user && session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })
      
      if (user?.role === 'ADMIN') {
        const where = status !== 'all' ? { status } : {}
        
        const [conversations, total] = await Promise.all([
          prisma.chatConversation.findMany({
            where,
            orderBy: { lastMessageAt: 'desc' },
            skip,
            take: limit,
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
              lastMessageAt: true,
              createdAt: true,
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                  id: true,
                  content: true,
                  senderType: true,
                  createdAt: true
                }
              }
            }
          }),
          prisma.chatConversation.count({ where })
        ])
        
        return NextResponse.json({
          conversations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        })
      }
    }
    
    // Normal kullanıcılar için sadece kendi konuşmaları
    if (session?.user?.id) {
      const where = {
        userId: session.user.id,
        ...(status !== 'all' && { status })
      }
      
      const [conversations, total] = await Promise.all([
        prisma.chatConversation.findMany({
          where,
          orderBy: { lastMessageAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            subject: true,
            status: true,
            priority: true,
            department: true,
            lastMessageAt: true,
            createdAt: true,
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                content: true,
                senderType: true,
                createdAt: true
              }
            }
          }
        }),
        prisma.chatConversation.count({ where })
      ])
      
      return NextResponse.json({
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } catch (error) {
    console.error('Chat conversations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Yeni mesaj gönder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = sendMessageSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 })
    }
    
    const { conversationId, content, messageType, guestName, guestEmail, department } = validation.data
    const session = await getServerSession(authOptions)
    
    let conversation
    
    // Eğer conversationId yoksa yeni konuşma oluştur
    if (!conversationId) {
      if (session?.user?.id) {
        // Giriş yapmış kullanıcı
        conversation = await prisma.chatConversation.create({
          data: {
            userId: session.user.id,
            subject: 'Destek Talebi',
            department,
            isGuest: false,
            lastMessageAt: new Date()
          }
        })
      } else if (guestName && guestEmail) {
        // Misafir kullanıcı
        conversation = await prisma.chatConversation.create({
          data: {
            guestName,
            guestEmail,
            subject: 'Misafir Destek Talebi',
            department,
            isGuest: true,
            lastMessageAt: new Date()
          }
        })
      } else {
        return NextResponse.json({ error: 'User authentication or guest info required' }, { status: 400 })
      }
    } else {
      // Mevcut konuşmayı bul
      conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId }
      })
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
      
      // Kullanıcının bu konuşmaya erişim yetkisi var mı?
      if (conversation.userId && conversation.userId !== session?.user?.id) {
        // Admin kontrolü
        if (session?.user?.id) {
          const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
          })
          
          if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
          }
        } else {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }
      }
    }
    
    // Mesajı oluştur
    const message = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: session?.user?.id || null,
        senderType: session?.user?.id ? 
          (await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role === 'ADMIN' 
            ? 'admin' : 'user' 
          : 'user',
        content,
        messageType,
        isRead: false
      }
    })
    
    // Konuşmanın son mesaj zamanını güncelle
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    })
    
    // Real-time için mesaj detaylarını döndür
    const messageWithDetails = await prisma.chatMessage.findUnique({
      where: { id: message.id },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        senderType: true,
        content: true,
        messageType: true,
        isRead: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      message: messageWithDetails,
      conversationId: conversation.id
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
