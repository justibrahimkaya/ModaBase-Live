const mysql = require('mysql2/promise');

async function addAllMissingColumns() {
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    port: 3306,
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2'
  });

  try {
    console.log('🔗 Natro MySQL veritabanına bağlanıldı');

    // Tüm eksik kolonları tek seferde ekle
    const columnsToAdd = [
      'ADD COLUMN minStockLevel INT DEFAULT 0',
      'ADD COLUMN maxStockLevel INT DEFAULT 9999', 
      'ADD COLUMN reservedStock INT DEFAULT 0',
      'ADD COLUMN taxRate DECIMAL(5,2) DEFAULT 18.00',
      'ADD COLUMN metaTitle VARCHAR(255)',
      'ADD COLUMN metaDescription TEXT'
    ];

    // Her kolonu tek tek ekle (ALTER TABLE sadece bir kolon alabilir)
    for (const column of columnsToAdd) {
      try {
        const addColumnSQL = `ALTER TABLE Product ${column}`;
        await connection.execute(addColumnSQL);
        console.log(`✅ ${column.split(' ')[2]} kolonu eklendi`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`✅ ${column.split(' ')[2]} kolonu zaten mevcut`);
        } else {
          console.error(`❌ ${column.split(' ')[2]} kolonu eklenemedi:`, error.message);
        }
      }
    }

    // Tüm kolonları kontrol et
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'db8D2' 
      AND TABLE_NAME = 'Product'
      ORDER BY COLUMN_NAME
    `);
    
    console.log('📋 Mevcut Product tablosu kolonları:');
    columns.forEach(col => console.log(`  - ${col.COLUMN_NAME}`));

  } catch (error) {
    console.error('❌ Genel hata:', error.message);
  } finally {
    await connection.end();
    console.log('🔌 Bağlantı kapatıldı');
  }
}

addAllMissingColumns();
