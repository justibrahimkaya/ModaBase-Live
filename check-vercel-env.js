// Vercel Environment Variables Kontrol
console.log('🔍 Vercel Environment Variables Kontrol Başlatılıyor...');

// Canlı siteden environment variables'ları kontrol et
fetch('/api/test-db')
.then(response => {
  console.log('📡 Test DB Response Status:', response.status);
  return response.text();
})
.then(data => {
  console.log('📄 Test DB Response:', data);
  
  // PayTR environment variables'larını kontrol et
  console.log('🔧 PayTR Environment Variables:');
  console.log('   PAYTR_MERCHANT_ID:', process.env.PAYTR_MERCHANT_ID || 'NOT SET');
  console.log('   PAYTR_MERCHANT_KEY:', process.env.PAYTR_MERCHANT_KEY ? 'SET' : 'NOT SET');
  console.log('   PAYTR_MERCHANT_SALT:', process.env.PAYTR_MERCHANT_SALT ? 'SET' : 'NOT SET');
  console.log('   PAYTR_TEST_MODE:', process.env.PAYTR_TEST_MODE || 'NOT SET');
  console.log('   PAYTR_NOTIFICATION_URL:', process.env.PAYTR_NOTIFICATION_URL || 'NOT SET');
  
  // Rate limiting kontrolü
  console.log('🛡️ Rate Limiting Kontrolü:');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
  
})
.catch(error => {
  console.error('💥 Hata:', error);
});

console.log('✅ Environment kontrol tamamlandı!'); 