const { PrismaClient } = require('@prisma/client');

async function checkProductData() {
  console.log('🔍 ÜRÜN VERİSİ KONTROLÜ\n');
  
  const prisma = new PrismaClient();
  
  try {
    const product = await prisma.product.findUnique({
      where: { slug: 'mb-000052-sahra-isiltisi-elbise' },
      include: {
        category: true
      }
    });
    
    if (!product) {
      console.log('❌ Ürün bulunamadı!');
      return;
    }
    
    console.log('✅ ÜRÜN BULUNDU:\n');
    console.log(`📦 ID: ${product.id}`);
    console.log(`📦 Name: ${product.name}`);
    console.log(`📦 Slug: ${product.slug}`);
    console.log(`📦 Description: ${product.description?.substring(0, 100)}...`);
    console.log(`📦 Price: ${product.price}`);
    console.log(`📦 Category: ${product.category?.name}`);
    
    // Images kontrol
    let images = [];
    try {
      images = JSON.parse(product.images || '[]');
      console.log(`📦 Images: ${images.length} adet`);
      
      if (images.length > 0) {
        console.log(`   İlk image: ${images[0].substring(0, 50)}...`);
        console.log(`   Tip: ${images[0].startsWith('data:') ? 'BASE64' : 'HTTP'}`);
      }
    } catch (e) {
      console.log(`📦 Images: Parse hatası - ${e.message}`);
    }
    
    // StructuredData kontrol
    console.log(`📦 StructuredData: ${product.structuredData ? 'VAR' : 'NULL'}`);
    
    if (product.structuredData) {
      try {
        const parsed = JSON.parse(product.structuredData);
        console.log(`   Parse başarılı: @type=${parsed['@type']}`);
      } catch (e) {
        console.log(`   Parse hatası: ${e.message}`);
      }
    }
    
    // SEO alanları kontrol
    console.log('\n📋 SEO ALANLARI:');
    console.log(`   metaTitle: ${product.metaTitle || 'NULL'}`);
    console.log(`   metaDescription: ${product.metaDescription || 'NULL'}`);
    console.log(`   brand: ${product.brand || 'NULL'}`);
    console.log(`   sku: ${product.sku || 'NULL'}`);
    console.log(`   condition: ${product.condition || 'NULL'}`);
    console.log(`   availability: ${product.availability || 'NULL'}`);
    
    // ProductSEOHead'in ihtiyacı olan tüm alanlar var mı?
    console.log('\n🔍 PRODUCTSEOHead KONTROL:');
    
    const requiredFields = [
      'name', 'description', 'price', 'images'
    ];
    
    let missingFields = [];
    requiredFields.forEach(field => {
      if (!product[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length === 0) {
      console.log('✅ Tüm gerekli alanlar mevcut');
    } else {
      console.log(`❌ Eksik alanlar: ${missingFields.join(', ')}`);
    }
    
    // Structured data oluşturma simülasyonu
    console.log('\n🧪 STRUCTURED DATA SİMÜLASYON:');
    
    try {
      const metaDescription = product.metaDescription || product.description?.substring(0, 160) || '';
      
      const structuredData = product.structuredData ? JSON.parse(product.structuredData) : {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "description": metaDescription,
        "brand": {
          "@type": "Brand",
          "name": product.brand || "ModaBase"
        },
        "category": product.category?.name,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock",
          "condition": "https://schema.org/NewCondition",
          "seller": {
            "@type": "Organization",
            "name": "ModaBase"
          }
        }
      };
      
      console.log('✅ Structured data oluşturulabilir');
      console.log(`📊 JSON boyutu: ${JSON.stringify(structuredData).length} karakter`);
      console.log(`🔍 @type: ${structuredData['@type']}`);
      console.log(`🔍 name: ${structuredData.name}`);
      console.log(`🔍 price: ${structuredData.offers?.price}`);
      console.log(`🔍 image var mı: ${structuredData.image ? 'VAR' : 'YOK'}`);
      
    } catch (error) {
      console.log(`❌ Structured data oluşturulamadı: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Database hatası: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductData();