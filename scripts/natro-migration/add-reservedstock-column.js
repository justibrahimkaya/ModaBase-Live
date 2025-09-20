const mysql = require('mysql2/promise');

async function addReservedStockColumn() {
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    port: 3306,
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2'
  });

  try {
    console.log('🔗 Natro MySQL veritabanına bağlanıldı');

    // reservedStock kolonunu ekle
    const addColumnSQL = `
      ALTER TABLE Product 
      ADD COLUMN reservedStock INT DEFAULT 0;
    `;

    await connection.execute(addColumnSQL);
    console.log('✅ reservedStock kolonu başarıyla eklendi');

    // Kolonu kontrol et
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'db8D2' 
      AND TABLE_NAME = 'Product' 
      AND COLUMN_NAME = 'reservedStock'
    `);
    
    if (columns.length > 0) {
      console.log('✅ reservedStock kolonu doğrulandı');
    } else {
      console.log('❌ reservedStock kolonu eklenemedi');
    }

  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ reservedStock kolonu zaten mevcut');
    } else {
      console.error('❌ Hata:', error.message);
    }
  } finally {
    await connection.end();
    console.log('🔌 Bağlantı kapatıldı');
  }
}

addReservedStockColumn();
