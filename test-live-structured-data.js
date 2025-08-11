const https = require('https');

// Canlı sitedeki structured data'yı test et
async function testLiveStructuredData() {
  console.log('🌐 CANLI SİTE STRUCTURED DATA TESTİ\n');
  
  const testUrls = [
    'https://modabase.com.tr/product/mb-000052-sahra-isiltisi-elbise',
    'https://modabase.com.tr/bluz-modelleri',
    'https://modabase.com.tr/blog',
    'https://modabase.com.tr/products'
  ];
  
  for (const url of testUrls) {
    console.log(`\n🔍 Test ediliyor: ${url}`);
    
    try {
      const html = await fetchPage(url);
      
      // JSON-LD scriptlerini bul
      const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
      
      if (!jsonLdMatches) {
        console.log('   ❌ Hiç JSON-LD bulunamadı');
        continue;
      }
      
      console.log(`   📊 ${jsonLdMatches.length} JSON-LD scripti bulundu`);
      
      jsonLdMatches.forEach((match, index) => {
        try {
          // Script tag'ini temizle
          const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
          const data = JSON.parse(jsonContent);
          
          console.log(`   \n   📋 Script ${index + 1}:`);
          console.log(`      @type: ${data['@type']}`);
          
          // Image alanını kontrol et
          if (data.image) {
            console.log(`      🖼️  IMAGE VAR: ${typeof data.image === 'string' ? data.image.substring(0, 100) + '...' : 'Array/Object'}`);
            
            if (typeof data.image === 'string' && data.image.startsWith('data:')) {
              console.log('      ❌ BASE64 IMAGE BULUNDU! Google hatası verecek!');
            } else if (typeof data.image === 'string' && data.image.startsWith('http')) {
              console.log('      ✅ HTTP URL - OK');
            } else {
              console.log('      ⚠️  Bilinmeyen image formatı');
            }
          } else {
            console.log('      ✅ Image alanı yok - Temiz');
          }
          
          // mainEntity içindeki Product'ları kontrol et
          if (data.mainEntity && data.mainEntity.itemListElement) {
            const products = data.mainEntity.itemListElement;
            console.log(`      📦 ${products.length} ürün listesinde...`);
            
            const productsWithImage = products.filter(p => p.image);
            if (productsWithImage.length > 0) {
              console.log(`      ❌ ${productsWithImage.length} üründe IMAGE ALANI VAR!`);
              
              // İlk ürünün image'ini göster
              const firstImage = productsWithImage[0].image;
              if (typeof firstImage === 'string') {
                if (firstImage.startsWith('data:')) {
                  console.log('      🚨 BASE64 IMAGE - GOOGLE HATASI!');
                } else {
                  console.log(`      🖼️  Image: ${firstImage.substring(0, 60)}...`);
                }
              }
            } else {
              console.log('      ✅ Ürün listesinde image alanı yok');
            }
          }
          
          // blogPost içindeki image'ları kontrol et
          if (data.blogPost) {
            const postsWithImage = data.blogPost.filter(p => p.image);
            if (postsWithImage.length > 0) {
              console.log(`      ❌ ${postsWithImage.length} blog yazısında IMAGE ALANI VAR!`);
            } else {
              console.log('      ✅ Blog yazılarında image alanı yok');
            }
          }
          
        } catch (parseError) {
          console.log(`   ❌ JSON parse hatası: ${parseError.message}`);
        }
      });
      
    } catch (error) {
      console.log(`   ❌ Sayfa getirilemedi: ${error.message}`);
    }
  }
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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

// Test başlat
testLiveStructuredData().then(() => {
  console.log('\n🏁 CANLI SİTE TESTİ TAMAMLANDI');
}).catch(console.error);