/**
 * MySQL 5.5 Veri Yükleme
 * Backup'tan verileri yükler
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function loadDataToMySQL() {
  console.log('🔄 Veriler MySQL\'e yükleniyor...\n');
  
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2'
  });
  
  try {
    // Backup dosyasını yükle
    const backupDir = path.join(__dirname, 'backup', '2025-09-20');
    const backupFile = path.join(backupDir, 'full-backup.json');
    const backup = JSON.parse(await fs.readFile(backupFile, 'utf8'));
    
    const results = {
      success: 0,
      failed: 0,
      details: []
    };
    
    // 1. Users
    if (backup.user && backup.user.length > 0) {
      console.log(`👤 Kullanıcılar (${backup.user.length} kayıt)...`);
      let count = 0;
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
          count++;
          results.success++;
        } catch (error) {
          results.failed++;
          if (error.message.includes('Duplicate')) {
            console.log(`  ⚠️ ${user.email} zaten mevcut`);
          } else {
            console.log(`  ❌ ${user.email}: ${error.message}`);
          }
        }
      }
      console.log(`  ✅ ${count}/${backup.user.length} kullanıcı eklendi\n`);
      results.details.push({ table: 'User', added: count, total: backup.user.length });
    }
    
    // 2. Categories
    if (backup.category && backup.category.length > 0) {
      console.log(`📁 Kategoriler (${backup.category.length} kayıt)...`);
      let count = 0;
      for (const cat of backup.category) {
        try {
          await connection.execute(
            `INSERT INTO Category (id, name, slug, description, image, defaultTaxRate, isActive, parentId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cat.id,
              cat.name,
              cat.slug,
              cat.description || null,
              cat.image || null,
              cat.defaultTaxRate || 10,
              cat.isActive ? 1 : 0,
              cat.parentId || null,
              new Date(cat.createdAt),
              new Date(cat.updatedAt)
            ]
          );
          count++;
          results.success++;
        } catch (error) {
          results.failed++;
          if (error.message.includes('Duplicate')) {
            console.log(`  ⚠️ ${cat.name} zaten mevcut`);
          } else {
            console.log(`  ❌ ${cat.name}: ${error.message}`);
          }
        }
      }
      console.log(`  ✅ ${count}/${backup.category.length} kategori eklendi\n`);
      results.details.push({ table: 'Category', added: count, total: backup.category.length });
    }
    
    // 3. Products
    if (backup.product && backup.product.length > 0) {
      console.log(`📦 Ürünler (${backup.product.length} kayıt)...`);
      let count = 0;
      for (const prod of backup.product) {
        try {
          // Açıklama ve resimleri güvenli hale getir
          const desc = prod.description ? prod.description.replace(/'/g, "''") : '';
          const imgs = prod.images || '';
          
          await connection.execute(
            `INSERT INTO Product (id, name, slug, description, price, originalPrice, images, stock, categoryId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              prod.id,
              prod.name,
              prod.slug,
              desc,
              prod.price,
              prod.originalPrice || null,
              imgs,
              prod.stock || 0,
              prod.categoryId,
              new Date(prod.createdAt),
              new Date(prod.updatedAt)
            ]
          );
          count++;
          results.success++;
        } catch (error) {
          results.failed++;
          console.log(`  ❌ ${prod.name}: ${error.message}`);
        }
      }
      console.log(`  ✅ ${count}/${backup.product.length} ürün eklendi\n`);
      results.details.push({ table: 'Product', added: count, total: backup.product.length });
    }
    
    // 4. Product Variants
    if (backup.productVariant && backup.productVariant.length > 0) {
      console.log(`🎨 Ürün Varyantları (${backup.productVariant.length} kayıt)...`);
      let count = 0;
      for (const variant of backup.productVariant) {
        try {
          await connection.execute(
            `INSERT INTO ProductVariant (id, productId, size, color, colorCode, stock, price, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              variant.id,
              variant.productId,
              variant.size || null,
              variant.color || null,
              variant.colorCode || null,
              variant.stock || 0,
              variant.price || null,
              variant.isActive ? 1 : 0,
              new Date(variant.createdAt),
              new Date(variant.updatedAt)
            ]
          );
          count++;
          results.success++;
        } catch (error) {
          results.failed++;
        }
      }
      console.log(`  ✅ ${count}/${backup.productVariant.length} varyant eklendi\n`);
      results.details.push({ table: 'ProductVariant', added: count, total: backup.productVariant.length });
    }
    
    // 5. Blog Posts
    if (backup.blogPost && backup.blogPost.length > 0) {
      console.log(`📝 Blog Yazıları (${backup.blogPost.length} kayıt)...`);
      let count = 0;
      for (const blog of backup.blogPost) {
        try {
          // İçeriği güvenli hale getir ve kısalt
          const excerpt = blog.excerpt ? blog.excerpt.replace(/'/g, "''") : '';
          const content = blog.content ? blog.content.replace(/'/g, "''").substring(0, 10000) : '';
          const tagsStr = Array.isArray(blog.tags) ? blog.tags.join(',') : '';
          
          await connection.execute(
            `INSERT INTO BlogPost (id, title, slug, excerpt, content, author, publishedAt, tags, image, readTime, category, viewCount, isPublished, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              blog.id,
              blog.title,
              blog.slug,
              excerpt,
              content,
              blog.author,
              blog.publishedAt ? new Date(blog.publishedAt) : null,
              tagsStr,
              blog.image || '',
              blog.readTime || 0,
              blog.category || '',
              blog.viewCount || 0,
              blog.isPublished ? 1 : 0,
              new Date(blog.createdAt),
              new Date(blog.updatedAt)
            ]
          );
          count++;
          results.success++;
        } catch (error) {
          results.failed++;
          console.log(`  ❌ ${blog.title}: ${error.message}`);
        }
      }
      console.log(`  ✅ ${count}/${backup.blogPost.length} blog yazısı eklendi\n`);
      results.details.push({ table: 'BlogPost', added: count, total: backup.blogPost.length });
    }
    
    // 6. Business
    if (backup.business && backup.business.length > 0) {
      console.log(`🏢 İşletmeler (${backup.business.length} kayıt)...`);
      let count = 0;
      for (const biz of backup.business) {
        try {
          await connection.execute(
            `INSERT INTO Business (id, businessName, businessType, taxNumber, email, phone, address, city, contactName, contactSurname, contactEmail, password, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              biz.id,
              biz.businessName,
              biz.businessType,
              biz.taxNumber,
              biz.email,
              biz.phone,
              biz.address || '',
              biz.city,
              biz.contactName,
              biz.contactSurname,
              biz.contactEmail,
              biz.password || '',
              biz.isActive ? 1 : 0,
              new Date(biz.createdAt),
              new Date(biz.updatedAt)
            ]
          );
          count++;
          results.success++;
        } catch (error) {
          results.failed++;
        }
      }
      console.log(`  ✅ ${count}/${backup.business.length} işletme eklendi\n`);
      results.details.push({ table: 'Business', added: count, total: backup.business.length });
    }
    
    // 7. Shipping Companies
    if (backup.shippingCompany && backup.shippingCompany.length > 0) {
      console.log(`🚚 Kargo Firmaları (${backup.shippingCompany.length} kayıt)...`);
      let count = 0;
      for (const ship of backup.shippingCompany) {
        try {
          await connection.execute(
            `INSERT INTO ShippingCompany (id, name, code, apiUrl, apiKey, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ship.id,
              ship.name,
              ship.code,
              ship.apiUrl || null,
              ship.apiKey || null,
              ship.isActive ? 1 : 0,
              new Date(ship.createdAt),
              new Date(ship.updatedAt)
            ]
          );
          count++;
          results.success++;
        } catch (error) {
          results.failed++;
        }
      }
      console.log(`  ✅ ${count}/${backup.shippingCompany.length} kargo firması eklendi\n`);
      results.details.push({ table: 'ShippingCompany', added: count, total: backup.shippingCompany.length });
    }
    
    // 8. Transfer Notifications
    if (backup.transferNotification && backup.transferNotification.length > 0) {
      console.log(`💸 Transfer Bildirimleri (${backup.transferNotification.length} kayıt)...`);
      let count = 0;
      for (const transfer of backup.transferNotification) {
        try {
          await connection.execute(
            `INSERT INTO TransferNotification (id, orderId, customerName, customerEmail, customerPhone, transferAmount, transferDate, transferNote, status, businessId, iban, accountHolder, bankName, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              transfer.id,
              transfer.orderId,
              transfer.customerName,
              transfer.customerEmail,
              transfer.customerPhone || null,
              transfer.transferAmount,
              new Date(transfer.transferDate),
              transfer.transferNote || null,
              transfer.status || 'PENDING',
              transfer.businessId,
              transfer.iban,
              transfer.accountHolder,
              transfer.bankName,
              new Date(transfer.createdAt),
              new Date(transfer.updatedAt)
            ]
          );
          count++;
          results.success++;
        } catch (error) {
          results.failed++;
        }
      }
      console.log(`  ✅ ${count}/${backup.transferNotification.length} transfer bildirimi eklendi\n`);
      results.details.push({ table: 'TransferNotification', added: count, total: backup.transferNotification.length });
    }
    
    // Özet
    console.log('='.repeat(60));
    console.log('📊 ÖZET RAPOR');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı: ${results.success} kayıt`);
    console.log(`❌ Başarısız: ${results.failed} kayıt`);
    console.log('\n📋 Detaylı Sonuçlar:');
    
    for (const detail of results.details) {
      const percent = detail.total > 0 ? Math.round((detail.added / detail.total) * 100) : 0;
      console.log(`  • ${detail.table}: ${detail.added}/${detail.total} (%${percent})`);
    }
    
    // Veritabanı durumu
    console.log('\n📊 Veritabanı Durumu:');
    const tablesToCheck = ['User', 'Category', 'Product', 'BlogPost', 'ProductVariant', 'ShippingCompany'];
    for (const table of tablesToCheck) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        if (count[0].count > 0) {
          console.log(`  ✅ ${table}: ${count[0].count} kayıt`);
        }
      } catch (error) {
        // Tablo yoksa sessizce geç
      }
    }
    
    console.log('\n🎉 VERİ YÜKLEME TAMAMLANDI!');
    
  } catch (error) {
    console.error('❌ Genel hata:', error.message);
  } finally {
    await connection.end();
  }
}

// Script direkt çalıştırıldığında
if (require.main === module) {
  loadDataToMySQL().catch(console.error);
}

module.exports = { loadDataToMySQL };
