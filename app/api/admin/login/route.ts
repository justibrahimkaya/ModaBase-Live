import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pbkdf2Sync } from 'crypto'
import bcrypt from 'bcryptjs'
import { Logger } from '@/lib/utils/logger'
import { rateLimit, createRateLimitResponse } from '@/lib/security/rateLimit'

export const dynamic = 'force-dynamic'

// Şifre doğrulama (PBKDF2 format: pbkdf2_sha512$iterations$salt$hash)
function verifyPassword(password: string, passwordHash: string) {
  if (!passwordHash || typeof passwordHash !== 'string') {
    return false
  }
  
  // PBKDF2 formatını kontrol et
  if (passwordHash.startsWith('pbkdf2_sha512$')) {
    const parts = passwordHash.split('$')
    if (parts.length !== 4) return false
    
    const [, iterations, salt, storedHash] = parts
    if (!salt || !iterations || !storedHash) return false
    
    const hashToVerify = pbkdf2Sync(password, salt, parseInt(iterations), 64, 'sha512').toString('hex')
    return storedHash === hashToVerify
  }
  
  // Eski format (salt:hash) - backward compatibility
  if (passwordHash.includes(':')) {
    const [salt, hash] = passwordHash.split(':')
    if (!salt || !hash) return false
    
    const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === hashToVerify
  }
  
  return false
}

export async function POST(request: NextRequest) {
  // Rate limiting kontrolü
  const rateLimitResult = rateLimit(request, '/api/admin/login');
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.allowed,
      rateLimitResult.remainingAttempts,
      rateLimitResult.resetTime,
      rateLimitResult.blocked
    );
  }

  const { email, password } = await request.json()
  
  if (!email || !password) {
    return NextResponse.json({ error: 'E-posta ve şifre zorunlu.' }, { status: 400 })
  }

  try {
    // First check if it's a site admin (User table)
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        passwordHash: true,
        role: true,
        isActive: true
      }
    })

    if (user && user.passwordHash && user.role === 'ADMIN') {
      if (!user.isActive) {
        return NextResponse.json({ error: 'Hesabınız aktif değil.' }, { status: 401 })
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 })
      }

      // Site admin login successful - set cookie
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname,
          role: 'SITE_ADMIN'
        }
      })

      // Set session cookie for admin
      response.cookies.set('session_user', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return response
    }

    // Check if it's a business owner (Business table)
    const business = await prisma.business.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        businessName: true,
        contactName: true,
        contactSurname: true,
        password: true,
        adminStatus: true,
        isActive: true,
        approvedAt: true,
        rejectionReason: true
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 })
    }

    // Check admin approval status
    if (business.adminStatus === 'PENDING') {
      return NextResponse.json({ 
        error: 'Başvurunuz henüz değerlendirilmedi. 48 saat içinde email ile bilgilendirileceksiniz.',
        status: 'PENDING'
      }, { status: 403 })
    }

    if (business.adminStatus === 'REJECTED') {
      return NextResponse.json({ 
        error: `Başvurunuz reddedildi. Sebep: ${business.rejectionReason || 'Belirtilmemiş'}`,
        status: 'REJECTED'
      }, { status: 403 })
    }

    if (business.adminStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Hesap durumunuz bilinmiyor. Lütfen destek ile iletişime geçin.' }, { status: 403 })
    }

    if (!business.isActive) {
      return NextResponse.json({ error: 'Hesabınız aktif değil.' }, { status: 401 })
    }

    // Verify password (Business uses bcrypt)
    const passwordMatch = await bcrypt.compare(password, business.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 })
    }

    // Business login successful - update last login
    await prisma.business.update({
      where: { id: business.id },
      data: { lastLoginAt: new Date() }
    })

    // Business login successful - set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: business.id,
        email: business.email,
        name: business.contactName,
        surname: business.contactSurname,
        businessName: business.businessName,
        role: 'BUSINESS_ADMIN'
      }
    })

    // Set session cookie for business admin
    response.cookies.set('session_business', business.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    Logger.error('Admin login error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      email: email?.substring(0, 3) + '***',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })
    return NextResponse.json({ error: 'Giriş yapılırken bir hata oluştu.' }, { status: 500 })
  }
}
