const https = require('https');

function testLivePayTR() {
  console.log('🔄 Canlı PayTR API Testi Başlatılıyor...');
  
  const testData = {
    merchant_oid: 'TEST' + Date.now(),
    amount: '10',
    email: 'test@modabase.com.tr',
    user_ip: '127.0.0.1',
    user_name: 'Test User',
    user_address: 'Test Address',
    user_phone: '05301234567'
  };

  console.log('📦 Test Verisi:', testData);

  const postData = JSON.stringify(testData);

  const options = {
    hostname: 'modabase.com.tr',
    port: 443,
    path: '/api/paytr/init',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'ModaBase-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log('📡 Response Status:', res.statusCode, res.statusMessage);
    console.log('📡 Response Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Raw Response:', data);

      if (data) {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ JSON Parse Başarılı:', jsonData);
          
          if (jsonData.status === 'success' || jsonData.success) {
            console.log('🎉 PayTR Token Başarılı!');
          } else {
            console.log('❌ PayTR Token Başarısız:', jsonData.error || jsonData.reason);
          }
        } catch (parseError) {
          console.log('❌ JSON Parse Hatası:', parseError.message);
          console.log('📄 Raw Response:', data);
        }
      } else {
        console.log('❌ Boş Response');
      }
    });
  });

  req.on('error', (error) => {
    console.error('💥 Request Hatası:', error.message);
  });

  req.write(postData);
  req.end();
}

testLivePayTR(); 