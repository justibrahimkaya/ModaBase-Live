/**
 * MySQL SQL Dosyası Oluşturucu
 * JSON backup'tan MySQL SQL dosyası oluşturur
 */

const fs = require('fs').promises;
const path = require('path');

async function generateMySQLScript() {
  console.log('🔄 MySQL SQL dosyası oluşturuluyor...\n');
  
  // En son backup'ı bul
  const backupDir = path.join(__dirname, 'backup', '2025-09-20');
  const backupFile = path.join(backupDir, 'full-backup.json');
  
  try {
    const backup = JSON.parse(await fs.readFile(backupFile, 'utf8'));
    
    let sql = `-- ModaBase MySQL Migration Script
-- Generated: ${new Date().toISOString()}
-- Source: Supabase PostgreSQL
-- Target: Natro MySQL (db8D2)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- TABLO YAPILARI
-- =============================================

`;

    // Önce tablo yapılarını oluştur
    sql += generateTableStructures();
    
    sql += `
-- =============================================
-- VERİ EKLEME
-- =============================================

`;
    
    // Users
    if (backup.user && backup.user.length > 0) {
      sql += `-- Users (${backup.user.length} kayıt)\n`;
      sql += `INSERT INTO User (id, email, passwordHash, name, surname, phone, role, isActive, createdAt, updatedAt) VALUES\n`;
      const userValues = backup.user.map(u => {
        return `('${u.id}', '${u.email}', ${u.passwordHash ? `'${u.passwordHash}'` : 'NULL'}, ${u.name ? `'${u.name}'` : 'NULL'}, ${u.surname ? `'${u.surname}'` : 'NULL'}, ${u.phone ? `'${u.phone}'` : 'NULL'}, '${u.role || 'USER'}', ${u.isActive ? 1 : 0}, '${u.createdAt}', '${u.updatedAt}')`;
      });
      sql += userValues.join(',\n') + ';\n\n';
    }
    
    // Categories
    if (backup.category && backup.category.length > 0) {
      sql += `-- Categories (${backup.category.length} kayıt)\n`;
      sql += `INSERT INTO Category (id, name, slug, description, image, defaultTaxRate, isActive, createdAt, updatedAt) VALUES\n`;
      const categoryValues = backup.category.map(c => {
        const desc = c.description ? c.description.replace(/'/g, "\\'") : null;
        return `('${c.id}', '${c.name}', '${c.slug}', ${desc ? `'${desc}'` : 'NULL'}, ${c.image ? `'${c.image}'` : 'NULL'}, ${c.defaultTaxRate || 10}, ${c.isActive ? 1 : 0}, '${c.createdAt}', '${c.updatedAt}')`;
      });
      sql += categoryValues.join(',\n') + ';\n\n';
    }
    
    // Products
    if (backup.product && backup.product.length > 0) {
      sql += `-- Products (${backup.product.length} kayıt)\n`;
      sql += `INSERT INTO Product (id, name, slug, description, price, originalPrice, images, stock, categoryId, createdAt, updatedAt) VALUES\n`;
      const productValues = backup.product.map(p => {
        const desc = p.description ? p.description.replace(/'/g, "\\'") : '';
        return `('${p.id}', '${p.name}', '${p.slug}', '${desc}', ${p.price}, ${p.originalPrice || 'NULL'}, '${p.images}', ${p.stock || 0}, '${p.categoryId}', '${p.createdAt}', '${p.updatedAt}')`;
      });
      sql += productValues.join(',\n') + ';\n\n';
    }
    
    // BlogPosts
    if (backup.blogPost && backup.blogPost.length > 0) {
      sql += `-- BlogPosts (${backup.blogPost.length} kayıt)\n`;
      sql += `INSERT INTO BlogPost (id, title, slug, excerpt, content, author, tags, image, readTime, category, viewCount, isPublished, createdAt, updatedAt) VALUES\n`;
      const blogValues = backup.blogPost.map(b => {
        const excerpt = b.excerpt ? b.excerpt.replace(/'/g, "\\'") : '';
        const content = b.content ? b.content.replace(/'/g, "\\'").substring(0, 5000) : ''; // Limit content
        const tags = JSON.stringify(b.tags || []);
        return `('${b.id}', '${b.title}', '${b.slug}', '${excerpt}', '${content}', '${b.author}', '${tags}', '${b.image}', ${b.readTime}, '${b.category}', ${b.viewCount || 0}, ${b.isPublished ? 1 : 0}, '${b.createdAt}', '${b.updatedAt}')`;
      });
      sql += blogValues.join(',\n') + ';\n\n';
    }
    
    sql += `
-- =============================================
-- SONUÇ
-- =============================================

SET FOREIGN_KEY_CHECKS = 1;

-- Migration tamamlandı!
-- Toplam kayıt: ${Object.values(backup).reduce((sum, arr) => sum + (arr.length || 0), 0)}
`;
    
    // SQL dosyasını kaydet
    const sqlFile = path.join(__dirname, 'mysql-import.sql');
    await fs.writeFile(sqlFile, sql, 'utf8');
    
    console.log('✅ SQL dosyası oluşturuldu!');
    console.log(`📁 Dosya: ${sqlFile}`);
    console.log(`📊 Boyut: ${(sql.length / 1024).toFixed(2)} KB`);
    console.log('\n📝 phpMyAdmin üzerinden bu dosyayı import edebilirsiniz.');
    
    return sqlFile;
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    return null;
  }
}

function generateTableStructures() {
  return `
-- User tablosu
CREATE TABLE IF NOT EXISTS User (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash TEXT,
  resetToken VARCHAR(255),
  resetTokenExpiry DATETIME,
  name VARCHAR(255),
  surname VARCHAR(255),
  phone VARCHAR(50),
  image TEXT,
  emailVerified DATETIME,
  provider VARCHAR(100),
  role VARCHAR(50) DEFAULT 'USER',
  adminStatus VARCHAR(50),
  appliedAt DATETIME,
  approvedAt DATETIME,
  rejectedAt DATETIME,
  rejectionReason TEXT,
  businessInfo TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  lastLoginAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Category tablosu
CREATE TABLE IF NOT EXISTS Category (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  defaultTaxRate FLOAT DEFAULT 10.0,
  isActive BOOLEAN DEFAULT TRUE,
  parentId VARCHAR(255),
  businessId VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent (parentId),
  INDEX idx_business (businessId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product tablosu
CREATE TABLE IF NOT EXISTS Product (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price FLOAT NOT NULL,
  originalPrice FLOAT,
  images TEXT NOT NULL,
  stock INT DEFAULT 0,
  minStockLevel INT DEFAULT 5,
  maxStockLevel INT,
  reservedStock INT DEFAULT 0,
  taxRate FLOAT DEFAULT 10.0,
  categoryId VARCHAR(255) NOT NULL,
  metaTitle VARCHAR(255),
  metaDescription TEXT,
  keywords TEXT,
  brand VARCHAR(255),
  sku VARCHAR(100),
  color VARCHAR(100),
  size VARCHAR(100),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (categoryId),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BlogPost tablosu
CREATE TABLE IF NOT EXISTS BlogPost (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  publishedAt DATETIME,
  tags JSON,
  image TEXT NOT NULL,
  readTime INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  viewCount INT DEFAULT 0,
  isPublished BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_published (publishedAt),
  INDEX idx_is_published (isPublished)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Diğer tablolar buraya eklenebilir...
`;
}

// Script direkt çalıştırıldığında
if (require.main === module) {
  generateMySQLScript().catch(console.error);
}

module.exports = { generateMySQLScript };
