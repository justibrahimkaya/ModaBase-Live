const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function detailedImageAnalysis() {
  try {
    console.log('🔍 DETAYLI IMAGE VERİSİ ANALİZİ...\n');
    
    // İlk ürünü detaylı incele
    const product = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        images: true
      }
    });
    
    if (!product) {
      console.log('❌ Hiç ürün bulunamadı');
      return;
    }
    
    console.log(`📦 Test ürünü: ${product.name}`);
    console.log(`🆔 ID: ${product.id}`);
    console.log(`📷 Images field type: ${typeof product.images}`);
    console.log(`📷 Images field value:`, product.images);
    
    if (Array.isArray(product.images)) {
      console.log(`📦 Array uzunluğu: ${product.images.length}`);
      product.images.forEach((img, index) => {
        console.log(`   ${index}: ${typeof img} - ${img.substring(0, 100)}...`);
      });
    } else {
      console.log(`❌ Images field Array değil!`);
    }
    
    // getValidImageUrl fonksiyonunu simulate et
    console.log('\n🧪 getValidImageUrl SİMÜLASYONU:');
    
    const getValidImageUrl = () => {
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        console.log(`   🔍 First image: ${typeof firstImage}`);
        console.log(`   🔍 First image value: ${firstImage.substring(0, 100)}...`);
        
        // Sadece HTTP URL'leri kabul et, base64'leri reddet
        if (firstImage && firstImage.startsWith('http') && !firstImage.startsWith('data:image/')) {
          console.log('   ✅ HTTP URL kabul edildi');
          return firstImage;
        } else {
          console.log('   ❌ HTTP URL değil, default kullanılacak');
          console.log(`   📊 startsWith('http'): ${firstImage.startsWith('http')}`);
          console.log(`   📊 startsWith('data:image/'): ${firstImage.startsWith('data:image/')}`);
        }
      }
      console.log('   🔄 Default URL döndürülüyor');
      return 'https://www.modabase.com.tr/default-product.svg';
    };
    
    const resultUrl = getValidImageUrl();
    console.log(`\n🎯 SONUÇ URL: ${resultUrl}`);
    
    // Eğer images string olarak saklanıyorsa JSON parse dene
    if (typeof product.images === 'string') {
      console.log('\n🔧 JSON PARSE DENEMESİ:');
      try {
        const parsedImages = JSON.parse(product.images);
        console.log('✅ JSON parse başarılı:', parsedImages);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          console.log(`📷 İlk parsed image: ${parsedImages[0].substring(0, 100)}...`);
        }
      } catch (err) {
        console.log('❌ JSON parse hatası:', err.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Analiz hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

detailedImageAnalysis();