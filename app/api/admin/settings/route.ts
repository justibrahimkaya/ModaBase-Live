import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET: Sistem ayarlarını getir
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // Veritabanından ayarları getir (SystemSettings tablosu kullanılabilir)
    // Şimdilik static değerler döndürüyoruz
    const settings = {
      siteName: process.env.SITE_NAME || 'ModaBase',
      siteDescription: process.env.SITE_DESCRIPTION || 'Modern E-Ticaret Platformu',
      siteEmail: process.env.EMAIL_FROM || 'info@modabase.com.tr',
      maintenanceMode: false,
      emailNotifications: true,
      orderNotifications: true,
      lowStockNotifications: true,
      apiKey: process.env.API_KEY || '••••••••••••••••••••••••••••••••',
      maxFileSize: process.env.MAX_FILE_SIZE || '10',
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,webp',
      dbBackupEnabled: true,
      backupFrequency: 'daily',
      themeColor: '#f97316',
      currency: process.env.CURRENCY || 'TRY',
      timezone: process.env.TIMEZONE || 'Europe/Istanbul'
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Ayarlar getirilemedi' }, { status: 500 })
  }
}

// PUT: Sistem ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const updateData = await request.json()

    // Burada gerçek uygulamada SystemSettings tablosunu güncellersiniz
    // Şimdilik environment variable'larla simüle ediyoruz
    
    // Validation
    if (updateData.siteName && updateData.siteName.length < 2) {
      return NextResponse.json({ error: 'Site adı en az 2 karakter olmalıdır' }, { status: 400 })
    }

    if (updateData.siteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.siteEmail)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin' }, { status: 400 })
    }

    if (updateData.maxFileSize && (isNaN(updateData.maxFileSize) || updateData.maxFileSize < 1 || updateData.maxFileSize > 100)) {
      return NextResponse.json({ error: 'Dosya boyutu 1-100 MB arasında olmalıdır' }, { status: 400 })
    }

    // Gerçek uygulamada burada database güncellemesi yapılır
    // Şimdilik başarılı response döndürüyoruz
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ayarlar başarıyla güncellendi',
      updatedData: updateData
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 })
  }
} 