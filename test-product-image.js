const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProduct() {
  try {
    const product = await prisma.product.findUnique({
      where: { id: 'mb-000052-sahra-isiltisi-elbise' }
    });
    
    if (product) {
      console.log('✅ Ürün bulundu:', product.name);
      console.log('🖼️ Images:', product.images);
      console.log('📝 Description:', product.description ? '✅ MEVCUT' : '❌ EKSİK');
      console.log('💰 Price:', product.price);
      console.log('🏷️ Brand:', product.brand);
      
      // Image URL testi
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        console.log('🔍 First image:', firstImage);
        
        if (firstImage && !firstImage.startsWith('data:image/') && firstImage.startsWith('http')) {
          console.log('✅ Image URL geçerli');
        } else {
          console.log('❌ Image URL geçersiz - default kullanılacak');
        }
      } else {
        console.log('❌ Hiç image yok - default kullanılacak');
      }
      
      // getValidImageUrl fonksiyonunu test et
      const getValidImageUrl = () => {
        if (product.images && product.images.length > 0) {
          const firstImage = product.images[0];
          if (firstImage && !firstImage.startsWith('data:image/') && firstImage.startsWith('http')) {
            return firstImage;
          }
        }
        return 'https://modabase.com.tr/default-product.svg';
      };
      
      console.log('🎯 Final image URL:', getValidImageUrl());
      
    } else {
      console.log('❌ Ürün bulunamadı!');
    }
  } catch (error) {
    console.log('❌ Database hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();