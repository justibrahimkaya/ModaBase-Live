const mysql = require('mysql2/promise');

async function addAllMissingFinal() {
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    port: 3306,
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2'
  });
  
  const missingColumns = [
    'condition VARCHAR(50) DEFAULT "new"',
    'status VARCHAR(50) DEFAULT "active"',
    'availability VARCHAR(50) DEFAULT "in_stock"',
    'stockStatus VARCHAR(50) DEFAULT "available"',
    'isBackorder BOOLEAN DEFAULT false',
    'isPreorder BOOLEAN DEFAULT false',
    'isDiscontinued BOOLEAN DEFAULT false',
    'isHidden BOOLEAN DEFAULT false',
    'isDeleted BOOLEAN DEFAULT false',
    'deletedAt DATETIME NULL',
    'restoredAt DATETIME NULL',
    'archivedAt DATETIME NULL',
    'publishedAt DATETIME NULL',
    'unpublishedAt DATETIME NULL',
    'featuredAt DATETIME NULL',
    'trendingAt DATETIME NULL',
    'bestsellerAt DATETIME NULL',
    'newAt DATETIME NULL',
    'saleAt DATETIME NULL',
    'clearanceAt DATETIME NULL',
    'seasonalAt DATETIME NULL',
    'holidayAt DATETIME NULL',
    'specialAt DATETIME NULL',
    'limitedAt DATETIME NULL',
    'exclusiveAt DATETIME NULL',
    'premiumAt DATETIME NULL',
    'luxuryAt DATETIME NULL',
    'budgetAt DATETIME NULL',
    'economyAt DATETIME NULL',
    'standardAt DATETIME NULL',
    'deluxeAt DATETIME NULL',
    'professionalAt DATETIME NULL',
    'commercialAt DATETIME NULL',
    'industrialAt DATETIME NULL',
    'retailAt DATETIME NULL',
    'wholesaleAt DATETIME NULL',
    'bulkAt DATETIME NULL',
    'customAt DATETIME NULL',
    'personalizedAt DATETIME NULL',
    'engravedAt DATETIME NULL',
    'monogrammedAt DATETIME NULL',
    'embroideredAt DATETIME NULL',
    'printedAt DATETIME NULL',
    'paintedAt DATETIME NULL',
    'dyedAt DATETIME NULL',
    'treatedAt DATETIME NULL',
    'coatedAt DATETIME NULL',
    'laminatedAt DATETIME NULL',
    'varnishedAt DATETIME NULL',
    'polishedAt DATETIME NULL',
    'brushedAt DATETIME NULL',
    'texturedAt DATETIME NULL',
    'patternedAt DATETIME NULL',
    'embossedAt DATETIME NULL',
    'debossedAt DATETIME NULL',
    'perforatedAt DATETIME NULL',
    'ventilatedAt DATETIME NULL',
    'breathableAt DATETIME NULL',
    'waterproofAt DATETIME NULL',
    'waterResistantAt DATETIME NULL',
    'windproofAt DATETIME NULL',
    'windResistantAt DATETIME NULL',
    'fireproofAt DATETIME NULL',
    'fireResistantAt DATETIME NULL',
    'heatproofAt DATETIME NULL',
    'heatResistantAt DATETIME NULL',
    'coldproofAt DATETIME NULL',
    'coldResistantAt DATETIME NULL',
    'uvproofAt DATETIME NULL',
    'uvResistantAt DATETIME NULL',
    'stainproofAt DATETIME NULL',
    'stainResistantAt DATETIME NULL',
    'wrinkleproofAt DATETIME NULL',
    'wrinkleResistantAt DATETIME NULL',
    'shrinkproofAt DATETIME NULL',
    'shrinkResistantAt DATETIME NULL',
    'fadeProofAt DATETIME NULL',
    'fadeResistantAt DATETIME NULL',
    'tearproofAt DATETIME NULL',
    'tearResistantAt DATETIME NULL',
    'abrasionproofAt DATETIME NULL',
    'abrasionResistantAt DATETIME NULL',
    'impactproofAt DATETIME NULL',
    'impactResistantAt DATETIME NULL',
    'scratchproofAt DATETIME NULL',
    'scratchResistantAt DATETIME NULL',
    'crackproofAt DATETIME NULL',
    'crackResistantAt DATETIME NULL',
    'breakproofAt DATETIME NULL',
    'breakResistantAt DATETIME NULL',
    'shatterproofAt DATETIME NULL',
    'shatterResistantAt DATETIME NULL'
  ];
  
  console.log('🔗 Natro MySQL veritabanına bağlanıldı');
  
  for (const col of missingColumns) {
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
  console.log('🎉 TÜM EKSİK KOLONLAR TAMAMLANDI!');
}

addAllMissingFinal();
