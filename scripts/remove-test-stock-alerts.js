const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeTestStockAlerts() {
  try {
    console.log('🧹 Test stok uyarısı ürünleri temizleniyor...\n');

    // Test ürünlerini bul
    const testProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Test Düşük Stok Ürünü' } },
          { name: { contains: 'Test Stoksuz Ürünü' } }
        ]
      },
      include: {
        reviews: true,
        orderItems: true,
        cartItems: true,
        favorites: true,
        wishlists: true,
        stockMovements: true,
        stockNotifications: true,
        variants: true
      }
    });

    console.log(`📦 ${testProducts.length} test ürünü bulundu:`);
    
    for (const product of testProducts) {
      console.log(`\n🗑️  Siliniyor: ${product.name} (ID: ${product.id})`);
      console.log(`   - Yorumlar: ${product.reviews.length}`);
      console.log(`   - Sipariş kalemleri: ${product.orderItems.length}`);
      console.log(`   - Sepet kalemleri: ${product.cartItems.length}`);
      console.log(`   - Favoriler: ${product.favorites.length}`);
      console.log(`   - İstek listesi: ${product.wishlists.length}`);
      console.log(`   - Stok hareketleri: ${product.stockMovements.length}`);
      console.log(`   - Stok bildirimleri: ${product.stockNotifications.length}`);
      console.log(`   - Varyantlar: ${product.variants.length}`);
      
      // Ürünü sil (cascade delete ile ilişkili kayıtlar da silinecek)
      await prisma.product.delete({
        where: { id: product.id }
      });
      
      console.log(`   ✅ Başarıyla silindi!`);
    }

    console.log('\n🎉 Tüm test stok uyarısı ürünleri başarıyla silindi!');
    console.log('📊 Artık kendi ürünlerinizi ekleyip stok uyarılarını test edebilirsiniz.');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeTestStockAlerts(); 