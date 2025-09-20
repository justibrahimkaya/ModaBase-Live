/**
 * Supabase Backup Script
 * Tüm verileri JSON formatında yedekler
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:08513628-JUst@db.wcutymcedxgeyrnpuyvt.supabase.co:5432/postgres'
    }
  }
});

async function backupSupabase() {
  console.log('🔄 Supabase backup başlıyor...\n');
  
  const backupDir = path.join(__dirname, 'backup', new Date().toISOString().split('T')[0]);
  await fs.mkdir(backupDir, { recursive: true });

  const tables = [
    'user',
    'category',
    'product',
    'productVariant',
    'order',
    'orderItem',
    'address',
    'review',
    'cart',
    'cartItem',
    'favorite',
    'wishlist',
    'business',
    'blogPost',
    'sEOSettings',
    'shippingCompany',
    'stockMovement',
    'userStockNotification',
    'transferNotification',
    'contactMessage'
  ];

  const backup = {};
  
  for (const table of tables) {
    try {
      console.log(`📦 ${table} tablosu yedekleniyor...`);
      const data = await prisma[table].findMany();
      backup[table] = data;
      
      // Her tabloyu ayrı dosyaya da kaydet
      await fs.writeFile(
        path.join(backupDir, `${table}.json`),
        JSON.stringify(data, null, 2)
      );
      
      console.log(`✅ ${table}: ${data.length} kayıt yedeklendi`);
    } catch (error) {
      console.log(`⚠️ ${table} tablosu yedeklenemedi:`, error.message);
    }
  }
  
  // Tam backup dosyası
  await fs.writeFile(
    path.join(backupDir, 'full-backup.json'),
    JSON.stringify(backup, null, 2)
  );
  
  // Backup bilgileri
  const info = {
    date: new Date().toISOString(),
    source: 'Supabase',
    database: 'PostgreSQL',
    tables: Object.keys(backup),
    recordCounts: Object.entries(backup).map(([table, data]) => ({
      table,
      count: data.length
    }))
  };
  
  await fs.writeFile(
    path.join(backupDir, 'backup-info.json'),
    JSON.stringify(info, null, 2)
  );
  
  console.log(`\n✅ Backup tamamlandı!`);
  console.log(`📁 Konum: ${backupDir}`);
  console.log(`📊 Toplam: ${Object.values(backup).reduce((sum, data) => sum + data.length, 0)} kayıt`);
  
  await prisma.$disconnect();
  return backupDir;
}

// Script direkt çalıştırıldığında
if (require.main === module) {
  backupSupabase().catch(console.error);
}

module.exports = { backupSupabase };
