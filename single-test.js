// Tek PayTR Test - Alt çizgi olmadan
console.log('🔍 Tek PayTR Test Başlatılıyor...');

// TEK TEST - Alt çizgi olmadan
const singleTestData = {
  merchant_oid: 'TEST1753366577120', // Alt çizgi YOK!
  amount: '10',
  email: 'test@modabase.com.tr',
  user_ip: '127.0.0.1',
  user_name: 'Test User',
  user_address: 'Test Address',
  user_phone: '05301234567'
};

console.log('📦 Tek Test Verisi:', singleTestData);
console.log('🔍 merchant_oid kontrolü:', singleTestData.merchant_oid);
console.log('✅ Alt çizgi var mı?', singleTestData.merchant_oid.includes('_') ? 'EVET - YANLIŞ!' : 'HAYIR - DOĞRU!');

// PayTR API'yi test et
fetch('/api/paytr/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(singleTestData)
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

console.log('✅ Tek test tamamlandı!'); 