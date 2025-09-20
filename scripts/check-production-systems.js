console.log('🔍 PRODUCTION SİSTEMLERİ KONTROL EDİLİYOR...\n');

// Environment Variables Kontrol
console.log('📋 ENVIRONMENT VARIABLES:');
console.log('PAYTR_MERCHANT_ID:', process.env.PAYTR_MERCHANT_ID || '❌ Tanımlı değil');
console.log('PAYTR_MERCHANT_KEY:', process.env.PAYTR_MERCHANT_KEY ? '✅ Tanımlı' : '❌ Tanımlı değil');
console.log('PAYTR_MERCHANT_SALT:', process.env.PAYTR_MERCHANT_SALT ? '✅ Tanımlı' : '❌ Tanımlı değil');
console.log('PAYTR_TEST_MODE:', process.env.PAYTR_TEST_MODE || 'false');
console.log('KARGONOMI_BEARER_TOKEN:', process.env.KARGONOMI_BEARER_TOKEN ? '✅ Tanımlı' : '❌ Tanımlı değil');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('');

// PayTR Durumu
console.log('💳 PAYTR ÖDEME SİSTEMİ:');
if (process.env.PAYTR_MERCHANT_ID === '596379') {
  console.log('⚠️  TEST MERCHANT ID kullanılıyor!');
  console.log('   Bu gerçek ödeme almayacak, sadece test yapacak.');
} else if (process.env.PAYTR_MERCHANT_ID) {
  console.log('✅ Gerçek merchant ID kullanılıyor');
} else {
  console.log('❌ PayTR merchant ID tanımlı değil!');
}

if (process.env.PAYTR_TEST_MODE === 'true') {
  console.log('⚠️  TEST MODE aktif!');
  console.log('   Gerçek ödeme almayacak.');
} else {
  console.log('✅ PRODUCTION MODE aktif');
  console.log('   Gerçek ödeme alacak!');
}
console.log('');

// Kargonomi Durumu
console.log('🚚 KARGONOMI API:');
if (process.env.KARGONOMI_BEARER_TOKEN) {
  console.log('✅ Bearer token tanımlı');
  console.log('   Gerçek kargo fiyatları hesaplanacak');
} else {
  console.log('❌ Bearer token tanımlı değil!');
  console.log('   Mock fiyatlar kullanılacak');
}
console.log('');

// Genel Durum
console.log('📊 GENEL DURUM:');
if (process.env.NODE_ENV === 'production') {
  console.log('✅ PRODUCTION ortamı');
} else {
  console.log('⚠️  DEVELOPMENT ortamı');
}

// Kritik Uyarılar
console.log('\n🚨 KRİTİK UYARILAR:');
let warnings = 0;

if (process.env.PAYTR_MERCHANT_ID === '596379') {
  console.log(`${++warnings}. PayTR test merchant ID kullanılıyor - gerçek ödeme almayacak!`);
}

if (process.env.PAYTR_TEST_MODE === 'true') {
  console.log(`${++warnings}. PayTR test mode aktif - gerçek ödeme almayacak!`);
}

if (!process.env.KARGONOMI_BEARER_TOKEN) {
  console.log(`${++warnings}. Kargonomi API token yok - mock fiyatlar kullanılacak!`);
}

if (process.env.NODE_ENV !== 'production') {
  console.log(`${++warnings}. Development ortamında çalışıyor!`);
}

if (warnings === 0) {
  console.log('✅ Tüm sistemler production için hazır!');
} else {
  console.log(`\n⚠️  ${warnings} adet kritik uyarı var!`);
  console.log('   Bu sistemler gerçek müşteriler için uygun değil.');
}

console.log('\n🎯 ÖNERİLER:');
if (process.env.PAYTR_MERCHANT_ID === '596379') {
  console.log('1. PayTR ile gerçek merchant hesabı açın');
  console.log('2. Gerçek merchant bilgilerini environment\'a ekleyin');
}

if (!process.env.KARGONOMI_BEARER_TOKEN) {
  console.log('3. Kargonomi API token alın ve environment\'a ekleyin');
}

if (process.env.NODE_ENV !== 'production') {
  console.log('4. NODE_ENV=production olarak ayarlayın');
} 