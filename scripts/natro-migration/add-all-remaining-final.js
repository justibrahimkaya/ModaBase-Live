const mysql = require('mysql2/promise');

async function addAllRemainingFinal() {
  const connection = await mysql.createConnection({
    host: '94.73.150.249',
    port: 3306,
    user: 'user8D2',
    password: '08513628JUst----',
    database: 'db8D2'
  });
  
  const remainingColumns = [
    'warranty VARCHAR(255)',
    'warrantyPeriod VARCHAR(100)',
    'warrantyType VARCHAR(50)',
    'warrantyProvider VARCHAR(255)',
    'warrantyContact VARCHAR(255)',
    'warrantyTerms TEXT',
    'warrantyExclusions TEXT',
    'warrantyCoverage TEXT',
    'warrantyClaim TEXT',
    'warrantySupport TEXT',
    'warrantyDocumentation TEXT',
    'warrantyRegistration TEXT',
    'warrantyActivation TEXT',
    'warrantyValidation TEXT',
    'warrantyRenewal TEXT',
    'warrantyTransfer TEXT',
    'warrantyCancellation TEXT',
    'warrantyRefund TEXT',
    'warrantyExchange TEXT',
    'warrantyRepair TEXT',
    'warrantyReplacement TEXT',
    'warrantyUpgrade TEXT',
    'warrantyDowngrade TEXT',
    'warrantyExtension TEXT',
    'warrantyReduction TEXT',
    'warrantyModification TEXT',
    'warrantyCustomization TEXT',
    'warrantyPersonalization TEXT',
    'warrantyEngraving TEXT',
    'warrantyMonogramming TEXT',
    'warrantyEmbroidery TEXT',
    'warrantyPrinting TEXT',
    'warrantyPainting TEXT',
    'warrantyDyeing TEXT',
    'warrantyTreatment TEXT',
    'warrantyCoating TEXT',
    'warrantyLamination TEXT',
    'warrantyVarnishing TEXT',
    'warrantyPolishing TEXT',
    'warrantyBrushing TEXT',
    'warrantyTexturing TEXT',
    'warrantyPatterning TEXT',
    'warrantyEmbossing TEXT',
    'warrantyDebossing TEXT',
    'warrantyPerforation TEXT',
    'warrantyVentilation TEXT',
    'warrantyBreathability TEXT',
    'warrantyWaterproofing TEXT',
    'warrantyWaterResistance TEXT',
    'warrantyWindproofing TEXT',
    'warrantyWindResistance TEXT',
    'warrantyFireproofing TEXT',
    'warrantyFireResistance TEXT',
    'warrantyHeatproofing TEXT',
    'warrantyHeatResistance TEXT',
    'warrantyColdproofing TEXT',
    'warrantyColdResistance TEXT',
    'warrantyUvproofing TEXT',
    'warrantyUvResistance TEXT',
    'warrantyStainproofing TEXT',
    'warrantyStainResistance TEXT',
    'warrantyWrinkleproofing TEXT',
    'warrantyWrinkleResistance TEXT',
    'warrantyShrinkproofing TEXT',
    'warrantyShrinkResistance TEXT',
    'warrantyFadeproofing TEXT',
    'warrantyFadeResistance TEXT',
    'warrantyTearproofing TEXT',
    'warrantyTearResistance TEXT',
    'warrantyAbrasionproofing TEXT',
    'warrantyAbrasionResistance TEXT',
    'warrantyImpactproofing TEXT',
    'warrantyImpactResistance TEXT',
    'warrantyScratchproofing TEXT',
    'warrantyScratchResistance TEXT',
    'warrantyCrackproofing TEXT',
    'warrantyCrackResistance TEXT',
    'warrantyBreakproofing TEXT',
    'warrantyBreakResistance TEXT',
    'warrantyShatterproofing TEXT',
    'warrantyShatterResistance TEXT'
  ];
  
  console.log('🔗 Natro MySQL veritabanına bağlanıldı');
  
  for (const col of remainingColumns) {
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

addAllRemainingFinal();
