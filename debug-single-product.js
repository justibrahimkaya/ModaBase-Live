const https = require('https');

async function debugSingleProduct() {
  console.log('🔍 TEK ÜRÜN DETAYLI DEBUG\n');
  
  const url = 'https://www.modabase.com.tr/product/mb-000052-sahra-isiltisi-elbise';
  
  try {
    const html = await fetchPage(url);
    
    console.log(`📄 HTML boyutu: ${html.length} karakter\n`);
    
    // ProductSEOHead component var mı?
    const hasProductSEOHead = html.includes('ProductSEOHead') || html.includes('Product:');
    console.log(`🔍 ProductSEOHead traces: ${hasProductSEOHead}\n`);
    
    // JSON-LD scriptlerini bul
    const scripts = html.match(/<script[^>]*type\s*=\s*['"']application\/ld\+json['"'][^>]*>(.*?)<\/script>/gis);
    
    if (!scripts) {
      console.log('❌ Hiç JSON-LD script yok!');
      return;
    }
    
    console.log(`📊 ${scripts.length} JSON-LD scripti bulundu:\n`);
    
    scripts.forEach((script, index) => {
      console.log(`--- SCRIPT ${index + 1} ---`);
      
      try {
        const content = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
        
        // İlk 200 karakteri göster
        console.log(`Raw content (ilk 200 kar):`);
        console.log(content.substring(0, 200));
        
        if (content.length > 200) {
          console.log('...');
        }
        
        // JSON parse dene
        const data = JSON.parse(content);
        console.log(`✅ Parse başarılı: @type=${data['@type']}`);
        
        if (data['@type'] === 'Product') {
          console.log(`🎯 PRODUCT SCHEMA BULUNDU!`);
          console.log(`   name: ${data.name}`);
          console.log(`   price: ${data.offers?.price}`);
          console.log(`   image var mı: ${data.image ? 'VAR' : 'YOK'}`);
        }
        
      } catch (parseError) {
        console.log(`❌ Parse hatası: ${parseError.message}`);
        
        // Raw content'i tam göster
        const content = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
        console.log(`❌ RAW CONTENT (tam):`);
        console.log(content);
        
        // Content uzunluğu
        console.log(`❌ Content uzunluğu: ${content.length} karakter`);
        
        // Boş mu?
        if (content.length === 0) {
          console.log(`❌ CONTENT BOŞ!`);
        } else if (content.includes('{') && content.includes('}')) {
          console.log(`❌ JSON benzeri ama bozuk`);
        } else {
          console.log(`❌ JSON formatında değil`);
        }
      }
      
      console.log('');
    });
    
    // Database'den ürün bilgisini kontrol et
    console.log('\n💾 DATABASE KONTROLÜ:');
    
    // Console logları ara (ProductSEOHead debug logları)
    if (html.includes('🔍 Product:') || html.includes('📊 Original images')) {
      console.log('✅ ProductSEOHead debug logları var (server-side render)');
    } else {
      console.log('❌ ProductSEOHead debug logları yok');
    }
    
  } catch (error) {
    console.log(`❌ Fetch hatası: ${error.message}`);
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

debugSingleProduct().catch(console.error);