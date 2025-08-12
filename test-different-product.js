const https = require('https');

async function testDifferentProduct() {
  console.log('🧪 FARKLI ÜRÜN TEST - CACHE BYPASS\n');
  
  // Farklı ürünler dene
  const testProducts = [
    'mb-000040-fitilli-crop',
    'mb-000041-duz-formlu-triko-maxi-elbise', 
    'mb-000043',
    'mb-000053'
  ];
  
  for (const slug of testProducts) {
    console.log(`🔍 Test: ${slug}`);
    
    const url = `https://www.modabase.com.tr/product/${slug}?cache-bust=${Date.now()}`;
    
    try {
      const html = await fetchPage(url);
      
      // JSON-LD scriptlerini bul
      const scripts = html.match(/<script[^>]*type\s*=\s*['"']application\/ld\+json['"'][^>]*>(.*?)<\/script>/gis);
      
      if (!scripts) {
        console.log('   ❌ JSON-LD yok');
        continue;
      }
      
      console.log(`   📊 ${scripts.length} JSON-LD scripti`);
      
      let productSchemaFound = false;
      
      scripts.forEach((script, index) => {
        try {
          const content = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
          
          if (content.length === 0) {
            console.log(`   ❌ Script ${index + 1}: BOŞ CONTENT`);
            return;
          }
          
          const data = JSON.parse(content);
          console.log(`   ✅ Script ${index + 1}: @type=${data['@type']}`);
          
          if (data['@type'] === 'Product') {
            productSchemaFound = true;
            console.log(`   🎯 PRODUCT SCHEMA BULUNDU!`);
            console.log(`      name: ${data.name}`);
            console.log(`      price: ${data.offers?.price}`);
            console.log(`      image: ${data.image ? 'VAR' : 'YOK'}`);
          }
          
        } catch (parseError) {
          console.log(`   ❌ Script ${index + 1}: Parse hatası`);
        }
      });
      
      if (productSchemaFound) {
        console.log('   🎉 BU ÜRÜN ÇALIŞIYOR!');
        break;
      } else {
        console.log('   😔 Bu ürün de aynı sorun');
      }
      
    } catch (error) {
      console.log(`   ❌ Fetch hatası: ${error.message}`);
    }
    
    console.log('');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n💡 SONUÇ:');
  console.log('Eğer hiç ürün çalışmıyorsa:');
  console.log('1. Vercel edge cache sorunu');
  console.log('2. ProductSEOHead component sorunu');
  console.log('3. Build deployment tamamlanmamış');
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
      
    }).on('error', (error) => {
      reject(error);
    });
  });
}

testDifferentProduct().catch(console.error);