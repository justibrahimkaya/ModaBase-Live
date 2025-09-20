const mysql = require('mysql2/promise');

async function addConditionColumn() {
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    port: 3306,
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2'
  });
  
  try {
    console.log('🔗 Natro MySQL veritabanına bağlanıldı');
    
    // condition kolonunu ekle (backtick kullan)
    await connection.execute('ALTER TABLE Product ADD COLUMN `condition` VARCHAR(50) DEFAULT "new"');
    console.log('✅ condition kolonu eklendi');
    
  } catch (e) {
    if (e.message.includes('Duplicate')) {
      console.log('✅ condition kolonu zaten mevcut');
    } else {
      console.error('❌ Hata:', e.message);
    }
  } finally {
    await connection.end();
    console.log('🔌 Bağlantı kapatıldı');
  }
}

addConditionColumn();
