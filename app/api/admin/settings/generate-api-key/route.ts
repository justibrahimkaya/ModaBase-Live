import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST: Yeni API anahtarı oluştur
export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // Güvenli API anahtarı oluştur
    const apiKey = 'mk_' + crypto.randomBytes(32).toString('hex')

    // Gerçek uygulamada burada API anahtarını veritabanına kaydedersiniz
    // ve environment variable'ı güncellersiniz
    
    return NextResponse.json({ 
      success: true,
      apiKey: apiKey,
      message: 'Yeni API anahtarı oluşturuldu'
    })
  } catch (error) {
    console.error('API key generation error:', error)
    return NextResponse.json({ error: 'API anahtarı oluşturulamadı' }, { status: 500 })
  }
} 