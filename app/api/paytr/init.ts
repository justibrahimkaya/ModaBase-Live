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
    console.log('🔄 PayTR init başlatıldı');
    console.log('📋 Environment değerleri:');
    console.log(`   PAYTR_MERCHANT_ID: ${PAYTR_MERCHANT_ID}`);
    console.log(`   PAYTR_MERCHANT_KEY: ${PAYTR_MERCHANT_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`   PAYTR_MERCHANT_SALT: ${PAYTR_MERCHANT_SALT ? 'SET' : 'NOT SET'}`);
    console.log(`   PAYTR_TEST_MODE: ${PAYTR_TEST_MODE}`);
    
    const body = await request.json();
    console.log('📥 Request body:', JSON.stringify(body, null, 2));
    
    // Zorunlu alanları kontrol et
    const requiredFields = ['amount', 'email', 'user_ip', 'user_name', 'user_address', 'merchant_oid'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.error(`❌ Eksik alan: ${field}`);
        return NextResponse.json({ 
          success: false, 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    // PayTR için gerekli parametreler
    const params = new URLSearchParams();
    params.append('merchant_id', PAYTR_MERCHANT_ID);
    params.append('user_ip', body.user_ip);
    params.append('merchant_oid', body.merchant_oid);
    params.append('email', body.email);
    params.append('payment_amount', body.amount.toString());
    params.append('paytr_token', '');
    params.append('user_basket', body.user_basket || '[]');
    params.append('debug_on', PAYTR_TEST_MODE ? '1' : '0');
    params.append('no_installment', body.no_installment || '0');
    params.append('max_installment', body.max_installment || '0');
    params.append('user_name', body.user_name);
    params.append('user_address', body.user_address);
    params.append('user_phone', body.user_phone || '');
    params.append('merchant_ok_url', body.merchant_ok_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.modabase.com.tr'}/order/${body.merchant_oid}`);
    params.append('merchant_fail_url', body.merchant_fail_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.modabase.com.tr'}/order/${body.merchant_oid}?status=failed`);
    params.append('timeout_limit', body.timeout_limit || '30');
    params.append('currency', body.currency || 'TL');
    params.append('test_mode', PAYTR_TEST_MODE ? '1' : '0');

    // Hash hesaplama
    const hashStr = `${PAYTR_MERCHANT_ID}${body.user_ip}${body.merchant_oid}${body.email}${body.amount}${body.user_basket || '[]'}${body.no_installment || '0'}${body.max_installment || '0'}${body.currency || 'TL'}${body.test_mode || '0'}${PAYTR_MERCHANT_SALT}`;
    const hash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashStr).digest('base64');
    
    console.log('🔐 Hash hesaplama:');
    console.log(`   Hash String: ${hashStr.substring(0, 100)}...`);
    console.log(`   Hash: ${hash.substring(0, 20)}...`);
    
    params.append('hash', hash);

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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    console.log(`📡 PayTR Response status: ${paytrResponse.status}`);
    console.log(`📡 PayTR Response headers: ${JSON.stringify(Object.fromEntries(paytrResponse.headers.entries()))}`);

    // Response text'i al
    const responseText = await paytrResponse.text();
    console.log(`📄 PayTR Response text: ${responseText}`);

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
        detail: responseText,
        parseError: parseError instanceof Error ? parseError.message : 'Parse error'
      }, { status: 500 });
    }

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
