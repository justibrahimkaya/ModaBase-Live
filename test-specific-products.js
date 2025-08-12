const https = require('https');

async function testSpecificProducts() {
  console.log('🎯 SPESİFİK ÜRÜN LİSTESİ TEST\n');
  console.log('Google Search Console\'daki hatali ürünleri test ediyoruz...\n');
  
  // Google Search Console'dan gelen hatalı ürünler
  const productSlugs = [
    'mb-000052-sahra-isiltisi-elbise',
    'mb-000057-yazlik-triko',
    'mb-000056-omzuacik-elbise', 
    'mb-000055-askili-elbise',
    'mb-000054-askili-yazlik',
    'mb-000045-kurdele-detayli-triko-crop-suveter-yeni',
    'mb-000053',
    'mb-000043',
    'mb-000042fit-kesim-cizgili-triko-bluz',
    'mb-000041-duz-formlu-triko-maxi-elbise',
    'mb-000040-fitilli-crop',
    'mb-000039cizgili-relax-fit-i-kili-takim'
  ];
  
  console.log(`📊 Test edilecek ürün sayısı: ${productSlugs.length}\n`);
  
  let totalProblems = 0;
  const problemDetails = [];
  
  for (let i = 0; i < productSlugs.length; i++) {
    const slug = productSlugs[i];
    const url = `https://www.modabase.com.tr/product/${slug}`;
    
    console.log(`${i + 1}/${productSlugs.length} ${slug}:`);
    
    try {
      const html = await fetchPage(url);
      
      if (html.length < 1000) {
        console.log('   ❌ Sayfa yüklenmedi');
        continue;
      }
      
      // JSON-LD scriptlerini bul
      const scripts = html.match(/<script[^>]*type\s*=\s*['"']application\/ld\+json['"'][^>]*>(.*?)<\/script>/gis);
      
      if (!scripts) {
        console.log('   ❌ JSON-LD yok');
        continue;
      }
      
      console.log(`   📊 ${scripts.length} JSON-LD scripti`);
      
      let hasProductSchema = false;
      let productSchemaHasImage = false;
      let hasImageField = false;
      
      scripts.forEach((script, index) => {
        try {
          const content = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
          const data = JSON.parse(content);
          
          console.log(`      Script ${index + 1}: @type=${data['@type']}`);
          
          // Product schema kontrolü
          if (data['@type'] === 'Product') {
            hasProductSchema = true;
            
            if (data.image) {
              productSchemaHasImage = true;
              hasImageField = true;
              
              if (typeof data.image === 'string') {
                if (data.image.startsWith('data:')) {
                  console.log(`      🚨 PRODUCT'ta BASE64 IMAGE VAR!`);
                  console.log(`      Başlangıç: ${data.image.substring(0, 50)}...`);
                } else {
                  console.log(`      ⚠️  PRODUCT'ta HTTP IMAGE: ${data.image.substring(0, 50)}...`);
                }
              } else {
                console.log(`      ⚠️  PRODUCT'ta ARRAY/OBJECT IMAGE`);
              }
            } else {
              console.log(`      ✅ PRODUCT'ta image alanı yok`);
            }
          }
          
          // Diğer image alanları
          if (data.image && data['@type'] !== 'Product') {
            hasImageField = true;
            console.log(`      ⚠️  ${data['@type']}'da image var`);
          }
          
        } catch (parseError) {
          console.log(`      ❌ Script ${index + 1}: Parse hatası - ${parseError.message}`);
        }
      });
      
      // DURUM DEĞERLENDİRMESİ
      if (!hasProductSchema) {
        console.log('   🚨 PRODUCT SCHEMA YOK!');
        totalProblems++;
        problemDetails.push({
          slug,
          issue: 'PRODUCT_SCHEMA_MISSING'
        });
      } else if (productSchemaHasImage) {
        console.log('   🚨 PRODUCT SCHEMA\'DA IMAGE ALANI VAR!');
        totalProblems++;
        problemDetails.push({
          slug,
          issue: 'PRODUCT_HAS_IMAGE'
        });
      } else if (hasImageField) {
        console.log('   ⚠️  Başka schema\'da image var ama Product\'ta yok');
      } else {
        console.log('   ✅ TEMİZ - Hiç image alanı yok');
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ HATA: ${error.message}`);
      totalProblems++;
      problemDetails.push({
        slug,
        issue: `FETCH_ERROR: ${error.message}`
      });
    }
    
    console.log('');
  }
  
  // SONUÇLAR
  console.log('='.repeat(60));
  console.log('\n🎯 DETAYLI SONUÇLAR:\n');
  
  console.log(`📊 Test edilen ürün: ${productSlugs.length}`);
  console.log(`❌ Problemli ürün: ${totalProblems}`);
  console.log(`✅ Temiz ürün: ${productSlugs.length - totalProblems}\n`);
  
  if (problemDetails.length > 0) {
    console.log('🚨 PROBLEMLİ ÜRÜNLER:\n');
    
    const categories = {};
    problemDetails.forEach(item => {
      if (!categories[item.issue]) {
        categories[item.issue] = [];
      }
      categories[item.issue].push(item.slug);
    });
    
    Object.keys(categories).forEach(issueType => {
      console.log(`${issueType}:`);
      categories[issueType].forEach(slug => {
        console.log(`  - ${slug}`);
      });
      console.log('');
    });
    
    // ÇÖZÜM ÖNERİLERİ
    console.log('🔧 ÇÖZÜM:\n');
    
    if (categories['PRODUCT_HAS_IMAGE']) {
      console.log('❌ Product schema\'da image alanı var:');
      console.log('   → components/ProductSEOHead.tsx kontrol et');
      console.log('   → Database\'deki structuredData kontrol et');
    }
    
    if (categories['PRODUCT_SCHEMA_MISSING']) {
      console.log('❌ Product schema eksik:');
      console.log('   → ProductSEOHead component çağrılmıyor olabilir');
    }
    
  } else {
    console.log('🎉 TÜM ÜRÜNLER TEMİZ!');
    console.log('✅ Google Search Console cache sorunu olabilir');
  }
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

testSpecificProducts().catch(console.error);