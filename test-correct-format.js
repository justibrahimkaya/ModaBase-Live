// Doğru merchant_oid format testi
// Bu script'i browser console'da çalıştır (F12 > Console)

console.log('🔍 Doğru Format Testi Başlatılıyor...');

// DOĞRU FORMAT - alt çizgi olmadan
const correctTestData = {
  merchant_oid: 'TEST' + Date.now().toString().replace(/[^a-zA-Z0-9]/g, ''),
  amount: '10',
  email: 'test@modabase.com.tr',
  user_ip: '127.0.0.1',
  user_name: 'Test User',
  user_address: 'Test Address',
  user_phone: '05301234567'
};

console.log('📦 Doğru Test Verisi:', correctTestData);
console.log('🔍 merchant_oid format kontrolü:', correctTestData.merchant_oid);
console.log('✅ Alt çizgi var mı?', correctTestData.merchant_oid.includes('_') ? 'EVET - YANLIŞ!' : 'HAYIR - DOĞRU!');

// PayTR API'yi test et
fetch('/api/paytr/init', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'User-Agent': 'ModaBase-Correct-Format/1.0'
  },
  body: JSON.stringify(correctTestData)
})
.then(response => {
  console.log('📡 Response Status:', response.status, response.statusText);
  return response.text();
})
.then(data => {
  console.log('📄 Raw Response:', data);
  
  if (data) {
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ JSON Parse Başarılı:', jsonData);
      
      if (jsonData.status === 'success' || jsonData.success) {
        console.log('🎉 PayTR Token Başarılı!');
        console.log('Token:', jsonData.token);
      } else {
        console.log('❌ PayTR Token Başarısız!');
        console.log('Error:', jsonData.error);
        console.log('Reason:', jsonData.reason);
      }
    } catch (parseError) {
      console.log('❌ JSON Parse Hatası:', parseError.message);
    }
  }
})
.catch(error => {
  console.error('💥 Fetch Hatası:', error);
});

console.log('✅ Test tamamlandı!'); 