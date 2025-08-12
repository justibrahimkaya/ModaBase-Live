import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pbkdf2Sync, randomBytes } from 'crypto'
import { rateLimit, createRateLimitResponse } from '@/lib/security/rateLimit'
import { Logger } from '@/lib/utils/logger'
import { AuthSecurity } from '@/lib/security/auth'

// Şifre hash'leme
function hashPassword(password: string) {
  const salt = randomBytes(32).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting kontrolü
    const rateLimitResult = rateLimit(request, '/api/auth/register');
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.allowed,
        rateLimitResult.remainingAttempts,
        rateLimitResult.resetTime,
        rateLimitResult.blocked
      );
    }

    const { email, password, name, surname, phone } = await request.json()
    
    Logger.debug('Registration attempt', { 
      email: email?.substring(0, 3) + '***',
      hasName: !!name,
      hasSurname: !!surname,
      hasPhone: !!phone 
    })
    
    // Enhanced validation
    const emailValidation = AuthSecurity.validateEmail(email)
    if (!emailValidation.valid) {
      Logger.security('Registration attempt with invalid email', { 
        email: email?.substring(0, 3) + '***',
        reason: emailValidation.reason,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      return NextResponse.json({ error: emailValidation.reason }, { status: 400 })
    }
    
    const passwordValidation = AuthSecurity.validatePassword(password)
    if (!passwordValidation.valid) {
      Logger.security('Registration attempt with weak password', { 
        email: email?.substring(0, 3) + '***',
        reason: passwordValidation.reason,
        score: passwordValidation.score,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      return NextResponse.json({ error: passwordValidation.reason }, { status: 400 })
    }
    
    // Sanitize inputs
    const sanitizedName = AuthSecurity.sanitizeInput(name)
    const sanitizedSurname = AuthSecurity.sanitizeInput(surname)
    const sanitizedPhone = phone ? AuthSecurity.sanitizeInput(phone) : undefined
    
    if (!sanitizedName || !sanitizedSurname) {
      return NextResponse.json({ error: 'Ad ve soyad alanları zorunlu.' }, { status: 400 })
    }
    
    // Check for suspicious activity
    if (AuthSecurity.detectSuspiciousActivity(request)) {
      return NextResponse.json({ error: 'Şüpheli aktivite tespit edildi.' }, { status: 429 })
    }
    
    // E-posta benzersiz mi?
    const normalizedEmail = email.toLowerCase().trim()
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      Logger.security('Registration attempt with existing email', { 
        email: normalizedEmail?.substring(0, 3) + '***',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      return NextResponse.json({ error: 'Bu e-posta ile zaten kayıtlı bir kullanıcı var.' }, { status: 409 })
    }
    
    // Şifreyi hash'le
    const passwordHash = hashPassword(password)
    
    // Kullanıcıyı kaydet
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: sanitizedName,
        surname: sanitizedSurname,
        phone: sanitizedPhone || null
      }
    })
    
    Logger.info('User registered successfully', { userId: user.id })
    
    // Şifre hash'i ve hassas alanlar dönülmez
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      phone: user.phone
    })
    
  } catch (error) {
    Logger.error('Registration API error', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
