const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    });
    
    console.log('📦 Toplam ürün sayısı:', products.length);
    console.log('\n🔍 MB-000052 ile ilgili ürünler:');
    
    products.forEach(product => {
      if (product.name.toLowerCase().includes('sahra') || 
          product.id.toLowerCase().includes('000052') ||
          product.name.toLowerCase().includes('ışıltısı')) {
        console.log('\n✅ Eşleşen ürün:');
        console.log('   ID:', product.id);
        console.log('   Name:', product.name);
        console.log('   Images:', product.images);
        
        // Image analysis
        if (product.images && product.images.length > 0) {
          const firstImage = product.images[0];
          if (firstImage && !firstImage.startsWith('data:image/') && firstImage.startsWith('http')) {
            console.log('   🖼️ Image status: ✅ Geçerli HTTP URL');
          } else {
            console.log('   🖼️ Image status: ❌ Geçersiz (base64 veya yok)');
          }
        } else {
          console.log('   🖼️ Image status: ❌ Hiç image yok');
        }
      }
    });
    
    console.log('\n📋 İlk 5 ürün:');
    products.slice(0, 5).forEach(product => {
      console.log(`   ${product.id}: ${product.name}`);
    });
    
  } catch (error) {
    console.log('❌ Database hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllProducts();