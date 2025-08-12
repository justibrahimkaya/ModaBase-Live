const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreProductImages() {
  try {
    console.log('🔍 Ürün resimlerini kontrol ediyorum...\n');

    // Değiştirilmiş ürünleri bul (unsplash URL'leri içerenler)
    const modifiedProducts = await prisma.product.findMany({
      where: {
        images: {
          contains: 'unsplash.com'
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    console.log(`❌ ${modifiedProducts.length} ürünün resimleri yanlışlıkla değiştirilmiş!`);
    
    modifiedProducts.forEach(p => {
      console.log(`- ${p.name}`);
    });

    console.log('\n⚠️  UYARI: Orijinal resimleriniz base64 formatında veritabanında saklanıyordu.');
    console.log('Bu resimler çok büyük olduğu için (500KB+) site performansını düşürüyor.');
    console.log('\n✅ ÖNERİ: Resimlerinizi doğru formatta yeniden yükleyin:');
    console.log('1. Resimleri JPEG/PNG formatında hazırlayın (max 200KB)');
    console.log('2. Resimleri public/products klasörüne yükleyin');
    console.log('3. Veritabanında URL olarak saklayın (örn: /products/mb-000052-1.jpg)');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreProductImages();
