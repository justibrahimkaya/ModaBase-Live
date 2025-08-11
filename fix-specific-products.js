const { PrismaClient } = require('@prisma/client');

async function fixSpecificProducts() {
  console.log('🔧 SPESİFİK ÜRÜNLER İÇİN DATABASE TEMİZLEME\n');
  
  const prisma = new PrismaClient();
  
  // Google Search Console'dan gelen hatalı ürün slug'ları
  const problematicSlugs = [
    'mb-000052-sahra-isiltisi-elbise',
    'mb-000057-yazlik-triko',
    'mb-000056-omzuacik-elbise', 
    'mb-000055-askili-elbise',
    'mb-000054-askili-yazlik',
    'mb-000045-kurdele-detayli-triko-crop-suveter-yeni',
    'mb-000053',
    'mb-000043',
    'mb-000042fit-kesim-cizgili-triko-bluz',
    'mb-000041-duz-formlu-triko-maxi-elbise',
    'mb-000040-fitilli-crop',
    'mb-000039cizgili-relax-fit-i-kili-takim'
  ];
  
  console.log(`🎯 Düzeltilecek ürün sayısı: ${problematicSlugs.length}\n`);
  
  try {
    // Bu slug'lara sahip ürünleri bul
    const products = await prisma.product.findMany({
      where: {
        slug: {
          in: problematicSlugs
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        structuredData: true
      }
    });
    
    console.log(`📊 Database'de bulunan ürün sayısı: ${products.length}\n`);
    
    if (products.length === 0) {
      console.log('❌ Hiç ürün bulunamadı! Slug\'lar yanlış olabilir.');
      
      // Alternatif: Name ile ara
      console.log('\n🔍 Name içeriğine göre arama yapılıyor...');
      
      const alternativeProducts = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: 'sahra ışıltısı' } },
            { name: { contains: 'yazlık-triko' } },
            { name: { contains: 'omzuaçık' } },
            { name: { contains: 'askılı' } },
            { name: { contains: 'Kurdele Detaylı' } },
            { name: { contains: 'fitilli crop' } },
            { name: { contains: 'Çizgili Relax' } }
          ]
        },
        select: {
          id: true,
          name: true,
          slug: true,
          structuredData: true
        }
      });
      
      console.log(`📊 Name ile bulunan ürün: ${alternativeProducts.length}`);
      
      if (alternativeProducts.length > 0) {
        console.log('\n📋 Bulunan ürünler:');
        alternativeProducts.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`);
          console.log(`   Slug: ${product.slug}`);
          console.log(`   structuredData: ${product.structuredData ? 'VAR' : 'YOK'}`);
          console.log('');
        });
      }
      
      return;
    }
    
    // Bulunan ürünleri kontrol et
    console.log('📋 BULUNAN ÜRÜNLER:\n');
    
    let corruptedCount = 0;
    let cleanCount = 0;
    const corruptedIds = [];
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      
      if (!product.structuredData) {
        console.log(`   ✅ structuredData zaten NULL`);
        cleanCount++;
      } else {
        try {
          JSON.parse(product.structuredData);
          console.log(`   ✅ structuredData geçerli JSON`);
          cleanCount++;
        } catch (error) {
          console.log(`   ❌ BOZUK JSON: ${error.message}`);
          corruptedCount++;
          corruptedIds.push(product.id);
        }
      }
      console.log('');
    });
    
    console.log(`📊 Temiz ürün: ${cleanCount}`);
    console.log(`📊 Bozuk ürün: ${corruptedCount}\n`);
    
    if (corruptedCount > 0) {
      console.log('🔧 BOZUK STRUCTURED DATA TEMİZLENİYOR...\n');
      
      const updateResult = await prisma.product.updateMany({
        where: {
          id: {
            in: corruptedIds
          }
        },
        data: {
          structuredData: null
        }
      });
      
      console.log(`✅ ${updateResult.count} ürünün structured data'si temizlendi`);
      console.log('✅ ProductSEOHead artık otomatik Product schema üretecek');
      console.log('✅ Bu ürünlerde Google image hatası kaybolacak!');
      
    } else {
      console.log('🤔 Tüm ürünler temiz ama halen sorun var...');
      console.log('💡 Cache sorunu olabilir veya başka bir neden var');
    }
    
  } catch (error) {
    console.log(`❌ Database hatası: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

fixSpecificProducts();