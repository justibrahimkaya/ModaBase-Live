const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickCheck() {
  try {
    console.log('🔍 Son eklenen ürünleri kontrol ediyorum...\n');
    
    // Son 3 ürünü al
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        images: true,
        createdAt: true
      }
    });
    
    console.log(`📦 Son ${products.length} ürün:\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Tarih: ${product.createdAt.toLocaleString('tr-TR')}`);
      
      try {
        const images = JSON.parse(product.images || '[]');
        console.log(`   Resim sayısı: ${images.length}`);
        
        if (images.length > 0) {
          const firstImage = images[0];
          if (firstImage.startsWith('data:image/')) {
            console.log(`   ✅ BASE64 resim var (${Math.round(firstImage.length / 1024)} KB)`);
          } else if (firstImage === '/default-product.svg') {
            console.log(`   ❌ Default resim kullanılıyor`);
          } else {
            console.log(`   ❓ Bilinmeyen: ${firstImage.substring(0, 50)}`);
          }
        }
      } catch (e) {
        console.log(`   ❌ Parse hatası`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.log('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickCheck();
