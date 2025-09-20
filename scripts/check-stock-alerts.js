const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStockAlerts() {
  try {
    console.log('🔍 Stok uyarı sistemi kontrol ediliyor...\n');

    // Tüm ürünleri getir
    const allProducts = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    console.log(`📦 Toplam ürün sayısı: ${allProducts.length}`);

    if (allProducts.length === 0) {
      console.log('❌ Hiç ürün bulunamadı!');
      return;
    }

    // Ürün detaylarını göster
    console.log('\n📋 Ürün Detayları:');
    allProducts.forEach(product => {
      console.log(`\n   🏷️  ${product.name}`);
      console.log(`      - Stok: ${product.stock}`);
      console.log(`      - Min. Stok Seviyesi: ${product.minStockLevel}`);
      console.log(`      - Kategori: ${product.category.name}`);
      console.log(`      - Fiyat: ₺${product.price}`);
      
      // Stok durumu
      if (product.stock === 0) {
        console.log(`      - Durum: 🔴 STOKSUZ`);
      } else if (product.stock <= product.minStockLevel) {
        console.log(`      - Durum: 🟠 DÜŞÜK STOK`);
      } else {
        console.log(`      - Durum: 🟢 NORMAL`);
      }
    });

    // Düşük stok ürünleri
    const lowStockProducts = allProducts.filter(product => 
      product.stock <= product.minStockLevel && product.stock > 0
    );

    // Stoksuz ürünler
    const outOfStockProducts = allProducts.filter(product => 
      product.stock === 0
    );

    console.log('\n📊 Stok Uyarı Özeti:');
    console.log(`   🔴 Stoksuz ürünler: ${outOfStockProducts.length}`);
    console.log(`   🟠 Düşük stok ürünler: ${lowStockProducts.length}`);
    console.log(`   🟢 Normal stok ürünler: ${allProducts.length - lowStockProducts.length - outOfStockProducts.length}`);

    // Stok hareketleri
    const recentMovements = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`\n📈 Son 7 günlük hareketler: ${recentMovements.length}`);

    if (recentMovements.length > 0) {
      console.log('\n🔄 Son Hareketler:');
      recentMovements.forEach(movement => {
        console.log(`   ${movement.type} - ${movement.quantity} adet - ${movement.product.name} (${movement.createdAt.toLocaleDateString('tr-TR')})`);
      });
    }

    // API endpoint'ini test et
    console.log('\n🌐 API Endpoint Testi:');
    try {
      const response = await fetch('http://localhost:3000/api/admin/stock-alerts', {
        headers: {
          'Cookie': 'admin-token=test' // Test için
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ API çalışıyor');
        console.log(`   - Düşük stok: ${data.lowStockProducts?.length || 0}`);
        console.log(`   - Stoksuz: ${data.outOfStockProducts?.length || 0}`);
        console.log(`   - Hareketler: ${data.recentMovements?.length || 0}`);
      } else {
        console.log(`   ❌ API hatası: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ API bağlantı hatası:', error.message);
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStockAlerts(); 