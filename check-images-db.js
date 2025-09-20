const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    console.log('🔍 Veritabanındaki TÜM ürünleri kontrol ediyorum...\n');
    
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        images: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`📦 Toplam ${products.length} ürün var\n`);
    
    let hasRealImage = false;
    let defaultCount = 0;
    let base64Count = 0;
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Oluşturulma: ${product.createdAt.toLocaleString('tr-TR')}`);
      console.log(`   Güncellenme: ${product.updatedAt.toLocaleString('tr-TR')}`);
      
      try {
        const images = JSON.parse(product.images || '[]');
        console.log(`   Resim sayısı: ${images.length}`);
        
        let productHasRealImage = false;
        
        images.forEach((img, imgIndex) => {
          if (img.startsWith('data:image/')) {
            console.log(`   ✅ Resim ${imgIndex + 1}: BASE64 (${Math.round(img.length / 1024)} KB)`);
            base64Count++;
            productHasRealImage = true;
            hasRealImage = true;
          } else if (img === '/default-product.svg') {
            console.log(`   ❌ Resim ${imgIndex + 1}: Default SVG`);
            defaultCount++;
          } else if (img.startsWith('http')) {
            console.log(`   🌐 Resim ${imgIndex + 1}: ${img}`);
            productHasRealImage = true;
          } else {
            console.log(`   📁 Resim ${imgIndex + 1}: ${img}`);
          }
        });
        
        if (productHasRealImage) {
          console.log(`   🎯 BU ÜRÜNDE GERÇEK RESİM VAR!`);
        }
        
      } catch (e) {
        console.log(`   ❌ Parse hatası: ${e.message}`);
      }
      console.log('');
    });
    
    console.log('═══════════════════════════════════════');
    console.log('📊 ÖZET:');
    console.log(`   Toplam ürün: ${products.length}`);
    console.log(`   Base64 resim sayısı: ${base64Count}`);
    console.log(`   Default resim sayısı: ${defaultCount}`);
    
    if (hasRealImage) {
      console.log('\n✅✅✅ GERÇEK RESİMLER VAR! ✅✅✅');
    } else {
      console.log('\n❌❌❌ HİÇ GERÇEK RESİM YOK! ❌❌❌');
    }
    
  } catch (error) {
    console.log('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
