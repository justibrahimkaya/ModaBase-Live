// Stok Düzeltme Script'i
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixStock() {
  try {
    console.log('🔧 Stok düzeltme başlatılıyor...');
    
    // test1 ürününü bul
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'test1',
          mode: 'insensitive'
        }
      }
    });
    
    if (!product) {
      console.log('❌ test1 ürünü bulunamadı');
      return;
    }
    
    console.log('📦 Ürün bulundu:', product.name);
    console.log('🔢 Mevcut stok:', product.stock);
    
    // Stoku 100'e çıkar
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { stock: 100 }
    });
    
    console.log('✅ Stok güncellendi:', updatedProduct.stock);
    
    // Tüm ürünlerin stokunu kontrol et
    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, stock: true }
    });
    
    console.log('📋 Tüm ürünlerin stok durumu:');
    allProducts.forEach(p => {
      console.log(`   ${p.name}: ${p.stock} adet`);
    });
    
  } catch (error) {
    console.error('💥 Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStock(); 