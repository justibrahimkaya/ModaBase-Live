// PayTR Notification Manuel Test
console.log('🔧 PayTR Notification Manuel Test Başlatılıyor...');

// Test verileri
const testData = {
  merchant_oid: 'TEST' + Date.now(),
  status: 'success',
  total_amount: '1000',
  hash: 'test_hash',
  payment_type: 'test',
  failed_reason_msg: ''
};

console.log('📦 Test verisi:', testData);

// Notification endpoint'ini test et
fetch('/api/paytr/notification', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams(testData)
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
      
      if (jsonData.status === 'success') {
        console.log('🎉 Notification başarılı!');
        console.log('Order ID:', jsonData.orderId);
        console.log('Amount:', jsonData.amount);
      } else {
        console.log('❌ Notification başarısız!');
        console.log('Error:', jsonData.message);
      }
    } catch (parseError) {
      console.log('❌ JSON Parse Hatası:', parseError.message);
    }
  }
})
.catch(error => {
  console.error('💥 Fetch Hatası:', error);
});

console.log('✅ Manuel test tamamlandı!'); 