// PayTR API Debug Script
// Bu script'i browser console'da çalıştır (F12 > Console)

console.log('🔍 PayTR API Debug Başlatılıyor...');

// Test verisi
const testData = {
  merchant_oid: 'TEST' + Date.now().toString().replace(/[^a-zA-Z0-9]/g, ''), // Alt çizgi olmadan
  amount: '10',
  email: 'test@modabase.com.tr',
  user_ip: '127.0.0.1',
  user_name: 'Test User',
  user_address: 'Test Address',
  user_phone: '05301234567'
};

console.log('📦 Test Verisi:', testData);

// PayTR API'yi test et
fetch('/api/paytr/init', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'User-Agent': 'ModaBase-Debug/1.0'
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Response Status:', response.status, response.statusText);
  console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
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
        console.log('Full Response:', jsonData);
      }
    } catch (parseError) {
      console.log('❌ JSON Parse Hatası:', parseError.message);
      console.log('📄 Raw Response:', data);
    }
  } else {
    console.log('❌ Boş Response');
  }
})
.catch(error => {
  console.error('💥 Fetch Hatası:', error);
  console.error('Error Details:', error.message);
});

console.log('✅ Debug script tamamlandı!'); 