const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 Veritabanındaki ürünler kontrol ediliyor...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      },
      take: 5
    });

    console.log('📦 Bulunan ürünler:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ID: ${product.id}`);
      console.log(`   Ad: ${product.name}`);
      console.log(`   Fiyat: ${product.price} TL`);
      console.log(`   Stok: ${product.stock}`);
      console.log('');
    });

    if (products.length === 0) {
      console.log('❌ Hiç ürün bulunamadı!');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts(); 