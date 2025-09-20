import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// POST - Yeni iletişim mesajı oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, subject, message, businessId } = body

    // Validasyon
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    // Database'e kaydet
    const contactMessage = await prisma.contactMessage.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        subject,
        message,
        businessId: businessId || null, // İşletme ID'si varsa ekle
        status: 'PENDING'
      }
    })

    // Admin'e bildirim e-postası gönder (opsiyonel)
    try {
      await sendAdminNotification(contactMessage)
    } catch (emailError) {
      console.error('Admin bildirim e-postası gönderilemedi:', emailError)
      // E-posta hatası mesajı kaydetmeyi engellemez
    }

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      id: contactMessage.id
    })

  } catch (error) {
    console.error('Contact message creation error:', error)
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// GET - İletişim mesajlarını listele (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    
    const skip = (page - 1) * limit

    // Filtreleme
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.contactMessage.count({ where })
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Contact messages fetch error:', error)
    return NextResponse.json(
      { error: 'Mesajlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Admin'e bildirim e-postası gönder
async function sendAdminNotification(message: any) {
  // E-posta gönderimi (opsiyonel)
  if (!process.env.SMTP_HOST) return

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: 'info@modabase.com.tr',
    subject: `Yeni İletişim Mesajı: ${message.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px;">
          Yeni İletişim Mesajı
        </h2>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Ad Soyad:</strong> ${message.firstName} ${message.lastName}</p>
          <p><strong>E-posta:</strong> ${message.email}</p>
          <p><strong>Telefon:</strong> ${message.phone || 'Belirtilmemiş'}</p>
          <p><strong>Konu:</strong> ${message.subject}</p>
          <p><strong>Mesaj:</strong></p>
          <div style="background: white; padding: 15px; border-left: 4px solid #8B5CF6; margin-top: 10px;">
            ${message.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Bu mesaja admin panelinden cevap verebilirsiniz.
        </p>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}