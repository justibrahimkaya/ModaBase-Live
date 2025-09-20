const mysql = require('mysql2/promise');

async function addAllRemainingColumns() {
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    port: 3306,
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2'
  });
  
  const columns = [
    'brand VARCHAR(255)',
    'weight DECIMAL(8,2)',
    'dimensions VARCHAR(255)',
    'material VARCHAR(255)',
    'color VARCHAR(100)',
    'size VARCHAR(50)',
    'sku VARCHAR(100)',
    'barcode VARCHAR(100)',
    'isDigital BOOLEAN DEFAULT false',
    'downloadUrl TEXT',
    'seoTitle VARCHAR(255)',
    'seoDescription TEXT',
    'featured BOOLEAN DEFAULT false',
    'onSale BOOLEAN DEFAULT false',
    'isActive BOOLEAN DEFAULT true',
    'sortOrder INT DEFAULT 0'
  ];
  
  console.log('🔗 Natro MySQL veritabanına bağlanıldı');
  
  for (const col of columns) {
    try {
      await connection.execute(`ALTER TABLE Product ADD COLUMN ${col}`);
      console.log(`✅ ${col.split(' ')[0]} eklendi`);
    } catch (e) {
      if (e.message.includes('Duplicate')) {
        console.log(`✅ ${col.split(' ')[0]} zaten mevcut`);
      } else {
        console.error(`❌ ${col.split(' ')[0]} hatası:`, e.message);
      }
    }
  }
  
  await connection.end();
  console.log('🎉 TÜM KOLONLAR TAMAMLANDI!');
}

addAllRemainingColumns();
