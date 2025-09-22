import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Logger } from '@/lib/utils/logger'
import { rateLimit, createRateLimitResponse } from '@/lib/security/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Rate limiting kontrolü
  const rateLimitResult = rateLimit(request, '/api/admin/business-login');
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.allowed,
      rateLimitResult.remainingAttempts,
      rateLimitResult.resetTime,
      rateLimitResult.blocked
    );
  }

  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre zorunlu.' }, { status: 400 })
    }

    // Business hesabını bul - Raw SQL kullanarak mevcut alanları getir
    const businessResult = await prisma.$queryRaw`
      SELECT id, email, businessName, contactName, contactSurname, password, isActive, createdAt, updatedAt
      FROM Business 
      WHERE email = ${email.toLowerCase().trim()}
    `
    
    const business = businessResult.length > 0 ? businessResult[0] : null

    if (!business) {
      Logger.security('Business login attempt for non-existent account', { 
        email: email?.substring(0, 3) + '***',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 })
    }

    // Hesap aktiflik durumunu kontrol et
    if (!business.isActive) {
      return NextResponse.json({ error: 'Hesabınız aktif değil. Lütfen destek ile iletişime geçin.' }, { status: 403 })
    }

    // Şifreyi doğrula
    const passwordMatch = await bcrypt.compare(password, business.password)
    if (!passwordMatch) {
      Logger.security('Business login attempt with invalid password', { 
        businessId: business.id,
        email: business.email?.substring(0, 3) + '***',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 })
    }

    // Başarılı giriş - updatedAt tarihini güncelle
    await prisma.$queryRaw`
      UPDATE Business 
      SET updatedAt = NOW() 
      WHERE id = ${business.id}
    `

    Logger.info('Business login successful', { 
      businessId: business.id,
      businessName: business.businessName,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })

    // Başarılı yanıt
    const response = NextResponse.json({
      success: true,
      user: {
        id: business.id,
        email: business.email,
        name: business.contactName,
        surname: business.contactSurname,
        businessName: business.businessName,
        role: 'BUSINESS_ADMIN',
        lastLoginAt: new Date().toISOString()
      }
    })

    // Session cookie ayarla
    response.cookies.set('session_business', business.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 gün
    })

    return response

  } catch (error) {
    Logger.error('Business login error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })
    return NextResponse.json({ error: 'Giriş yapılırken bir hata oluştu.' }, { status: 500 })
  }
}
