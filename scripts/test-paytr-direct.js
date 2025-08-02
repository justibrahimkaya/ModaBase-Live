const crypto = require('crypto');

// PayTR Test Konfigürasyonu
const PAYTR_MERCHANT_ID = '596379';
const PAYTR_MERCHANT_KEY = 'srMxKnSgipN1Z1Td';
const PAYTR_MERCHANT_SALT = 'TzXLtjFSuyDPsi8B';
const PAYTR_TEST_MODE = true; // TEST MODU - deneme
const PAYTR_BASE_URL = 'https://www.paytr.com/odeme/api/get-token';

async function testPayTR() {
  try {
    console.log('🔄 PayTR Direkt API Testi Başlatılıyor...');
    console.log('📋 Konfigürasyon:');
    console.log(`   MERCHANT_ID: ${PAYTR_MERCHANT_ID}`);
    console.log(`   TEST_MODE: ${PAYTR_TEST_MODE}`);
    console.log(`   ENDPOINT: ${PAYTR_BASE_URL}`);
    
    // Test parametreleri
    const testOrder = {
      merchant_oid: 'TEST' + Date.now(), // ✅ DÜZELTME: Alt çizgi yok
      amount: '1000', // 10 TL test (kuruş cinsinden)
      email: 'test@modabase.com.tr',
      user_ip: '127.0.0.1',
      user_name: 'Test User',
      user_address: 'Test Address',
      user_phone: '05301234567'
    };
    
    console.log('📦 Test Siparişi:', testOrder);

    // PayTR parametrelerini hazırla
    const params = new URLSearchParams();
    params.append('merchant_id', PAYTR_MERCHANT_ID);
    params.append('merchant_key', PAYTR_MERCHANT_KEY); // ✅ PAYTR RESMİ: merchant_key gönderilmeli
    params.append('merchant_salt', PAYTR_MERCHANT_SALT); // ✅ PAYTR RESMİ: merchant_salt gönderilmeli
    params.append('user_ip', testOrder.user_ip);
    params.append('merchant_oid', testOrder.merchant_oid);
    params.append('email', testOrder.email);
    params.append('payment_amount', testOrder.amount); // ✅ DÜZELTME: payment_amount
    // params.append('paytr_token', ''); // PayTR token kaldırıldı
    params.append('user_name', testOrder.user_name);
    params.append('user_address', testOrder.user_address);
    params.append('user_phone', testOrder.user_phone);
    params.append('merchant_ok_url', 'https://www.modabase.com.tr/success');
    params.append('merchant_fail_url', 'https://www.modabase.com.tr/fail');
    params.append('timeout_limit', '30');
    params.append('currency', 'TL');
    params.append('no_installment', '0');
    params.append('max_installment', '0');
    params.append('user_basket', Buffer.from(JSON.stringify([['Test Ürün', testOrder.amount, 1]])).toString('base64')); // ✅ Base64
    params.append('debug_on', '1');
    params.append('test_mode', PAYTR_TEST_MODE ? '1' : '0');
    params.append('lang', 'tr'); // ✅ PAYTR RESMİ: lang parametresi

    // Hash hesaplama - CRITICAL!
    const testModeValue = PAYTR_TEST_MODE ? '1' : '0';
    const userBasket = JSON.stringify([['Test Ürün', testOrder.amount, 1]]);
    
    // ✅ PAYTR RESMİ HASH FORMÜLÜ (Python dokümantasyonundan)
    const noInstallment = '0';
    const maxInstallment = '0';
    const currency = 'TL';
    // ✅ PAYTR RESMİ NODE.JS HASH FORMÜLÜ (app.js'den):
    // var hashSTR = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    // user_basket BASE64 ENCODED olarak hash'e girer!
    const userBasketBase64 = Buffer.from(userBasket).toString('base64');
    const hashStr = `${PAYTR_MERCHANT_ID}${testOrder.user_ip}${testOrder.merchant_oid}${testOrder.email}${testOrder.amount}${userBasketBase64}${noInstallment}${maxInstallment}${currency}${testModeValue}`;
    
    // ✅ PAYTR RESMİ NODE.JS KODU (app.js'den birebir):
    // var paytr_token = hashSTR + merchant_salt;
    // var token = crypto.createHmac('sha256', merchant_key).update(paytr_token).digest('base64');
    const paytrTokenStr = hashStr + PAYTR_MERCHANT_SALT;
    const paytrToken = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(paytrTokenStr).digest('base64');
    
    console.log('🔐 Hash Hesaplama:');
    console.log(`   Test Mode: ${testModeValue}`);
    console.log(`   User Basket: ${userBasket}`);
    console.log(`   Hash String: ${hashStr}`);
    console.log(`   PayTR Token: ${paytrToken}`);
    
    params.append('paytr_token', paytrToken);

    console.log('\n📤 PayTR\'ye Gönderilen Parametreler:');
    for (const [key, value] of params.entries()) {
      if (key === 'hash') {
        console.log(`   ${key}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    }

    // PayTR API'ye istek gönder
    console.log(`\n🌐 PayTR API İsteği Gönderiliyor...`);
    
    const response = await fetch(PAYTR_BASE_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ModaBase-Test/1.0'
      },
      body: params.toString()
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()));

    // Response'u al
    const responseText = await response.text();
    console.log(`\n📄 PayTR Raw Response:`);
    console.log(responseText);

    // JSON parse dene
    if (responseText.trim()) {
      try {
        const data = JSON.parse(responseText);
        console.log(`\n✅ JSON Parse Başarılı:`);
        console.log(JSON.stringify(data, null, 2));
        
        if (data.status === 'success') {
          console.log(`\n🎉 PayTR Token Başarılı! Token: ${data.token}`);
        } else {
          console.log(`\n❌ PayTR Hatası: ${data.reason || 'Bilinmeyen hata'}`);
        }
      } catch (parseError) {
        console.log(`\n❌ JSON Parse Hatası: ${parseError.message}`);
        console.log('Raw response yukarıda gösterildi.');
      }
    } else {
      console.log(`\n❌ Boş Response!`);
    }

  } catch (error) {
    console.error('💥 Test Hatası:', error);
  }
}

// Test'i çalıştır
testPayTR(); 