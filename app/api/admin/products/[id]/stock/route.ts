import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'
import { StockNotificationService } from '@/lib/stockNotificationService'

export const dynamic = 'force-dynamic'

// Stok güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stock, minStockLevel, maxStockLevel } = await request.json()

    // Eski stok seviyesini al
    const oldProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { stock: true }
    })

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        stock: stock || 0,
        minStockLevel: minStockLevel || 5,
        maxStockLevel: maxStockLevel || null
      }
    })

    // Stok hareketi kaydet
    await prisma.stockMovement.create({
      data: {
        productId: params.id,
        type: 'IN',
        quantity: stock || 0,
        description: 'Admin tarafından stok güncellendi'
      }
    })

    // Stok eklendiyse ve önceden stok yoksa bildirim gönder
    if (oldProduct && oldProduct.stock <= 0 && (stock || 0) > 0) {
      // Arka planda stok bildirimlerini gönder
      StockNotificationService.checkAndSendNotifications(params.id)
        .catch(error => console.error('Stock notification error:', error))
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Stock update error:', error)
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    )
  }
}

// Stok hareketleri listesi
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const movements = await prisma.stockMovement.findMany({
      where: { productId: params.id },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            trackingNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(movements)
  } catch (error) {
    console.error('Stock movements error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    )
  }
}
