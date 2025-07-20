import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/emailService'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // JSON formatında veri al (FormData değil)
    const {
      businessName,
      businessType,
      taxNumber,
      tradeRegistryNumber,
      email,
      phone,
      website,
      address,
      city,
      district,
      postalCode,
      contactName,
      contactSurname,
      contactTitle,
      contactPhone,
      contactEmail,
      password,
      confirmPassword,
      termsAccepted,
      privacyAccepted,
      marketingAccepted
    } = await request.json()

    // Detaylı validation
    if (!businessName?.trim()) {
      return NextResponse.json(
        { error: 'İşletme adı boş bırakılamaz' },
        { status: 400 }
      )
    }

    if (!businessType) {
      return NextResponse.json(
        { error: 'İşletme türü seçmelisiniz' },
        { status: 400 }
      )
    }

    if (!taxNumber?.trim()) {
      return NextResponse.json(
        { error: 'Vergi numarası boş bırakılamaz' },
        { status: 400 }
      )
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'E-posta adresi boş bırakılamaz' },
        { status: 400 }
      )
    }

    // E-posta format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: 'Telefon numarası boş bırakılamaz' },
        { status: 400 }
      )
    }

    if (!address?.trim()) {
      return NextResponse.json(
        { error: 'Adres boş bırakılamaz' },
        { status: 400 }
      )
    }

    if (!city?.trim()) {
      return NextResponse.json(
        { error: 'Şehir boş bırakılamaz' },
        { status: 400 }
      )
    }

    if (!contactName?.trim()) {
      return NextResponse.json(
        { error: 'Yetkili kişi adı boş bırakılamaz' },
        { status: 400 }
      )
    }

    if (!contactSurname?.trim()) {
      return NextResponse.json(
        { error: 'Yetkili kişi soyadı boş bırakılamaz' },
        { status: 400 }
      )
    }

    if (!contactEmail?.trim()) {
      return NextResponse.json(
        { error: 'Yetkili kişi e-posta adresi boş bırakılamaz' },
        { status: 400 }
      )
    }

    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Geçerli bir yetkili kişi e-posta adresi girin' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Şifre boş bırakılamaz' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Şifreler eşleşmiyor' },
        { status: 400 }
      )
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'Kullanım şartlarını kabul etmelisiniz' },
        { status: 400 }
      )
    }

    if (!privacyAccepted) {
      return NextResponse.json(
        { error: 'Gizlilik politikasını kabul etmelisiniz' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { email }
    })

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi ile zaten kayıtlı bir işletme bulunmaktadır' },
        { status: 400 }
      )
    }

    // Check if tax number already exists
    const existingTax = await prisma.business.findUnique({
      where: { taxNumber }
    })

    if (existingTax) {
      return NextResponse.json(
        { error: 'Bu vergi numarası ile zaten kayıtlı bir işletme bulunmaktadır' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // TODO: In a real application, you would:
    // 1. Upload files to cloud storage (AWS S3, etc.)
    // 2. Send verification email
    // 3. Create business approval workflow

    // For now, create business record in database
    const business = await prisma.business.create({
      data: {
        businessName,
        businessType,
        taxNumber,
        tradeRegistryNumber: tradeRegistryNumber || null,
        email,
        phone,
        website: website || null,
        address,
        city,
        district: district || null,
        postalCode: postalCode || null,
        contactName,
        contactSurname,
        contactTitle: contactTitle || null,
        contactPhone: contactPhone || null,
        contactEmail,
        password: hashedPassword,
        termsAccepted,
        privacyAccepted,
        marketingAccepted,
        // adminStatus: PENDING olarak default ayarlandı
        // appliedAt: now() olarak default ayarlandı
        isActive: false,
        emailVerified: false
      }
    })

    // Email servisi başlat
    EmailService.initialize({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
        pass: process.env.SMTP_PASS || 'yqarfkyevahfnenq'
      }
    })

    // Send application notification email to admin
    try {
      await EmailService.sendBusinessApplicationNotification({
        businessName,
        contactName,
        contactSurname,
        email,
        city,
        businessType
      })
      console.log('Admin notification email sent successfully')
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'İşletme başvurunuz başarıyla alındı. Başvurunuz 48 saat içinde değerlendirilecek ve sonuç e-posta ile bildirilecektir.',
      status: 'PENDING',
      businessId: business.id
    })

  } catch (error) {
    console.error('Business registration error:', error)
    return NextResponse.json(
      { error: 'Kayıt işlemi sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
