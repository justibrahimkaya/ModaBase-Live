import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// POST - Mesaja cevap gönder
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { reply, recipientEmail } = body

    if (!reply || !reply.trim()) {
      return NextResponse.json(
        { error: 'Cevap metni gerekli' },
        { status: 400 }
      )
    }

    // Mesajı veritabanında güncelle
    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        adminReply: reply,
        status: 'REPLIED',
        repliedAt: new Date(),
        adminId: 'admin' // Bu kısmı gerçek admin ID ile değiştirin
      },
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Müşteriye cevap e-postası gönder
    try {
      await sendReplyEmail(updatedMessage, reply, recipientEmail)
    } catch (emailError) {
      console.error('Cevap e-postası gönderilemedi:', emailError)
      // E-posta hatası işlemi durdurmaz
    }

    return NextResponse.json({
      success: true,
      message: 'Cevabınız başarıyla gönderildi'
    })

  } catch (error) {
    console.error('Reply send error:', error)
    return NextResponse.json(
      { error: 'Cevap gönderilirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Müşteriye cevap e-postası gönder
async function sendReplyEmail(message: any, reply: string, recipientEmail: string) {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP ayarları bulunamadı, e-posta gönderilmiyor')
    return
  }

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
    from: 'ModaBase <info@modabase.com.tr>',
    to: recipientEmail,
    subject: `Re: ${message.subject} - ModaBase Cevabı`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; margin: 0; font-size: 28px; font-weight: bold;">ModaBase</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Müşteri Hizmetleri</p>
          </div>
          
          <div style="border-left: 4px solid #8B5CF6; padding-left: 20px; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 10px 0;">Sayın ${message.firstName} ${message.lastName},</h2>
            <p style="color: #666; margin: 0;">Mesajınıza cevabımız aşağıdadır:</p>
          </div>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Orijinal Mesajınız:</h3>
            <p style="color: #666; font-style: italic; margin: 0; padding: 10px; background: white; border-radius: 5px;">
              "${message.message}"
            </p>
          </div>
          
          <div style="background: #8B5CF6; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; font-size: 16px;">Cevabımız:</h3>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px;">
              ${reply.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #666; margin: 0 0 15px 0;">Başka sorularınız için bizimle iletişime geçebilirsiniz:</p>
            <div style="display: inline-block; margin: 0 15px;">
              <a href="https://wa.me/905362971255" style="color: #25D366; text-decoration: none; font-weight: bold;">
                📱 WhatsApp: (0536) 297 1255
              </a>
            </div>
            <div style="display: inline-block; margin: 0 15px;">
              <a href="mailto:info@modabase.com.tr" style="color: #8B5CF6; text-decoration: none; font-weight: bold;">
                📧 info@modabase.com.tr
              </a>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
            <p style="margin: 0;">ModaBase - Kadın Giyim</p>
            <p style="margin: 5px 0 0 0;">Malkoçoğlu Mah. 305/1 Sokak No:17/A Sultangazi/İstanbul</p>
          </div>
        </div>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}