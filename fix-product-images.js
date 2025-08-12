const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProductImages() {
  try {
    console.log('🔍 Base64 resimleri düzeltiliyor...\n');

    // MB-000052 ürününü bul
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'MB-000052'
        }
      }
    });

    if (!product) {
      console.log('❌ MB-000052 ürünü bulunamadı!');
      return;
    }

    console.log('✅ Ürün bulundu:', product.name);
    
    // Placeholder resimler
    const placeholderImages = [
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&h=800&fit=crop&blur=50',
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&h=800&fit=crop&brightness=1.1'
    ];

    // Ürünü güncelle
    await prisma.product.update({
      where: { id: product.id },
      data: {
        images: JSON.stringify(placeholderImages)
      }
    });

    console.log('✅ Resimler güncellendi!');
    
    // Tüm base64 resimleri kontrol et
    console.log('\n🔍 Diğer base64 resimli ürünler kontrol ediliyor...');
    
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    });

    let base64Count = 0;
    for (const p of allProducts) {
      if (p.images && p.images.includes('data:image')) {
        base64Count++;
        console.log(`⚠️ ${p.name} - Base64 resim tespit edildi`);
        
        // Bu ürünü de güncelle
        await prisma.product.update({
          where: { id: p.id },
          data: {
            images: JSON.stringify([
              `https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&q=80`,
              `https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop&q=80`,
              `https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop&q=80`
            ])
          }
        });
        console.log(`✅ ${p.name} - Resimler güncellendi`);
      }
    }

    console.log(`\n📊 Toplam ${base64Count} ürün güncellendi.`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImages();
