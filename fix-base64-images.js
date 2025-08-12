const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBase64Images() {
  try {
    console.log('🔍 Base64 resimler kontrol ediliyor...\n');

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    });

    let base64Count = 0;
    let fixedCount = 0;

    for (const product of products) {
      try {
        const images = JSON.parse(product.images || '[]');
        const hasBase64 = images.some(img => img && img.startsWith('data:image'));
        
        if (hasBase64) {
          base64Count++;
          console.log(`⚠️ Base64 resim bulundu: ${product.name}`);
          
          // Base64 resimleri placeholder ile değiştir
          const fixedImages = images.map(img => {
            if (img && img.startsWith('data:image')) {
              return '/default-product.svg';
            }
            return img;
          });

          await prisma.product.update({
            where: { id: product.id },
            data: { 
              images: JSON.stringify(fixedImages)
            }
          });

          fixedCount++;
          console.log(`✅ Düzeltildi: ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ Hata (${product.name}):`, error.message);
      }
    }

    console.log('\n📊 Özet:');
    console.log(`Toplam ürün: ${products.length}`);
    console.log(`Base64 resimli ürün: ${base64Count}`);
    console.log(`Düzeltilen ürün: ${fixedCount}`);

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Çalıştırmak için yorum satırını kaldırın:
// fixBase64Images();

console.log('⚠️ DİKKAT: Base64 resimleri kaldırmak için son satırdaki yorumu kaldırın!');
console.log('Bu işlem geri alınamaz, lütfen önce backup alın.');
