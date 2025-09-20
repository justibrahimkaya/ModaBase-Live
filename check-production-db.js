// Production veritabanını kontrol etmek için script
// NOT: Bu script'i çalıştırmadan önce .env.production dosyasını oluşturun

const { PrismaClient } = require('@prisma/client');

// Production database URL'ini kullan
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL
    }
  }
});

async function checkProductionDB() {
  try {
    console.log('🔍 Production veritabanı kontrol ediliyor...\n');
    console.log('Database URL:', process.env.DATABASE_URL ? 'SET ✅' : 'NOT SET ❌');
    
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    
    console.log(`\n📦 Son ${products.length} ürün:\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Oluşturulma: ${product.createdAt.toLocaleString('tr-TR')}`);
      console.log(`   Images field uzunluğu: ${product.images?.length} karakter`);
      
      try {
        const images = JSON.parse(product.images || '[]');
        console.log(`   📸 Resim sayısı: ${images.length}`);
        
        if (images.length > 0) {
          const firstImage = images[0];
          if (firstImage?.startsWith('data:image/')) {
            const dataSize = firstImage.length;
            console.log(`   ✅ BASE64 resim (${Math.round(dataSize / 1024)} KB)`);
          } else if (firstImage?.startsWith('http')) {
            console.log(`   🌐 HTTP URL: ${firstImage}`);
          } else if (firstImage?.startsWith('/')) {
            console.log(`   📁 Local path: ${firstImage}`);
          } else {
            console.log(`   ❓ Bilinmeyen format: ${firstImage?.substring(0, 50)}...`);
          }
        } else {
          console.log(`   ❌ Resim yok!`);
        }
      } catch (e) {
        console.log(`   ❌ Parse hatası: ${e.message}`);
      }
      console.log('   ' + '─'.repeat(50));
    });
    
    // Toplam ürün sayısı
    const totalCount = await prisma.product.count();
    console.log(`\n📊 Toplam ürün sayısı: ${totalCount}`);
    
  } catch (error) {
    console.log('❌ Veritabanı bağlantı hatası:', error.message);
    console.log('\n⚠️  Muhtemel sebepler:');
    console.log('1. DATABASE_URL environment variable ayarlanmamış');
    console.log('2. Veritabanı erişim izni yok');
    console.log('3. Network bağlantı sorunu');
    
    console.log('\n💡 Çözüm önerileri:');
    console.log('1. Vercel dashboard\'dan DATABASE_URL\'i kontrol edin');
    console.log('2. Supabase/PostgreSQL bağlantı ayarlarını kontrol edin');
    console.log('3. .env.local dosyasında production DATABASE_URL\'i test edin');
  } finally {
    await prisma.$disconnect();
  }
}

// Environment variable kontrolü
console.log('🔧 Environment Variable Kontrolü:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✅' : 'NOT SET ❌');
console.log('PRODUCTION_DATABASE_URL:', process.env.PRODUCTION_DATABASE_URL ? 'SET ✅' : 'NOT SET ❌');
console.log('');

checkProductionDB();
