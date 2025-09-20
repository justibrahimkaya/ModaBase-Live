const mysql = require('mysql2/promise');

async function createReviewTable() {
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    port: 3306,
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2'
  });

  try {
    console.log('🔗 Natro MySQL veritabanına bağlanıldı');

    // Review tablosunu oluştur (MySQL 5.5 uyumlu)
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS review (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId INT,
        userId INT,
        rating INT,
        comment TEXT,
        createdAt DATETIME,
        updatedAt DATETIME,
        INDEX idx_productId (productId),
        INDEX idx_userId (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Review tablosu başarıyla oluşturuldu');

    // Tabloyu kontrol et
    const [tables] = await connection.execute('SHOW TABLES LIKE "review"');
    if (tables.length > 0) {
      console.log('✅ Review tablosu doğrulandı');
    } else {
      console.log('❌ Review tablosu oluşturulamadı');
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await connection.end();
    console.log('🔌 Bağlantı kapatıldı');
  }
}

createReviewTable();
