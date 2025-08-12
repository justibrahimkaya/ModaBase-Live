const https = require('https');

console.log('🔒 Güvenlik başlıklarını kontrol ediliyor...\n');

const checkUrl = process.env.VERCEL_URL || 'https://moda-base-live.vercel.app';

https.get(checkUrl, (res) => {
  console.log('✅ HTTP Headers:\n');
  
  const securityHeaders = [
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'content-security-policy',
    'x-xss-protection',
    'referrer-policy',
    'permissions-policy',
    'cross-origin-opener-policy',
    'cross-origin-embedder-policy'
  ];
  
  securityHeaders.forEach(header => {
    const value = res.headers[header];
    if (value) {
      console.log(`✅ ${header}: ${value}`);
    } else {
      console.log(`❌ ${header}: Eksik`);
    }
  });
  
  console.log('\n📊 Güvenlik Skoru:', 
    Object.keys(res.headers).filter(h => 
      securityHeaders.includes(h.toLowerCase())
    ).length + '/' + securityHeaders.length
  );
}).on('error', (err) => {
  console.error('❌ Hata:', err.message);
});
