import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pbkdf2Sync } from 'crypto'
import { Logger } from '@/lib/utils/logger'
import { AuthSecurity } from '@/lib/security/auth'
import { rateLimit, createRateLimitResponse } from '@/lib/security/rateLimit'

// Şifre doğrulama
function verifyPassword(password: string, passwordHash: string) {
  const [salt, hash] = passwordHash.split(':')
  if (!salt || !hash) return false
  
  const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return hash === hashToVerify
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting kontrolü
    const rateLimitResult = rateLimit(request, '/api/auth/login');
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.allowed,
        rateLimitResult.remainingAttempts,
        rateLimitResult.resetTime,
        rateLimitResult.blocked
      );
    }

    const { email, password } = await request.json()
    const normalizedEmail = email?.toLowerCase().trim()
    
    // Enhanced input validation
    const emailValidation = AuthSecurity.validateEmail(email)
    if (!emailValidation.valid) {
      Logger.security('Login attempt with invalid email format', { 
        email: email?.substring(0, 3) + '***',
        reason: emailValidation.reason,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 })
    }
    
    if (!password) {
      Logger.security('Login attempt without password', { 
        email: email?.substring(0, 3) + '***',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      return NextResponse.json({ error: 'E-posta ve şifre zorunlu.' }, { status: 400 })
    }
    
    // Check for suspicious activity
    if (AuthSecurity.detectSuspiciousActivity(request)) {
      return NextResponse.json({ error: 'Şüpheli aktivite tespit edildi.' }, { status: 429 })
    }
    
    Logger.debug('Login attempt', { email: normalizedEmail?.substring(0, 3) + '***' })
    
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    
    if (!user || !user.passwordHash) {
      Logger.security('Login attempt for non-existent user', { 
        email: normalizedEmail?.substring(0, 3) + '***',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 })
    }
    
    const passwordValid = verifyPassword(password, user.passwordHash)
    
    if (!passwordValid) {
      Logger.security('Login attempt with invalid password', { 
        userId: user.id,
        email: user.email?.substring(0, 3) + '***',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 })
    }
    
    // Successful login
    Logger.info('User login successful', { userId: user.id })
    
    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      phone: user.phone
    })
    
    response.cookies.set('session_user', user.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 hafta
    })
    
    return response
    
  } catch (error) {
    Logger.error('Login API error', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
