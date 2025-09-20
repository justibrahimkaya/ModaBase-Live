import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET: Belirli bir kullanıcının detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        provider: true,
        emailVerified: true,
        image: true,
        adminStatus: true,
        appliedAt: true,
        approvedAt: true,
        rejectedAt: true,
        rejectionReason: true,
        businessInfo: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('User detail fetch error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri getirilemedi: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE: Kullanıcı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Prevent deleting super admin users
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Site admin kullanıcıları silinemez' },
        { status: 403 }
      )
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname
      }
    })

  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Kullanıcı silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 