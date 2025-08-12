import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '../utils'

// GET: Kullanıcı profil bilgilerini getir
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      phone: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 })
  }

  return NextResponse.json(user)
}

// PUT: Kullanıcı profil bilgilerini güncelle
export async function PUT(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }

  const body = await request.json()
  const { name, surname, phone } = body

  // Validasyon
  if (!name || !surname) {
    return NextResponse.json({ error: 'Ad ve soyad zorunludur.' }, { status: 400 })
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      surname,
      phone
    },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      phone: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return NextResponse.json(updatedUser)
}
