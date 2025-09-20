// Veritabanındaki kategorileri kontrol et
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true
      }
    });
    
    console.log('\n📂 Veritabanındaki kategoriler:\n');
    
    if (categories.length === 0) {
      console.log('❌ Hiç kategori bulunamadı!');
      console.log('Önce kategori oluşturmalısınız.');
    } else {
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   ID: ${cat.id}`);
        console.log(`   Slug: ${cat.slug}`);
        console.log(`   Parent: ${cat.parentId || 'Yok'}`);
        console.log('');
      });
      
      console.log('✅ İlk kategori ID\'si:', categories[0].id);
      console.log('Bu ID\'yi test için kullanabilirsiniz.');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
