const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

async function testImageUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) {
      resolve({ valid: false, reason: 'Invalid URL format' });
      return;
    }
    
    const request = https.get(url, (res) => {
      resolve({ 
        valid: res.statusCode === 200, 
        status: res.statusCode,
        contentType: res.headers['content-type']
      });
    });
    
    request.on('error', (err) => {
      resolve({ valid: false, reason: err.message });
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      resolve({ valid: false, reason: 'Timeout' });
    });
  });
}

async function comprehensiveImageTest() {
  try {
    console.log('🔍 KAPSAMLI IMAGE TEST BAŞLIYOR...\n');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        images: true
      }
    });
    
    console.log(`📦 Toplam ürün sayısı: ${products.length}\n`);
    
    let stats = {
      total: products.length,
      noImages: 0,
      base64Images: 0,
      httpImages: 0,
      validHttpImages: 0,
      invalidHttpImages: 0,
      willUseDefault: 0
    };
    
    console.log('📊 DETAYLI ANALİZ:\n');
    
    for (const product of products) {
      const productUrl = `https://www.modabase.com.tr/product/${product.slug || product.id}`;
      
      console.log(`\n🔸 ${product.name} (${product.id})`);
      console.log(`   URL: ${productUrl}`);
      
      if (!product.images || product.images.length === 0) {
        stats.noImages++;
        stats.willUseDefault++;
        console.log('   📷 Images: ❌ Hiç image yok → DEFAULT kullanılacak');
        continue;
      }
      
      const firstImage = product.images[0];
      console.log(`   📷 First Image: ${firstImage.substring(0, 100)}${firstImage.length > 100 ? '...' : ''}`);
      
      if (firstImage.startsWith('data:image/')) {
        stats.base64Images++;
        stats.willUseDefault++;
        console.log('   📊 Format: ❌ Base64 → DEFAULT kullanılacak');
      } else if (firstImage.startsWith('http')) {
        stats.httpImages++;
        console.log('   📊 Format: ✅ HTTP URL');
        
        // HTTP URL'yi test et
        const testResult = await testImageUrl(firstImage);
        if (testResult.valid) {
          stats.validHttpImages++;
          console.log('   🌐 URL Test: ✅ Geçerli ve erişilebilir');
        } else {
          stats.invalidHttpImages++;
          stats.willUseDefault++;
          console.log(`   🌐 URL Test: ❌ ${testResult.reason || testResult.status} → DEFAULT kullanılacak`);
        }
      } else {
        stats.willUseDefault++;
        console.log('   📊 Format: ❌ Bilinmeyen format → DEFAULT kullanılacak');
      }
    }
    
    console.log('\n\n🎯 SONUÇ ÖZETİ:');
    console.log('═'.repeat(50));
    console.log(`📦 Toplam ürün: ${stats.total}`);
    console.log(`❌ Image yok: ${stats.noImages}`);
    console.log(`📷 Base64 images: ${stats.base64Images}`);
    console.log(`🌐 HTTP images: ${stats.httpImages}`);
    console.log(`✅ Geçerli HTTP images: ${stats.validHttpImages}`);
    console.log(`❌ Geçersiz HTTP images: ${stats.invalidHttpImages}`);
    console.log(`🔄 Default kullanacak: ${stats.willUseDefault}`);
    
    console.log('\n🎯 GOOGLE STRUCTURED DATA DURUMU:');
    console.log('═'.repeat(50));
    
    if (stats.willUseDefault > 0) {
      console.log(`⚠️  ${stats.willUseDefault} ürün DEFAULT image kullanacak`);
      console.log('✅ Default URL: https://www.modabase.com.tr/default-product.svg');
    }
    
    if (stats.validHttpImages > 0) {
      console.log(`✅ ${stats.validHttpImages} ürün kendi image'ını kullanacak`);
    }
    
    console.log('\n🔍 ÖNEMLİ NOTLAR:');
    console.log('• Base64 images Google tarafından kabul edilmiyor');
    console.log('• getValidImageUrl() fonksiyonu base64\'leri otomatik default\'a çeviriyor');
    console.log('• Tüm ürünlerde artık geçerli image field olacak');
    console.log('• "image field missing" hatası çözülecek');
    
    // Default image'ı test et
    console.log('\n🧪 DEFAULT IMAGE TESTİ:');
    const defaultTest = await testImageUrl('https://www.modabase.com.tr/default-product.svg');
    if (defaultTest.valid) {
      console.log('✅ Default image erişilebilir');
    } else {
      console.log('❌ Default image erişilemez:', defaultTest.reason);
    }
    
  } catch (error) {
    console.log('❌ Test hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveImageTest();