// PayTR URL Debug Script
console.log('🔍 PayTR URL Debug Başlatılıyor...');

// Test token (örnek)
const testToken = 'test_token_123456';

// PayTR URL'lerini test et
const paytrUrls = [
  `https://www.paytr.com/odeme/guvenli/${testToken}`,
  `https://www.paytr.com/odeme/guvenli/${testToken}/`,
  `https://www.paytr.com/odeme/guvenli?token=${testToken}`,
  `https://www.paytr.com/odeme/guvenli/${testToken}?lang=tr`,
  `https://www.paytr.com/odeme/guvenli/${testToken}?test=1`
];

console.log('📋 Test edilecek PayTR URL\'leri:');
paytrUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

// Canlı token'ı almak için API'yi test et
const testPaytrRequest = {
  merchant_oid: 'TEST1753366577120',
  amount: '10',
  email: 'test@modabase.com.tr',
  user_ip: '127.0.0.1',
  user_name: 'Test User',
  user_address: 'Test Address',
  user_phone: '05301234567'
};

console.log('🚀 PayTR API test isteği gönderiliyor...');
console.log('📦 Request data:', testPaytrRequest);

fetch('/api/paytr/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testPaytrRequest)
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
      
      if (jsonData.success && jsonData.token) {
        console.log('🎉 PayTR Token Alındı!');
        console.log('Token:', jsonData.token);
        
        // URL'leri test et
        const actualUrl = `https://www.paytr.com/odeme/guvenli/${jsonData.token}`;
        console.log('🔗 PayTR URL:', actualUrl);
        
        // İframe test et
        console.log('🧪 İframe test için:');
        console.log(`<iframe src="${actualUrl}" width="100%" height="600"></iframe>`);
        
        // URL'i yeni sekmede aç
        console.log('🌐 URL\'i yeni sekmede açmak için:');
        console.log(`window.open('${actualUrl}', '_blank')`);
        
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

console.log('✅ Debug script tamamlandı!'); 