/**
 * MySQL 5.5 Uyumlu Tablo Oluşturma
 * Basitleştirilmiş versiyon
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function createMySQLTables() {
  console.log('🔄 MySQL 5.5 için tablolar oluşturuluyor...\n');
  
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2',
    multipleStatements: false
  });
  
  try {
    console.log('✅ Bağlantı başarılı!\n');
    
    // Her tabloyu ayrı ayrı oluştur
    const tables = [
      {
        name: 'User',
        sql: `CREATE TABLE IF NOT EXISTS User (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          passwordHash TEXT,
          name VARCHAR(255),
          surname VARCHAR(255),
          phone VARCHAR(50),
          role VARCHAR(50) DEFAULT 'USER',
          isActive TINYINT(1) DEFAULT 1,
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'Category',
        sql: `CREATE TABLE IF NOT EXISTS Category (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          image TEXT,
          defaultTaxRate DECIMAL(10,2) DEFAULT 10.0,
          isActive TINYINT(1) DEFAULT 1,
          parentId VARCHAR(255),
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'Product',
        sql: `CREATE TABLE IF NOT EXISTS Product (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          originalPrice DECIMAL(10,2),
          images TEXT,
          stock INT DEFAULT 0,
          categoryId VARCHAR(255),
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'BlogPost',
        sql: `CREATE TABLE IF NOT EXISTS BlogPost (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          excerpt TEXT,
          content TEXT,
          author VARCHAR(255),
          publishedAt DATETIME,
          tags TEXT,
          image TEXT,
          readTime INT,
          category VARCHAR(100),
          viewCount INT DEFAULT 0,
          isPublished TINYINT(1) DEFAULT 0,
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'OrderTable',
        sql: `CREATE TABLE IF NOT EXISTS OrderTable (
          id VARCHAR(255) PRIMARY KEY,
          userId VARCHAR(255),
          status VARCHAR(50) DEFAULT 'PENDING',
          total DECIMAL(10,2) NOT NULL,
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'OrderItem',
        sql: `CREATE TABLE IF NOT EXISTS OrderItem (
          id VARCHAR(255) PRIMARY KEY,
          orderId VARCHAR(255),
          productId VARCHAR(255),
          quantity INT NOT NULL,
          price DECIMAL(10,2) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'ProductVariant',
        sql: `CREATE TABLE IF NOT EXISTS ProductVariant (
          id VARCHAR(255) PRIMARY KEY,
          productId VARCHAR(255),
          size VARCHAR(50),
          color VARCHAR(100),
          colorCode VARCHAR(10),
          stock INT DEFAULT 0,
          price DECIMAL(10,2),
          isActive TINYINT(1) DEFAULT 1,
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'Business',
        sql: `CREATE TABLE IF NOT EXISTS Business (
          id VARCHAR(255) PRIMARY KEY,
          businessName VARCHAR(255),
          businessType VARCHAR(100),
          taxNumber VARCHAR(20) UNIQUE,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(50),
          address TEXT,
          city VARCHAR(100),
          contactName VARCHAR(255),
          contactSurname VARCHAR(255),
          contactEmail VARCHAR(255),
          password TEXT,
          isActive TINYINT(1) DEFAULT 0,
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'ShippingCompany',
        sql: `CREATE TABLE IF NOT EXISTS ShippingCompany (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) UNIQUE,
          code VARCHAR(100) UNIQUE,
          apiUrl TEXT,
          apiKey TEXT,
          isActive TINYINT(1) DEFAULT 1,
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'SEOSettings',
        sql: `CREATE TABLE IF NOT EXISTS SEOSettings (
          id VARCHAR(255) PRIMARY KEY,
          pageType VARCHAR(50),
          pageId VARCHAR(255),
          productId VARCHAR(255),
          categoryId VARCHAR(255),
          pageSlug VARCHAR(255),
          metaTitle VARCHAR(255),
          metaDescription TEXT,
          keywords TEXT,
          isActive TINYINT(1) DEFAULT 1,
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      },
      {
        name: 'TransferNotification',
        sql: `CREATE TABLE IF NOT EXISTS TransferNotification (
          id VARCHAR(255) PRIMARY KEY,
          orderId VARCHAR(255),
          customerName VARCHAR(255),
          customerEmail VARCHAR(255),
          customerPhone VARCHAR(50),
          transferAmount DECIMAL(10,2),
          transferDate DATETIME,
          transferNote TEXT,
          status VARCHAR(50) DEFAULT 'PENDING',
          businessId VARCHAR(255),
          iban VARCHAR(50),
          accountHolder VARCHAR(255),
          bankName VARCHAR(255),
          createdAt DATETIME,
          updatedAt DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8`
      }
    ];
    
    for (const table of tables) {
      try {
        console.log(`📌 ${table.name} tablosu oluşturuluyor...`);
        await connection.execute(table.sql);
        console.log(`✅ ${table.name} oluşturuldu`);
      } catch (error) {
        console.log(`❌ ${table.name} hatası: ${error.message}`);
      }
    }
    
    // Mevcut tabloları listele
    console.log('\n📋 Oluşturulan tablolar:');
    const [tables_result] = await connection.execute('SHOW TABLES');
    tables_result.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`  ✅ ${tableName}`);
    });
    
    console.log('\n✅ Tablo oluşturma tamamlandı!');
    console.log('📝 Şimdi verileri yükleyebilirsiniz.');
    
  } catch (error) {
    console.error('❌ Genel hata:', error.message);
  } finally {
    await connection.end();
  }
}

// Script direkt çalıştırıldığında
if (require.main === module) {
  createMySQLTables().catch(console.error);
}

module.exports = { createMySQLTables };
