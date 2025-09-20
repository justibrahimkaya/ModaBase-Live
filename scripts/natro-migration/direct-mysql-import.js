/**
 * Doğrudan MySQL Bağlantısı ile Import
 * MySQL 5.0 uyumlu
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function directMySQLImport() {
  console.log('🔄 MySQL\'e doğrudan bağlanıyorum...\n');
  
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2',
    multipleStatements: true
  });
  
  try {
    console.log('✅ Bağlantı başarılı!\n');
    
    // Önce basit bir test
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('MySQL Versiyonu:', rows[0].version);
    
    // Tabloları oluştur
    console.log('\n📦 Tablolar oluşturuluyor...');
    
    const sqlFile = path.join(__dirname, 'mysql-tables-only.sql');
    const sql = await fs.readFile(sqlFile, 'utf8');
    
    // SQL'i parçalara ayır ve çalıştır
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
        if (tableName) {
          console.log(`  📌 ${tableName} tablosu oluşturuluyor...`);
          try {
            await connection.execute(statement);
            console.log(`  ✅ ${tableName} oluşturuldu`);
          } catch (error) {
            console.log(`  ⚠️ ${tableName}: ${error.message}`);
          }
        }
      } else if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    // Mevcut tabloları kontrol et
    console.log('\n📋 Mevcut tablolar:');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Backup'tan veri yükle
    console.log('\n📦 Veriler yükleniyor...');
    const backupDir = path.join(__dirname, 'backup', '2025-09-20');
    const backupFile = path.join(backupDir, 'full-backup.json');
    const backup = JSON.parse(await fs.readFile(backupFile, 'utf8'));
    
    // User verilerini yükle
    if (backup.user && backup.user.length > 0) {
      console.log(`\n  👤 Users (${backup.user.length} kayıt)...`);
      let successCount = 0;
      for (const user of backup.user) {
        try {
          await connection.execute(
            `INSERT INTO User (id, email, passwordHash, name, surname, phone, role, isActive, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              user.id,
              user.email,
              user.passwordHash || null,
              user.name || null,
              user.surname || null,
              user.phone || null,
              user.role || 'USER',
              user.isActive ? 1 : 0,
              new Date(user.createdAt),
              new Date(user.updatedAt)
            ]
          );
          successCount++;
        } catch (error) {
          console.log(`  ⚠️ User ${user.email}: ${error.message}`);
        }
      }
      console.log(`  ✅ ${successCount}/${backup.user.length} kullanıcı eklendi`);
    }
    
    // Category verilerini yükle
    if (backup.category && backup.category.length > 0) {
      console.log(`\n  📁 Categories (${backup.category.length} kayıt)...`);
      let successCount = 0;
      for (const cat of backup.category) {
        try {
          await connection.execute(
            `INSERT INTO Category (id, name, slug, description, image, defaultTaxRate, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cat.id,
              cat.name,
              cat.slug,
              cat.description || null,
              cat.image || null,
              cat.defaultTaxRate || 10,
              cat.isActive ? 1 : 0,
              new Date(cat.createdAt),
              new Date(cat.updatedAt)
            ]
          );
          successCount++;
        } catch (error) {
          console.log(`  ⚠️ Category ${cat.name}: ${error.message}`);
        }
      }
      console.log(`  ✅ ${successCount}/${backup.category.length} kategori eklendi`);
    }
    
    // Product verilerini yükle
    if (backup.product && backup.product.length > 0) {
      console.log(`\n  📦 Products (${backup.product.length} kayıt)...`);
      let successCount = 0;
      for (const prod of backup.product) {
        try {
          await connection.execute(
            `INSERT INTO Product (id, name, slug, description, price, originalPrice, images, stock, categoryId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              prod.id,
              prod.name,
              prod.slug,
              prod.description || '',
              prod.price,
              prod.originalPrice || null,
              prod.images || '',
              prod.stock || 0,
              prod.categoryId,
              new Date(prod.createdAt),
              new Date(prod.updatedAt)
            ]
          );
          successCount++;
        } catch (error) {
          console.log(`  ⚠️ Product ${prod.name}: ${error.message}`);
        }
      }
      console.log(`  ✅ ${successCount}/${backup.product.length} ürün eklendi`);
    }
    
    // Blog verilerini yükle
    if (backup.blogPost && backup.blogPost.length > 0) {
      console.log(`\n  📝 Blog Posts (${backup.blogPost.length} kayıt)...`);
      let successCount = 0;
      for (const blog of backup.blogPost) {
        try {
          await connection.execute(
            `INSERT INTO BlogPost (id, title, slug, excerpt, content, author, tags, image, readTime, category, viewCount, isPublished, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              blog.id,
              blog.title,
              blog.slug,
              blog.excerpt || '',
              blog.content || '',
              blog.author,
              JSON.stringify(blog.tags || []),
              blog.image || '',
              blog.readTime || 0,
              blog.category || '',
              blog.viewCount || 0,
              blog.isPublished ? 1 : 0,
              new Date(blog.createdAt),
              new Date(blog.updatedAt)
            ]
          );
          successCount++;
        } catch (error) {
          console.log(`  ⚠️ Blog ${blog.title}: ${error.message}`);
        }
      }
      console.log(`  ✅ ${successCount}/${backup.blogPost.length} blog yazısı eklendi`);
    }
    
    // Özet
    console.log('\n' + '='.repeat(50));
    console.log('📊 ÖZET');
    console.log('='.repeat(50));
    
    const [tableCount] = await connection.execute('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?', ['db8D2']);
    console.log(`✅ Toplam tablo sayısı: ${tableCount[0].count}`);
    
    const tablesToCheck = ['User', 'Category', 'Product', 'BlogPost'];
    for (const table of tablesToCheck) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  • ${table}: ${count[0].count} kayıt`);
      } catch (error) {
        // Tablo yoksa atla
      }
    }
    
    console.log('\n✅ Migration başarıyla tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await connection.end();
  }
}

// Script direkt çalıştırıldığında
if (require.main === module) {
  directMySQLImport().catch(console.error);
}

module.exports = { directMySQLImport };
