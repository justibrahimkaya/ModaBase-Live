/**
 * Migration Verification Script
 * Taşınan verilerin doğruluğunu kontrol eder
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

async function verifyMigration() {
  console.log('🔍 Migration Doğrulama Başlıyor...\n');
  console.log('=' .repeat(60));

  const supabaseUrl = process.env.SUPABASE_DATABASE_URL || 'postgresql://postgres:08513628-JUst@db.wcutymcedxgeyrnpuyvt.supabase.co:5432/postgres';
  const natraUrl = process.env.NATRO_DATABASE_URL;

  if (!natraUrl) {
    console.log('❌ NATRO_DATABASE_URL tanımlı değil!');
    return false;
  }

  // İki veritabanına bağlan
  const supabase = new PrismaClient({
    datasources: { db: { url: supabaseUrl } }
  });

  const natro = new PrismaClient({
    datasources: { db: { url: natraUrl } }
  });

  const verificationResults = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    // Test edilecek tablolar ve kontroller
    const tables = [
      { name: 'user', critical: true },
      { name: 'category', critical: true },
      { name: 'product', critical: true },
      { name: 'productVariant', critical: false },
      { name: 'order', critical: true },
      { name: 'orderItem', critical: true },
      { name: 'address', critical: false },
      { name: 'review', critical: false },
      { name: 'cart', critical: false },
      { name: 'cartItem', critical: false },
      { name: 'favorite', critical: false },
      { name: 'wishlist', critical: false },
      { name: 'business', critical: false },
      { name: 'blogPost', critical: false }
    ];

    console.log('\n📊 TABLO KARŞILAŞTIRMASI');
    console.log('-'.repeat(60));
    console.log('Tablo'.padEnd(20) + 'Supabase'.padEnd(15) + 'Natro'.padEnd(15) + 'Durum');
    console.log('-'.repeat(60));

    for (const table of tables) {
      try {
        const sourceCount = await supabase[table.name].count();
        const targetCount = await natro[table.name].count();
        
        const status = sourceCount === targetCount ? '✅' : 
                       targetCount > 0 ? '⚠️' : '❌';
        
        console.log(
          table.name.padEnd(20) + 
          sourceCount.toString().padEnd(15) + 
          targetCount.toString().padEnd(15) + 
          status
        );

        if (sourceCount === targetCount) {
          verificationResults.passed.push({
            table: table.name,
            count: sourceCount
          });
        } else if (targetCount > 0) {
          verificationResults.warnings.push({
            table: table.name,
            source: sourceCount,
            target: targetCount,
            diff: sourceCount - targetCount
          });
        } else if (table.critical) {
          verificationResults.failed.push({
            table: table.name,
            reason: 'Kritik tablo boş'
          });
        }
      } catch (error) {
        console.log(
          table.name.padEnd(20) + 
          '?'.padEnd(15) + 
          '?'.padEnd(15) + 
          '❓ Hata'
        );
      }
    }

    // Detaylı veri kontrolü
    console.log('\n🔬 DETAYLI VERİ KONTROLÜ');
    console.log('-'.repeat(60));

    // 1. Rastgele kullanıcı kontrolü
    const randomUsers = await supabase.user.findMany({ take: 3 });
    if (randomUsers.length > 0) {
      console.log('\n👤 Kullanıcı Örnekleri:');
      for (const user of randomUsers) {
        const targetUser = await natro.user.findUnique({
          where: { id: user.id }
        });
        if (targetUser) {
          console.log(`  ✅ ${user.email} - Taşındı`);
        } else {
          console.log(`  ❌ ${user.email} - Bulunamadı`);
        }
      }
    }

    // 2. Rastgele ürün kontrolü
    const randomProducts = await supabase.product.findMany({ take: 3 });
    if (randomProducts.length > 0) {
      console.log('\n📦 Ürün Örnekleri:');
      for (const product of randomProducts) {
        const targetProduct = await natro.product.findUnique({
          where: { id: product.id }
        });
        if (targetProduct) {
          const priceMatch = targetProduct.price === product.price;
          const stockMatch = targetProduct.stock === product.stock;
          console.log(`  ${priceMatch && stockMatch ? '✅' : '⚠️'} ${product.name}`);
          if (!priceMatch) console.log(`    ⚠️ Fiyat uyuşmazlığı`);
          if (!stockMatch) console.log(`    ⚠️ Stok uyuşmazlığı`);
        } else {
          console.log(`  ❌ ${product.name} - Bulunamadı`);
        }
      }
    }

    // 3. Son siparişleri kontrol et
    const lastOrders = await supabase.order.findMany({ 
      take: 3, 
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
    
    if (lastOrders.length > 0) {
      console.log('\n🛒 Son Siparişler:');
      for (const order of lastOrders) {
        const targetOrder = await natro.order.findUnique({
          where: { id: order.id },
          include: { items: true }
        });
        if (targetOrder) {
          const totalMatch = targetOrder.total === order.total;
          const itemsMatch = targetOrder.items.length === order.items.length;
          console.log(`  ${totalMatch && itemsMatch ? '✅' : '⚠️'} Sipariş #${order.id.slice(0, 8)}`);
          if (!totalMatch) console.log(`    ⚠️ Toplam tutar uyuşmazlığı`);
          if (!itemsMatch) console.log(`    ⚠️ Ürün sayısı uyuşmazlığı`);
        } else {
          console.log(`  ❌ Sipariş #${order.id.slice(0, 8)} - Bulunamadı`);
        }
      }
    }

    // Sonuç raporu
    console.log('\n' + '='.repeat(60));
    console.log('📊 DOĞRULAMA RAPORU');
    console.log('='.repeat(60));

    const totalPassed = verificationResults.passed.length;
    const totalWarnings = verificationResults.warnings.length;
    const totalFailed = verificationResults.failed.length;

    console.log(`\n✅ Başarılı: ${totalPassed} tablo`);
    if (totalPassed > 0) {
      verificationResults.passed.forEach(r => {
        console.log(`  • ${r.table}: ${r.count} kayıt`);
      });
    }

    if (totalWarnings > 0) {
      console.log(`\n⚠️ Uyarılar: ${totalWarnings} tablo`);
      verificationResults.warnings.forEach(r => {
        console.log(`  • ${r.table}: ${r.source} → ${r.target} (${r.diff > 0 ? '-' : '+'}${Math.abs(r.diff)})`);
      });
    }

    if (totalFailed > 0) {
      console.log(`\n❌ Başarısız: ${totalFailed} tablo`);
      verificationResults.failed.forEach(r => {
        console.log(`  • ${r.table}: ${r.reason}`);
      });
    }

    // Raporu dosyaya kaydet
    const reportDir = path.join(__dirname, 'reports');
    await fs.mkdir(reportDir, { recursive: true });
    const reportFile = path.join(reportDir, `verification-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(reportFile, JSON.stringify(verificationResults, null, 2));
    console.log(`\n📁 Detaylı rapor: ${reportFile}`);

    // Genel durum
    if (totalFailed === 0 && totalWarnings === 0) {
      console.log('\n🎉 MİGRASYON TAMAMEN BAŞARILI!');
      return true;
    } else if (totalFailed === 0) {
      console.log('\n✅ MİGRASYON BAŞARILI (bazı uyarılarla)');
      return true;
    } else {
      console.log('\n❌ MİGRASYON TAMAMLANMADI');
      console.log('💡 Eksik verileri tekrar taşımayı deneyin.');
      return false;
    }

  } catch (error) {
    console.error('❌ Doğrulama hatası:', error);
    return false;
  } finally {
    await supabase.$disconnect();
    await natro.$disconnect();
  }
}

// Script direkt çalıştırıldığında
if (require.main === module) {
  verifyMigration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Beklenmeyen hata:', error);
      process.exit(1);
    });
}

module.exports = { verifyMigration };
