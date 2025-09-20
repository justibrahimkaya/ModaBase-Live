import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET: Tüm kullanıcıları getir
export async function GET(request: NextRequest) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        provider: true,
        emailVerified: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Users fetch error:', error)
    return NextResponse.json({ error: 'Kullanıcılar getirilemedi: ' + error.message }, { status: 500 })
  }
}

// PUT: Kullanıcı güncelle
export async function PUT(request: NextRequest) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli.' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        provider: true,
        emailVerified: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('User update error:', error)
    return NextResponse.json({ error: 'Kullanıcı güncellenemedi: ' + error.message }, { status: 500 })
  }
}

// DELETE: Kullanıcı sil
export async function DELETE(request: NextRequest) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli.' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Kullanıcı silindi' })
  } catch (error: any) {
    console.error('User delete error:', error)
    return NextResponse.json({ error: 'Kullanıcı silinemedi: ' + error.message }, { status: 500 })
  }
}
