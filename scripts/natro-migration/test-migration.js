/**
 * Migration Test Script
 * Taşıma işlemini test eder
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Test için hem eski hem yeni bağlantıları kontrol et
async function testMigration() {
  console.log('🧪 Migration Test Başlıyor...\n');
  console.log('=' .repeat(50));

  // 1. Supabase bağlantısını test et
  console.log('\n1️⃣ SUPABASE (KAYNAK) TEST');
  console.log('-'.repeat(30));
  
  try {
    const supabaseUrl = process.env.SUPABASE_DATABASE_URL || 'postgresql://postgres:08513628-JUst@db.wcutymcedxgeyrnpuyvt.supabase.co:5432/postgres';
    const supabaseClient = new PrismaClient({
      datasources: {
        db: { url: supabaseUrl }
      }
    });

    console.log('🔗 Bağlanıyor...');
    const supabaseTest = await supabaseClient.$queryRaw`SELECT NOW() as time`;
    console.log('✅ Bağlantı başarılı!');
    
    // Veri sayılarını kontrol et
    const userCount = await supabaseClient.user.count();
    const productCount = await supabaseClient.product.count();
    const orderCount = await supabaseClient.order.count();
    const categoryCount = await supabaseClient.category.count();
    
    console.log('\n📊 Veri Sayıları:');
    console.log(`  • Kullanıcılar: ${userCount}`);
    console.log(`  • Ürünler: ${productCount}`);
    console.log(`  • Siparişler: ${orderCount}`);
    console.log(`  • Kategoriler: ${categoryCount}`);
    
    await supabaseClient.$disconnect();
    
  } catch (error) {
    console.log('❌ Supabase bağlantı hatası:', error.message);
    return false;
  }

  // 2. Natro MySQL bağlantısını test et
  console.log('\n2️⃣ NATRO MySQL (HEDEF) TEST');
  console.log('-'.repeat(30));
  
  try {
    const natraUrl = process.env.NATRO_DATABASE_URL;
    
    if (!natraUrl) {
      console.log('⚠️ NATRO_DATABASE_URL tanımlı değil!');
      console.log('📝 .env dosyasına ekleyin:');
      console.log('   NATRO_DATABASE_URL="mysql://kullanici:sifre@host:3306/veritabani"');
      return false;
    }
    
    const natraClient = new PrismaClient({
      datasources: {
        db: { url: natraUrl }
      }
    });

    console.log('🔗 Bağlanıyor...');
    console.log(`   URL: ${natraUrl.replace(/:[^@]+@/, ':****@')}`); // Şifreyi gizle
    
    const natraTest = await natraClient.$queryRaw`SELECT NOW() as time`;
    console.log('✅ Bağlantı başarılı!');
    
    // Tablo varlığını kontrol et
    console.log('\n📋 Tablo Kontrolü:');
    const tables = [
      'User', 'Category', 'Product', 'Order', 
      'OrderItem', 'Address', 'Review'
    ];
    
    for (const table of tables) {
      try {
        const count = await natraClient[table.toLowerCase()].count();
        console.log(`  ✅ ${table} tablosu mevcut (${count} kayıt)`);
      } catch (e) {
        console.log(`  ⚠️ ${table} tablosu bulunamadı veya boş`);
      }
    }
    
    await natraClient.$disconnect();
    
  } catch (error) {
    console.log('❌ Natro MySQL bağlantı hatası:', error.message);
    console.log('\n💡 Çözüm önerileri:');
    console.log('  1. MySQL veritabanı oluşturuldu mu?');
    console.log('  2. Kullanıcı yetkileri verildi mi?');
    console.log('  3. Connection string doğru mu?');
    console.log('  4. Prisma schema push edildi mi? (npx prisma db push)');
    return false;
  }

  // 3. Migration önerileri
  console.log('\n3️⃣ MİGRASYON ÖNERİLERİ');
  console.log('-'.repeat(30));
  console.log('✅ Her iki veritabanı bağlantısı başarılı!');
  console.log('\n📝 Sonraki adımlar:');
  console.log('  1. Backup alın: node scripts/natro-migration/backup-supabase.js');
  console.log('  2. MySQL schema oluşturun: npx prisma db push --schema=./prisma/schema-mysql.prisma');
  console.log('  3. Veriyi taşıyın: node scripts/natro-migration/restore-to-mysql.js');
  console.log('  4. Test edin: node scripts/natro-migration/verify-migration.js');
  
  return true;
}

// Script direkt çalıştırıldığında
if (require.main === module) {
  testMigration()
    .then(success => {
      if (success) {
        console.log('\n✅ Test başarılı!');
      } else {
        console.log('\n❌ Test başarısız!');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Beklenmeyen hata:', error);
      process.exit(1);
    });
}

module.exports = { testMigration };
