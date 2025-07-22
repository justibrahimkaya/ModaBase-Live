import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface AdminUser {
  id: string
  email: string
  name: string
  surname: string
  role: string
  isActive: boolean
}

export async function getAdminUser(request: NextRequest): Promise<AdminUser | null> {
  try {
    // Check for site admin session
    const userCookie = request.cookies.get('session_user')
    if (userCookie?.value) {
      const userId = userCookie.value
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          role: true,
          isActive: true
        }
      })

      if (user && user.isActive && user.role === 'ADMIN') {
        return {
          ...user,
          name: user.name || '',
          surname: user.surname || ''
        }
      }
    }

    // Check for business admin session
    const businessCookie = request.cookies.get('session_business')
    if (businessCookie?.value) {
      const businessId = businessCookie.value
      
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          email: true,
          contactName: true,
          contactSurname: true,
          isActive: true,
          adminStatus: true
        }
      })

      if (business && business.isActive && business.adminStatus === 'APPROVED') {
        return {
          id: business.id,
          email: business.email,
          name: business.contactName || '',
          surname: business.contactSurname || '',
          role: 'BUSINESS_ADMIN',
          isActive: business.isActive
        }
      }
    }

    return null
  } catch (error) {
    console.error('Admin auth error:', error)
    return null
  }
}

export async function getSuperAdminUser(request: NextRequest): Promise<AdminUser | null> {
  try {
    // Only check for site admin session (super admin)
    const userCookie = request.cookies.get('session_user')
    if (userCookie?.value) {
      const userId = userCookie.value
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          role: true,
          isActive: true
        }
      })

      if (user && user.isActive && user.role === 'ADMIN') {
        return {
          ...user,
          name: user.name || '',
          surname: user.surname || ''
        }
      }
    }

    return null
  } catch (error) {
    console.error('Super admin auth error:', error)
    return null
  }
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const adminUser = await getAdminUser(request)
  
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Admin yetkisi gerekli' },
      { status: 401 }
    )
  }

  return null
}

export async function requireSuperAdmin(request: NextRequest): Promise<NextResponse | null> {
  const adminUser = await getSuperAdminUser(request)
  
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Süper admin yetkisi gerekli' },
      { status: 401 }
    )
  }

  return null
}

export async function requireAdminOrModerator(request: NextRequest): Promise<NextResponse | null> {
  const adminUser = await getAdminUser(request)
  
  if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'MODERATOR')) {
    return NextResponse.json(
      { error: 'Yetki gerekli' },
      { status: 401 }
    )
  }

  return null
}

export async function requireBusinessAdmin(request: NextRequest): Promise<NextResponse | { businessId: string } | null> {
  const adminUser = await getAdminUser(request)
  
  if (!adminUser) {
    return NextResponse.json(
      { error: 'İşletme admin yetkisi gerekli' },
      { status: 401 }
    )
  }

  // Sadece BUSINESS_ADMIN rolüne sahip kullanıcılar
  if (adminUser.role !== 'BUSINESS_ADMIN') {
    return NextResponse.json(
      { error: 'İşletme admin yetkisi gerekli' },
      { status: 401 }
    )
  }

  // İşletme ID'sini döndür
  return { businessId: adminUser.id }
}
