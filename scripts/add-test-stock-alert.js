const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestStockAlert() {
  try {
    console.log('🧪 Stok uyarısı test ürünü ekleniyor...\n');

    // Önce kategori kontrol et
    const category = await prisma.category.findFirst({
      where: { name: 'Kadın' }
    });

    if (!category) {
      console.log('❌ Kadın kategorisi bulunamadı!');
      return;
    }

    // Test ürünü ekle - düşük stok
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Düşük Stok Ürünü',
        slug: 'test-dusuk-stok-urunu',
        description: 'Stok uyarısı test etmek için eklenen ürün',
        price: 299.99,
        originalPrice: 399.99,
        stock: 2, // Düşük stok
        minStockLevel: 5, // Minimum stok seviyesi
        maxStockLevel: 50,
        images: JSON.stringify([
          'https://via.placeholder.com/400x500/FF6B6B/FFFFFF?text=Test+Urun'
        ]),
        categoryId: category.id
      }
    });

    console.log('✅ Test ürünü eklendi:');
    console.log(`   - Ad: ${testProduct.name}`);
    console.log(`   - Stok: ${testProduct.stock}`);
    console.log(`   - Min. Stok: ${testProduct.minStockLevel}`);
    console.log(`   - Durum: Düşük Stok (${testProduct.stock} <= ${testProduct.minStockLevel})`);

    // Stoksuz test ürünü ekle
    const outOfStockProduct = await prisma.product.create({
      data: {
        name: 'Test Stoksuz Ürünü',
        slug: 'test-stoksuz-urunu',
        description: 'Stok uyarısı test etmek için eklenen stoksuz ürün',
        price: 199.99,
        originalPrice: 249.99,
        stock: 0, // Stoksuz
        minStockLevel: 3,
        maxStockLevel: 30,
        images: JSON.stringify([
          'https://via.placeholder.com/400x500/FF0000/FFFFFF?text=Stoksuz'
        ]),
        categoryId: category.id
      }
    });

    console.log('\n✅ Stoksuz test ürünü eklendi:');
    console.log(`   - Ad: ${outOfStockProduct.name}`);
    console.log(`   - Stok: ${outOfStockProduct.stock}`);
    console.log(`   - Durum: Stoksuz`);

    // Stok hareketi ekle
    const stockMovement = await prisma.stockMovement.create({
      data: {
        productId: testProduct.id,
        type: 'OUT',
        quantity: 3,
        description: 'Test satışı - stok uyarısı tetiklendi'
      }
    });

    console.log('\n✅ Stok hareketi eklendi:');
    console.log(`   - Tip: ${stockMovement.type}`);
    console.log(`   - Miktar: ${stockMovement.quantity}`);
    console.log(`   - Açıklama: ${stockMovement.description}`);

    console.log('\n🎉 Test verileri başarıyla eklendi!');
    console.log('📊 Şimdi stok uyarı sayfasını kontrol edebilirsiniz.');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestStockAlert(); 