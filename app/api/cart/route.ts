import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '../utils'

// NOT: Şimdilik userId olmadan, ileride authentication ile güncellenebilir

// GET: Sepeti getir
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }
  // Kullanıcıya ait sepeti getir
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })
  return NextResponse.json(cart)
}

// POST: Sepete ürün ekle
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }
  const body = await request.json()
  const { productId, quantity, size, color } = body

  // Kullanıcıya ait sepeti bul veya oluştur
  let cart = await prisma.cart.findFirst({ where: { userId } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } })
  }

  // Aynı ürün, beden, renk varsa miktarı artır
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      size,
      color
    }
  })

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        size,
        color
      }
    })
  }

  // Güncel sepeti dön
  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })
  return NextResponse.json(updatedCart)
}

// PUT: Sepet ürününü güncelle
export async function PUT(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }
  const body = await request.json()
  const { itemId, quantity } = body

  // itemId gerçekten bu kullanıcıya mı ait kontrolü
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true }
  })
  if (!item || item.cart.userId !== userId) {
    return NextResponse.json({ error: 'Yetkisiz işlem.' }, { status: 403 })
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity }
  })

  return NextResponse.json(updatedItem)
}

// DELETE: Sepetten ürün çıkar
export async function DELETE(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }
  const body = await request.json()
  const { itemId } = body

  // itemId gerçekten bu kullanıcıya mı ait kontrolü
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true }
  })
  if (!item || item.cart.userId !== userId) {
    return NextResponse.json({ error: 'Yetkisiz işlem.' }, { status: 403 })
  }

  await prisma.cartItem.delete({
    where: { id: itemId }
  })

  return NextResponse.json({ success: true })
}
