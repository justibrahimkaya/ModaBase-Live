const { PrismaClient } = require('@prisma/client');
const https = require('https');

async function testFreshProduct() {
  console.log('🆕 YENİ ÜRÜN TEST - CACHE\'SİZ ÜRÜN BULMA\n');
  
  const prisma = new PrismaClient();
  
  try {
    // En son eklenen ürünleri bul
    const freshProducts = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        slug: true,
        name: true,
        createdAt: true,
        structuredData: true
      }
    });
    
    console.log('📊 En son 5 ürün:');
    freshProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Created: ${product.createdAt.toLocaleDateString()}`);
      console.log(`   StructuredData: ${product.structuredData ? 'VAR' : 'NULL'}`);
      console.log('');
    });
    
    // İlk ürünü test et
    if (freshProducts.length > 0) {
      const testProduct = freshProducts[0];
      console.log(`🧪 TEST: ${testProduct.slug}\n`);
      
      const url = `https://www.modabase.com.tr/product/${testProduct.slug}`;
      
      const html = await fetchPage(url);
      
      // JSON-LD kontrol
      const scripts = html.match(/<script[^>]*type\s*=\s*['"']application\/ld\+json['"'][^>]*>(.*?)<\/script>/gis);
      
      if (!scripts) {
        console.log('❌ JSON-LD yok');
        return;
      }
      
      console.log(`📊 ${scripts.length} JSON-LD scripti:`);
      
      let productFound = false;
      
      scripts.forEach((script, index) => {
        try {
          const content = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
          
          if (content.length === 0) {
            console.log(`   ❌ Script ${index + 1}: BOŞ`);
            return;
          }
          
          const data = JSON.parse(content);
          console.log(`   ✅ Script ${index + 1}: @type=${data['@type']}`);
          
          if (data['@type'] === 'Product') {
            productFound = true;
            console.log(`   🎯 PRODUCT BULUNDU!`);
            console.log(`      name: ${data.name}`);
            console.log(`      price: ${data.offers?.price}`);
            console.log(`      image: ${data.image ? 'VAR' : 'YOK'}`);
          }
          
        } catch (parseError) {
          console.log(`   ❌ Script ${index + 1}: Parse hatası`);
        }
      });
      
      if (productFound) {
        console.log('\n🎉 BU ÜRÜN ÇALIŞIYOR! ProductSEOHead düzgün çalışıyor!');
      } else {
        console.log('\n😞 Bu ürün de aynı sorun - ProductSEOHead çalışmıyor');
      }
    }
    
  } catch (error) {
    console.log(`❌ Hata: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache'
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

testFreshProduct().catch(console.error);