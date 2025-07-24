import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// PayTR Konfigürasyonu
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || '596379';
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'srMxKnSgipN1Z1Td';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'TzXLtjFSuyDPsi8B';
const PAYTR_TEST_MODE = process.env.PAYTR_TEST_MODE === 'true';
const PAYTR_BASE_URL = PAYTR_TEST_MODE 
  ? 'https://www.paytr.com/odeme/api/get-token' 
  : 'https://www.paytr.com/odeme/api/get-token';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 PayTR init başlatıldı - CANLI ORTAM');
    console.log('🌐 Request URL:', request.url);
    console.log('🔧 Request Method:', request.method);
    console.log('📋 Request Headers:', Object.fromEntries(request.headers.entries()));
    console.log('📋 Environment değerleri:');
    console.log(`   PAYTR_MERCHANT_ID: ${PAYTR_MERCHANT_ID}`);
    console.log(`   PAYTR_MERCHANT_KEY: ${PAYTR_MERCHANT_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`   PAYTR_MERCHANT_SALT: ${PAYTR_MERCHANT_SALT ? 'SET' : 'NOT SET'}`);
    console.log(`   PAYTR_TEST_MODE: ${PAYTR_TEST_MODE}`);
    
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
    
    // ✅ DÜZELTME: merchant_oid'den özel karakterleri temizle (PayTR alfanumerik istiyor)
    // Alt çizgi (_) ve diğer özel karakterleri kaldır
    const sanitizedMerchantOid = body.merchant_oid.replace(/[^a-zA-Z0-9]/g, '');
    
    const params = new URLSearchParams();
    params.append('merchant_id', PAYTR_MERCHANT_ID);
    params.append('merchant_key', PAYTR_MERCHANT_KEY); // ✅ PAYTR RESMİ: merchant_key gönderilmeli
    params.append('merchant_salt', PAYTR_MERCHANT_SALT); // ✅ PAYTR RESMİ: merchant_salt gönderilmeli
    params.append('user_ip', body.user_ip || '127.0.0.1');
    params.append('merchant_oid', sanitizedMerchantOid);
    params.append('email', body.email);
    params.append('payment_amount', paymentAmount); // ✅ DÜZELTME: payment_amount (kuruş)
    // params.append('paytr_token', ''); // PayTR token parametresi kaldırıldı
    params.append('user_name', body.user_name || 'Test User');
    params.append('user_address', body.user_address || 'Test Address');
    params.append('user_phone', body.user_phone || '05301234567');
    params.append('merchant_ok_url', body.merchant_ok_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.modabase.com.tr'}/order/${body.merchant_oid}?status=success`);
    params.append('merchant_fail_url', body.merchant_fail_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.modabase.com.tr'}/order/${body.merchant_oid}?status=failed`);
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
    params.append('debug_on', '1');
    params.append('test_mode', testModeValue);
    params.append('lang', 'tr'); // ✅ PAYTR RESMİ: lang parametresi

    // ✅ PAYTR RESMİ HASH FORMÜLÜ (Python kodundan)
    
    // ✅ PAYTR RESMİ NODE.JS HASH FORMÜLÜ:
    // var hashSTR = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    // user_basket BASE64 ENCODED olarak hash'e girer!
    const hashStr = `${PAYTR_MERCHANT_ID}${body.user_ip || '127.0.0.1'}${sanitizedMerchantOid}${body.email}${paymentAmount}${userBasketBase64}${noInstallment}${maxInstallment}${currency}${testModeValue}`;
    
    // ✅ PAYTR RESMİ NODE.JS KODU (app.js'den birebir):
    // var paytr_token = hashSTR + merchant_salt;
    // var token = crypto.createHmac('sha256', merchant_key).update(paytr_token).digest('base64');
    const paytrTokenStr = hashStr + PAYTR_MERCHANT_SALT;
    const paytrToken = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(paytrTokenStr).digest('base64');
    
    console.log('🔐 Hash hesaplama:');
    console.log(`   Original merchant_oid: ${body.merchant_oid}`);
    console.log(`   Sanitized merchant_oid: ${sanitizedMerchantOid}`);
    console.log(`   Test Mode: ${testModeValue}`);
    console.log(`   User Basket: ${userBasket}`);
    console.log(`   Hash String: ${hashStr.substring(0, 100)}...`);
    console.log(`   PayTR Token: ${paytrToken.substring(0, 20)}...`);
    
    params.append('paytr_token', paytrToken);

    console.log('📤 PayTR API\'ye gönderilen parametreler:');
    for (const [key, value] of params.entries()) {
      if (key === 'hash') {
        console.log(`   ${key}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
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
