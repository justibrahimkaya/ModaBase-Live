const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProductDisplay() {
  try {
    console.log('🔍 Ürün görüntüleme kontrolü...\n');

    // MB-000052 sahra işlitsu elbise ürününü kontrol et
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'MB-000052'
        }
      },
      include: {
        category: true,
        reviews: true,
        variants: true
      }
    });

    if (!product) {
      console.log('❌ MB-000052 ürünü bulunamadı!');
      
      // Tüm ürünleri listele
      const allProducts = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true
        },
        take: 10
      });
      
      console.log('\n📋 Mevcut ürünler:');
      allProducts.forEach((p, i) => {
        console.log(`${i+1}. ${p.name} (slug: ${p.slug})`);
      });
      return;
    }

    console.log('✅ Ürün bulundu!');
    console.log('\n📦 Ürün Bilgileri:');
    console.log('ID:', product.id);
    console.log('İsim:', product.name);
    console.log('Slug:', product.slug);
    console.log('Fiyat:', product.price);
    console.log('Stok:', product.stock);
    console.log('Açıklama:', product.description?.substring(0, 100) + '...');
    console.log('Kategori:', product.category?.name);
    
    console.log('\n🖼️ Resim Bilgileri:');
    console.log('Images tipi:', typeof product.images);
    console.log('Images uzunluğu:', product.images?.length);
    
    if (product.images) {
      try {
        const images = JSON.parse(product.images);
        console.log('Toplam resim sayısı:', images.length);
        console.log('İlk resim:', images[0]?.substring(0, 100) + '...');
        
        // Base64 mi kontrol et
        if (images[0] && images[0].startsWith('data:image')) {
          console.log('⚠️ DİKKAT: Resimler BASE64 formatında!');
        }
      } catch (e) {
        console.log('❌ Images parse hatası:', e.message);
      }
    }
    
    console.log('\n📊 Varyantlar:', product.variants.length);
    console.log('💬 Yorumlar:', product.reviews.length);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductDisplay();
