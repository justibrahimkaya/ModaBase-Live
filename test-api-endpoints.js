const https = require('https');

function testEndpoint(endpoint) {
  console.log(`\n🔍 Testing: ${endpoint}`);
  
  const options = {
    hostname: 'moda-base-live.vercel.app',
    port: 443,
    path: endpoint,
    method: 'GET',
    headers: {
      'User-Agent': 'ModaBase-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
    console.log(`   Content-Type: ${res.headers['content-type']}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (data.length > 200) {
        console.log(`   Response: ${data.substring(0, 200)}...`);
      } else {
        console.log(`   Response: ${data}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`   Error: ${error.message}`);
  });

  req.end();
}

console.log('🔍 API Endpoint Testleri Başlatılıyor...');

// Test edilecek endpoint'ler
const endpoints = [
  '/api/paytr/init',
  '/api/paytr/notification',
  '/api/test-email',
  '/api/orders',
  '/api/products'
];

endpoints.forEach(testEndpoint);

console.log('\n✅ Test tamamlandı!'); 