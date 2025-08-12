const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProductPage() {
  try {
    console.log('🔍 Ürün sayfası test ediliyor...\n');

    // İlk ürünü al
    const firstProduct = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        slug: true,
        images: true
      }
    });

    if (!firstProduct) {
      console.log('❌ Veritabanında ürün bulunamadı!');
      return;
    }

    console.log('📦 Test edilecek ürün:');
    console.log(`ID: ${firstProduct.id}`);
    console.log(`İsim: ${firstProduct.name}`);
    console.log(`Slug: ${firstProduct.slug}`);
    
    // Images alanını kontrol et
    console.log('\n🖼️ Images alanı kontrolü:');
    console.log(`Tip: ${typeof firstProduct.images}`);
    console.log(`Değer: ${firstProduct.images?.substring(0, 100)}...`);
    
    try {
      const parsedImages = JSON.parse(firstProduct.images || '[]');
      console.log(`✅ JSON parse başarılı! ${parsedImages.length} resim bulundu.`);
    } catch (error) {
      console.log(`❌ JSON parse hatası: ${error.message}`);
    }

    // Product page için kullanılan URL'leri göster
    console.log('\n🔗 Kullanılabilir URL\'ler:');
    console.log(`1. /product/${firstProduct.slug}`);
    console.log(`2. /product/${firstProduct.id}`);
    
    // Diğer ürünleri de listele
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true
      },
      take: 5
    });

    console.log('\n📋 İlk 5 ürün:');
    console.log('----------------------------------------');
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Stok: ${product.stock}`);
      console.log('');
    });

    // Test URL'leri
    console.log('🧪 Test için kullanılabilecek URL\'ler:');
    allProducts.forEach((product) => {
      console.log(`http://localhost:3000/product/${product.slug}`);
    });

  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductPage();
