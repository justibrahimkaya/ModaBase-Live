/**
 * MySQL Restore Script
 * JSON backup'tan MySQL'e veri yükler
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

// MySQL bağlantısı için yeni Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      // Natro MySQL bağlantınızı buraya yazın
      url: process.env.NATRO_DATABASE_URL || 'mysql://kullanici:sifre@localhost:3306/veritabani'
    }
  }
});

async function restoreToMySQL(backupDir) {
  console.log('🔄 MySQL restore başlıyor...\n');
  
  if (!backupDir) {
    // En son backup'ı bul
    const backupsDir = path.join(__dirname, 'backup');
    const dirs = await fs.readdir(backupsDir);
    backupDir = path.join(backupsDir, dirs[dirs.length - 1]);
  }
  
  console.log(`📁 Backup konumu: ${backupDir}\n`);
  
  // Backup'ı yükle
  const backupFile = path.join(backupDir, 'full-backup.json');
  const backup = JSON.parse(await fs.readFile(backupFile, 'utf8'));
  
  // Tabloları doğru sırayla restore et (foreign key bağımlılıkları)
  const restoreOrder = [
    // Bağımsız tablolar önce
    'user',
    'category',
    'shippingCompany',
    'business',
    
    // User'a bağlı tablolar
    'account',
    'session',
    'address',
    
    // Category'ye bağlı tablolar
    'product',
    'productVariant',
    
    // Product ve User'a bağlı tablolar
    'favorite',
    'wishlist',
    'cart',
    'cartItem',
    'userStockNotification',
    
    // Order ve bağlı tablolar
    'order',
    'orderItem',
    'stockMovement',
    'transferNotification',
    
    // Review tabloları
    'review',
    'reviewHelpful',
    
    // Diğer tablolar
    'blogPost',
    'sEOSettings',
    'contactMessage',
    'verificationToken',
    'cartHistory'
  ];
  
  const results = {
    success: [],
    failed: [],
    skipped: []
  };
  
  for (const table of restoreOrder) {
    if (!backup[table]) {
      console.log(`⏭️ ${table} tablosu backup'ta bulunamadı, atlanıyor...`);
      results.skipped.push(table);
      continue;
    }
    
    const data = backup[table];
    if (data.length === 0) {
      console.log(`⏭️ ${table} tablosu boş, atlanıyor...`);
      results.skipped.push(table);
      continue;
    }
    
    console.log(`📦 ${table} tablosu restore ediliyor (${data.length} kayıt)...`);
    
    try {
      // Transaction kullanarak toplu insert
      let successCount = 0;
      let errorCount = 0;
      
      for (const record of data) {
        try {
          // Tarih alanlarını düzelt
          const processedRecord = processDateFields(record);
          
          await prisma[table].create({
            data: processedRecord
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.log(`  ⚠️ Kayıt eklenemedi (${table}):`, error.message);
          
          // ID çakışması varsa update dene
          if (error.code === 'P2002' && record.id) {
            try {
              await prisma[table].update({
                where: { id: record.id },
                data: processedRecord
              });
              successCount++;
              errorCount--;
            } catch (updateError) {
              // Update de başarısızsa devam et
            }
          }
        }
      }
      
      console.log(`✅ ${table}: ${successCount} başarılı, ${errorCount} başarısız\n`);
      results.success.push({ table, success: successCount, failed: errorCount });
      
    } catch (error) {
      console.log(`❌ ${table} tablosu restore edilemedi:`, error.message, '\n');
      results.failed.push({ table, error: error.message });
    }
  }
  
  // Sonuç raporu
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESTORE RAPORU');
  console.log('='.repeat(50));
  
  console.log('\n✅ Başarılı tablolar:');
  results.success.forEach(r => {
    console.log(`  - ${r.table}: ${r.success} kayıt`);
  });
  
  if (results.failed.length > 0) {
    console.log('\n❌ Başarısız tablolar:');
    results.failed.forEach(r => {
      console.log(`  - ${r.table}: ${r.error}`);
    });
  }
  
  if (results.skipped.length > 0) {
    console.log('\n⏭️ Atlanan tablolar:');
    results.skipped.forEach(t => {
      console.log(`  - ${t}`);
    });
  }
  
  await prisma.$disconnect();
  return results;
}

// Tarih alanlarını MySQL formatına çevir
function processDateFields(record) {
  const processed = { ...record };
  
  for (const [key, value] of Object.entries(processed)) {
    if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
      // ISO tarih formatını MySQL datetime formatına çevir
      processed[key] = new Date(value);
    }
    // null değerleri koru
    if (value === null) {
      processed[key] = null;
    }
  }
  
  return processed;
}

// Script direkt çalıştırıldığında
if (require.main === module) {
  const backupDir = process.argv[2]; // Opsiyonel backup dizini
  restoreToMySQL(backupDir).catch(console.error);
}

module.exports = { restoreToMySQL };
