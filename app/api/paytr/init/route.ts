import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// PayTR Konfigürasyonu (Gizli anahtarlarda ASLA fallback kullanma)
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || '';
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || '';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || '';
const PAYTR_TEST_MODE = false; // GERÇEK ORTAM - Test modu kapalı
const PAYTR_BASE_URL = 'https://www.paytr.com/odeme/api/get-token';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 PayTR init başlatıldı - GERÇEK SATIŞ ORTAMI');
    console.log('🌐 Request URL:', request.url);
    console.log('🔧 Request Method:', request.method);
    console.log('📋 Request Headers:', Object.fromEntries(request.headers.entries()));
    console.log('📋 Environment değerleri:');
    console.log(`   PAYTR_MERCHANT_ID: ${PAYTR_MERCHANT_ID ? '[SET]' : '[NOT SET]'}`);
    console.log(`   PAYTR_MERCHANT_KEY: ${PAYTR_MERCHANT_KEY ? '[SET]' : '[NOT SET]'}`);
    console.log(`   PAYTR_MERCHANT_SALT: ${PAYTR_MERCHANT_SALT ? '[SET]' : '[NOT SET]'}`);
    console.log(`   PAYTR_TEST_MODE: ${PAYTR_TEST_MODE}`);

    // Zorunlu env kontrolü
    if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
      return NextResponse.json({
        success: false,
        error: 'Missing PayTR credentials on server (merchant_id/key/salt)'
      }, { status: 500 });
    }
    
    const body = await request.json();
    console.log('📥 Request body:', JSON.stringify(body, null, 2));
    
    // Zorunlu alanları kontrol et
    if (!body.merchant_oid || !body.amount || !body.email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: merchant_oid, amount, email'
      }, { status: 400 });
    }

    // PayTR parametrelerini hazırla
    const paymentAmount = Math.round(parseFloat(body.amount) * 100).toString(); // Kuruş cinsinden
    
    // Müşterinin mevcut kurulumuyla uyumluluk: merchant_oid'i olduğu gibi kullan
    // (PayTR panelinizde daha önce bu şekilde satış yapılmış)
    const merchantOid = String(body.merchant_oid);
    
    // IP adresini isteğin gerçek IP'sinden al (body'deki değeri kullanma)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]
      || request.headers.get('x-real-ip')
      || '127.0.0.1'

    const params = new URLSearchParams();
    params.append('merchant_id', PAYTR_MERCHANT_ID);
    params.append('user_ip', clientIp);
    params.append('merchant_oid', merchantOid);
    params.append('email', body.email);
    params.append('payment_amount', paymentAmount); // ✅ DÜZELTME: payment_amount (kuruş)
    // params.append('paytr_token', ''); // PayTR token parametresi kaldırıldı
    params.append('user_name', body.user_name || 'Test User');
    params.append('user_address', body.user_address || 'Test Address');
    params.append('user_phone', body.user_phone || '05301234567');
    // PayTR panelinde ayarlı olan gerçek URL'i kullan
    const baseUrl = 'https://moda-base-live.vercel.app';
    params.append('merchant_ok_url', body.merchant_ok_url || `${baseUrl}/order/${merchantOid}?status=success`);
    params.append('merchant_fail_url', body.merchant_fail_url || `${baseUrl}/order/${merchantOid}?status=failed`);
    // ✅ PAYTR RESMİ PARAMETRELERİ
    const testModeValue = PAYTR_TEST_MODE ? '1' : '0';
    const userBasket = JSON.stringify([['Sipariş', paymentAmount, 1]]);
    const userBasketBase64 = Buffer.from(userBasket).toString('base64');
    const noInstallment = '0';
    const maxInstallment = '0';
    const currency = 'TL';
    
    params.append('timeout_limit', '30');
    params.append('currency', currency);
    params.append('no_installment', noInstallment);
    params.append('max_installment', maxInstallment);
    params.append('user_basket', userBasketBase64); // ✅ Base64 encoded
    params.append('debug_on', '0'); // Gerçek ortamda debug kapalı
    params.append('test_mode', testModeValue);
    params.append('lang', 'tr'); // ✅ PAYTR RESMİ: lang parametresi

    // ✅ PAYTR RESMİ HASH FORMÜLÜ (Python kodundan)
    
    // ✅ PAYTR RESMİ NODE.JS HASH FORMÜLÜ:
    // var hashSTR = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    // user_basket BASE64 ENCODED olarak hash'e girer!
    const hashStr = `${PAYTR_MERCHANT_ID}${clientIp}${merchantOid}${body.email}${paymentAmount}${userBasketBase64}${noInstallment}${maxInstallment}${currency}${testModeValue}`;
    
    // ✅ PAYTR RESMİ NODE.JS KODU (app.js'den birebir):
    // var paytr_token = hashSTR + merchant_salt;
    // var token = crypto.createHmac('sha256', merchant_key).update(paytr_token).digest('base64');
    const paytrTokenStr = hashStr + PAYTR_MERCHANT_SALT;
    const paytrToken = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(paytrTokenStr).digest('base64');
    
    console.log('🔐 Hash hesaplama:');
    console.log(`   merchant_oid: ${merchantOid}`);
    console.log(`   Test Mode: ${testModeValue}`);
    console.log(`   User Basket: ${userBasket}`);
    console.log(`   Hash String: [MASKED]`);
    console.log(`   PayTR Token: [MASKED]`);
    
    params.append('paytr_token', paytrToken);

    console.log('📤 PayTR API\'ye gönderilen parametreler:');
    for (const [key, value] of params.entries()) {
      if (key === 'paytr_token') {
        console.log(`   ${key}: [MASKED]`);
        continue;
      }
      console.log(`   ${key}: ${value}`);
    }

    // PayTR API'ye istek gönder
    console.log(`🌐 PayTR API endpoint: ${PAYTR_BASE_URL}`);
    
    const paytrResponse = await fetch(PAYTR_BASE_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ModaBase/1.0'
      },
      body: params.toString()
    });

    console.log(`📡 PayTR Response status: ${paytrResponse.status}`);
    console.log(`📡 PayTR Response headers: ${JSON.stringify(Object.fromEntries(paytrResponse.headers.entries()))}`);

    // Response kontrolü
    if (!paytrResponse.ok) {
      console.error(`❌ PayTR API HTTP error: ${paytrResponse.status} ${paytrResponse.statusText}`);
      return NextResponse.json({
        success: false,
        error: `PayTR API HTTP error: ${paytrResponse.status}`,
        detail: paytrResponse.statusText
      }, { status: 500 });
    }

    // Response text'i al
    const responseText = await paytrResponse.text();
    console.log(`📄 PayTR Response text: ${responseText}`);

    // Boş response kontrolü
    if (!responseText || responseText.trim() === '') {
      console.error('❌ PayTR API boş response döndü');
      return NextResponse.json({
        success: false,
        error: 'PayTR API returned empty response',
        detail: 'No data received from PayTR'
      }, { status: 500 });
    }

    // JSON parse etmeyi dene
    let paytrData;
    try {
      paytrData = JSON.parse(responseText);
      console.log('✅ JSON parse başarılı:', paytrData);
    } catch (parseError) {
      console.error('❌ JSON parse hatası:', parseError);
      console.error('❌ Raw response:', responseText);
      return NextResponse.json({
        success: false,
        error: 'PayTR API returned invalid JSON',
        detail: responseText.substring(0, 500), // İlk 500 karakter
        parseError: parseError instanceof Error ? parseError.message : 'Parse error'
      }, { status: 500 });
    }

    // PayTR success kontrolü
    if (paytrData.status === 'success') {
      console.log('✅ PayTR token başarılı');
      return NextResponse.json({
        success: true,
        token: paytrData.token,
        paytr_url: 'https://www.paytr.com/odeme/guvenli/'
      });
    } else {
      console.error('❌ PayTR token başarısız:', paytrData);
      return NextResponse.json({
        success: false,
        error: paytrData.reason || 'PayTR token generation failed',
        detail: paytrData
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ PayTR init error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'PayTR initialization failed',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
