const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBase64Images() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    });
    
    console.log('📦 Toplam ürün sayısı:', products.length);
    console.log('\n🔍 Base64 vs HTTP images analizi:');
    
    let base64Count = 0;
    let httpCount = 0;
    let emptyCount = 0;
    
    products.forEach(product => {
      if (!product.images || product.images.length === 0) {
        emptyCount++;
        console.log(`❌ ${product.id}: ${product.name} - Hiç image yok`);
      } else {
        const firstImage = product.images[0];
        if (firstImage.startsWith('data:image/')) {
          base64Count++;
          console.log(`📷 ${product.id}: ${product.name} - Base64 image`);
        } else if (firstImage.startsWith('http')) {
          httpCount++;
          console.log(`🌐 ${product.id}: ${product.name} - HTTP URL`);
        } else {
          console.log(`❓ ${product.id}: ${product.name} - Bilinmeyen format: ${firstImage.substring(0, 50)}...`);
        }
      }
    });
    
    console.log('\n📊 Özet:');
    console.log(`   Base64 images: ${base64Count}`);
    console.log(`   HTTP URLs: ${httpCount}`);
    console.log(`   Boş images: ${emptyCount}`);
    
    if (base64Count > 0) {
      console.log('\n⚠️  Base64 image'lar Google tarafından kabul edilmiyor!');
      console.log('✅ Çözüm: Base64 image'ları HTTP URL'ye çevirmeli veya default image kullanmalıyız.');
    }
    
  } catch (error) {
    console.log('❌ Database hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBase64Images();