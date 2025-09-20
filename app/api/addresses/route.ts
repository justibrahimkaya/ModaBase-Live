import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '../utils'

// GET: Kullanıcının tüm adreslerini getir
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(addresses)
}

// POST: Yeni adres ekle
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }

  const body = await request.json()
  const {
    title,
    name,
    surname,
    email,
    phone,
    city,
    district,
    neighborhood,
    address,
    type,
    isDefault
  } = body

  // Validasyon
  if (!title || !name || !surname || !phone || !city || !district || !address) {
    return NextResponse.json({ error: 'Gerekli alanları doldurunuz.' }, { status: 400 })
  }

  // Eğer bu adres varsayılan olarak işaretleniyorsa, diğer adresleri varsayılan olmaktan çıkar
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    })
  }

  const newAddress = await prisma.address.create({
    data: {
      userId,
      title,
      name,
      surname,
      email,
      phone,
      city,
      district,
      neighborhood,
      address,
      type: type || 'DELIVERY',
      isDefault: isDefault || false
    }
  })

  return NextResponse.json(newAddress)
}

// PUT: Adres güncelle
export async function PUT(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }

  const body = await request.json()
  const {
    id,
    title,
    name,
    surname,
    email,
    phone,
    city,
    district,
    neighborhood,
    address,
    type,
    isDefault
  } = body

  // Adresin bu kullanıcıya ait olduğunu kontrol et
  const existingAddress = await prisma.address.findFirst({
    where: { id, userId }
  })

  if (!existingAddress) {
    return NextResponse.json({ error: 'Adres bulunamadı.' }, { status: 404 })
  }

  // Eğer bu adres varsayılan olarak işaretleniyorsa, diğer adresleri varsayılan olmaktan çıkar
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, id: { not: id } },
      data: { isDefault: false }
    })
  }

  const updatedAddress = await prisma.address.update({
    where: { id },
    data: {
      title,
      name,
      surname,
      email,
      phone,
      city,
      district,
      neighborhood,
      address,
      type,
      isDefault
    }
  })

  return NextResponse.json(updatedAddress)
}

// DELETE: Adres sil
export async function DELETE(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Adres ID gerekli.' }, { status: 400 })
  }

  // Adresin bu kullanıcıya ait olduğunu kontrol et
  const existingAddress = await prisma.address.findFirst({
    where: { id, userId }
  })

  if (!existingAddress) {
    return NextResponse.json({ error: 'Adres bulunamadı.' }, { status: 404 })
  }

  await prisma.address.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
