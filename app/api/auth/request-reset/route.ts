import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/emailService'
import { randomBytes } from 'crypto'
import { rateLimit, createRateLimitResponse } from '@/lib/security/rateLimit'

export async function POST(request: NextRequest) {
  // Rate limiting kontrolü
  const rateLimitResult = rateLimit(request, '/api/auth/request-reset');
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.allowed,
      rateLimitResult.remainingAttempts,
      rateLimitResult.resetTime,
      rateLimitResult.blocked
    );
  }

  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'E-posta zorunlu.' }, { status: 400 })
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Güvenlik için her zaman aynı yanıtı dön
    return NextResponse.json({ success: true })
  }
  // Token ve expiry üret
  const token = randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 1000 * 60 * 30) // 30 dakika geçerli
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry
    }
  })
  
  // E-posta servisi başlat
  EmailService.initialize({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
      pass: process.env.SMTP_PASS || 'yqarfkyevahfnenq'
    }
  })
  
  // Şifre sıfırlama e-postası gönder
  try {
    await EmailService.sendPasswordResetEmail(email, token)
    console.log('Şifre sıfırlama e-postası başarıyla gönderildi:', email)
  } catch (emailError) {
    console.error('Şifre sıfırlama e-postası gönderilemedi:', emailError)
    // E-posta gönderimi başarısız olsa bile kullanıcıya başarılı yanıt dön
  }
  
  return NextResponse.json({ success: true })
}
