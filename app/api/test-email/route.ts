import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email gerekli' }, { status: 400 })
    }

    // Email servisi başlat
    console.log('📧 Test email için EmailService başlatılıyor...');
    console.log('📧 Environment değişkenleri:', {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS ? '***SET***' : 'MISSING',
      EMAIL_FROM: process.env.EMAIL_FROM
    });
    
    EmailService.initialize({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
        pass: process.env.SMTP_PASS || 'yqarfkyevahfnenq'
      }
    })

    // Test email gönder
    const testToken = 'test-reset-token-' + Date.now()
    const success = await EmailService.sendPasswordResetEmail(email, testToken)

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email başarıyla gönderildi',
        email: email,
        environment: {
          smtp_host: process.env.SMTP_HOST,
          smtp_port: process.env.SMTP_PORT,
          smtp_user: process.env.SMTP_USER,
          smtp_pass: process.env.SMTP_PASS ? '***SET***' : 'MISSING',
          email_from: process.env.EMAIL_FROM,
          node_env: process.env.NODE_ENV
        }
      })
    } else {
      return NextResponse.json({ 
        error: 'Email gönderilemedi',
        environment: {
          smtp_host: process.env.SMTP_HOST,
          smtp_port: process.env.SMTP_PORT,
          smtp_user: process.env.SMTP_USER,
          smtp_pass: process.env.SMTP_PASS ? '***SET***' : 'MISSING',
          email_from: process.env.EMAIL_FROM,
          node_env: process.env.NODE_ENV
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Email test hatası:', error)
    return NextResponse.json({ 
      error: 'Email test hatası',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        smtp_host: process.env.SMTP_HOST,
        smtp_port: process.env.SMTP_PORT,
        smtp_user: process.env.SMTP_USER,
        smtp_pass: process.env.SMTP_PASS ? '***SET***' : 'MISSING',
        email_from: process.env.EMAIL_FROM,
        node_env: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
}

export async function GET() {
  // Environment değişkenlerini kontrol et
  const envCheck = {
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT,
    smtp_user: process.env.SMTP_USER,
    smtp_pass: process.env.SMTP_PASS ? '***SET***' : 'MISSING',
    email_from: process.env.EMAIL_FROM,
    node_env: process.env.NODE_ENV,
    app_url: process.env.NEXT_PUBLIC_APP_URL
  }

  const issues = []
  
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST !== 'smtp.gmail.com') {
    issues.push('SMTP_HOST hatalı veya eksik')
  }
  
  if (!process.env.SMTP_PORT || process.env.SMTP_PORT !== '587') {
    issues.push('SMTP_PORT hatalı veya eksik')
  }
  
  if (!process.env.SMTP_USER || !process.env.SMTP_USER.includes('@')) {
    issues.push('SMTP_USER hatalı veya eksik')
  }
  
  if (!process.env.SMTP_PASS || process.env.SMTP_PASS.length < 16) {
    issues.push('SMTP_PASS eksik veya çok kısa (Gmail App Password gerekli)')
  }
  
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_FROM.includes('@')) {
    issues.push('EMAIL_FROM hatalı veya eksik')
  }

  return NextResponse.json({
    environment: envCheck,
    status: issues.length === 0 ? 'READY' : 'ISSUES',
    issues: issues,
    ready: issues.length === 0
  })
} 