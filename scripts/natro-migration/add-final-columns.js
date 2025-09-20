const mysql = require('mysql2/promise');

async function addFinalColumns() {
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    port: 3306,
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2'
  });
  
  const finalColumns = [
    'gtin VARCHAR(50)',
    'ean VARCHAR(50)',
    'upc VARCHAR(50)',
    'isbn VARCHAR(50)',
    'asin VARCHAR(50)',
    'mpn VARCHAR(100)',
    'manufacturer VARCHAR(255)',
    'supplier VARCHAR(255)',
    'costPrice DECIMAL(10,2)',
    'salePrice DECIMAL(10,2)',
    'discountPrice DECIMAL(10,2)',
    'discountPercent DECIMAL(5,2)',
    'isNew BOOLEAN DEFAULT false',
    'isBestSeller BOOLEAN DEFAULT false',
    'isTrending BOOLEAN DEFAULT false',
    'isRecommended BOOLEAN DEFAULT false',
    'isLimited BOOLEAN DEFAULT false',
    'isExclusive BOOLEAN DEFAULT false',
    'isPreOrder BOOLEAN DEFAULT false',
    'preOrderDate DATETIME',
    'releaseDate DATETIME',
    'warrantyPeriod VARCHAR(100)',
    'returnPeriod INT DEFAULT 14',
    'shippingWeight DECIMAL(8,2)',
    'shippingDimensions VARCHAR(255)',
    'requiresShipping BOOLEAN DEFAULT true',
    'isGift BOOLEAN DEFAULT false',
    'giftMessage TEXT',
    'isBundle BOOLEAN DEFAULT false',
    'bundleItems TEXT',
    'isSubscription BOOLEAN DEFAULT false',
    'subscriptionInterval VARCHAR(50)',
    'subscriptionPrice DECIMAL(10,2)',
    'isRecurring BOOLEAN DEFAULT false',
    'recurringInterval VARCHAR(50)',
    'minQuantity INT DEFAULT 1',
    'maxQuantity INT DEFAULT 999',
    'stepQuantity INT DEFAULT 1',
    'isRequired BOOLEAN DEFAULT true',
    'isVisible BOOLEAN DEFAULT true',
    'isSearchable BOOLEAN DEFAULT true',
    'isComparable BOOLEAN DEFAULT true',
    'isReviewable BOOLEAN DEFAULT true',
    'isShareable BOOLEAN DEFAULT true',
    'isWishlistable BOOLEAN DEFAULT true',
    'isCartable BOOLEAN DEFAULT true',
    'isCheckoutable BOOLEAN DEFAULT true',
    'isPurchasable BOOLEAN DEFAULT true',
    'isDownloadable BOOLEAN DEFAULT false',
    'isVirtual BOOLEAN DEFAULT false',
    'isService BOOLEAN DEFAULT false',
    'isRental BOOLEAN DEFAULT false',
    'isAuction BOOLEAN DEFAULT false',
    'isBidding BOOLEAN DEFAULT false',
    'isNegotiable BOOLEAN DEFAULT false',
    'isCustomizable BOOLEAN DEFAULT false',
    'isPersonalizable BOOLEAN DEFAULT false',
    'isConfigurable BOOLEAN DEFAULT false',
    'isVariable BOOLEAN DEFAULT false',
    'isGrouped BOOLEAN DEFAULT false',
    'isComposite BOOLEAN DEFAULT false',
    'isSimple BOOLEAN DEFAULT true'
  ];
  
  console.log('🔗 Natro MySQL veritabanına bağlanıldı');
  
  for (const col of finalColumns) {
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
  console.log('🎉 TÜM SON KOLONLAR TAMAMLANDI!');
}

addFinalColumns();
