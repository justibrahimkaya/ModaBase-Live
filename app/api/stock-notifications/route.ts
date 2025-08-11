import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '../utils'

export const dynamic = 'force-dynamic'

// GET: Kullanıcının stok bildirimleri
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }

    const notifications = await prisma.userStockNotification.findMany({
      where: { 
        userId,
        isActive: true 
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
            minStockLevel: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Stock notifications error:', error)
    return NextResponse.json(
      { error: 'Stok bildirimleri alınamadı' },
      { status: 500 }
    )
  }
}

// POST: Stok bildirimi ekle
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    const { productId, guestEmail } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 })
    }

    // Kayıtlı kullanıcı veya misafir email kontrolü
    if (!userId && !guestEmail) {
      return NextResponse.json({ error: 'Giriş yapın veya email adresi girin' }, { status: 400 })
    }

    // Ürün kontrolü
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stock: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
    }

    // Stok varsa bildirim gerekli değil
    if (product.stock > 0) {
      return NextResponse.json({ error: 'Ürün stokta mevcut' }, { status: 400 })
    }

    // Mevcut bildirim kontrolü
    const existingNotification = await prisma.userStockNotification.findFirst({
      where: {
        productId,
        ...(userId ? { userId } : { guestEmail }),
        isActive: true
      }
    })

    if (existingNotification) {
      return NextResponse.json({ error: 'Bu ürün için zaten bildirim talebiniz var' }, { status: 409 })
    }

    // Yeni bildirim oluştur
    const notification = await prisma.userStockNotification.create({
      data: {
        productId,
        ...(userId ? { userId } : {}),
        guestEmail: userId ? undefined : guestEmail,
        isActive: true
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${product.name} ürünü için stok bildirimi oluşturuldu`,
      notification
    })
  } catch (error) {
    console.error('Stock notification creation error:', error)
    return NextResponse.json(
      { error: 'Stok bildirimi oluşturulamadı' },
      { status: 500 }
    )
  }
}

// DELETE: Stok bildirimi iptal et
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }

    // Bildirimi bul ve sil
    const notification = await prisma.userStockNotification.findFirst({
      where: {
        productId,
        userId,
        isActive: true
      }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Stok bildirimi bulunamadı' }, { status: 404 })
    }

    await prisma.userStockNotification.update({
      where: { id: notification.id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Stok bildirimi iptal edildi'
    })
  } catch (error) {
    console.error('Stock notification deletion error:', error)
    return NextResponse.json(
      { error: 'Stok bildirimi iptal edilemedi' },
      { status: 500 }
    )
  }
}
 