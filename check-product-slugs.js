const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProductSlugs() {
  try {
    console.log('🔍 Ürün slug kontrolü başlatılıyor...\n');

    // Tüm ürünleri al
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true,
        category: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`📊 Toplam ürün sayısı: ${products.length}`);

    // Slug'ı olmayan ürünleri bul
    const productsWithoutSlug = products.filter(p => !p.slug || p.slug === '');
    const productsWithSlug = products.filter(p => p.slug && p.slug !== '');

    console.log(`✅ Slug'ı olan ürünler: ${productsWithSlug.length}`);
    console.log(`❌ Slug'ı OLMAYAN ürünler: ${productsWithoutSlug.length}\n`);

    if (productsWithoutSlug.length > 0) {
      console.log('⚠️ Slug\'ı olmayan ürünler:');
      console.log('--------------------------------');
      productsWithoutSlug.forEach((product, index) => {
        console.log(`${index + 1}. ID: ${product.id}`);
        console.log(`   Ürün: ${product.name}`);
        console.log(`   Kategori: ${product.category?.name || 'Kategori yok'}`);
        console.log('');
      });

      // Slug'ları otomatik oluştur
      console.log('\n🔧 Slug\'ları otomatik oluşturuluyor...');
      
      for (const product of productsWithoutSlug) {
        const slug = product.name
          .toLowerCase()
          .replace(/[ğ]/g, 'g')
          .replace(/[ü]/g, 'u')
          .replace(/[ş]/g, 's')
          .replace(/[ı]/g, 'i')
          .replace(/[ö]/g, 'o')
          .replace(/[ç]/g, 'c')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 100);

        const finalSlug = `${slug}-${product.id.substring(0, 8)}`;

        await prisma.product.update({
          where: { id: product.id },
          data: { slug: finalSlug }
        });

        console.log(`✅ ${product.name} -> ${finalSlug}`);
      }

      console.log('\n✨ Tüm slug\'lar başarıyla oluşturuldu!');
    } else {
      console.log('🎉 Harika! Tüm ürünlerin slug\'ı mevcut.');
    }

    // Duplicate slug kontrolü
    console.log('\n🔍 Duplicate slug kontrolü...');
    const slugCounts = {};
    products.forEach(p => {
      if (p.slug) {
        slugCounts[p.slug] = (slugCounts[p.slug] || 0) + 1;
      }
    });

    const duplicateSlugs = Object.entries(slugCounts).filter(([slug, count]) => count > 1);
    if (duplicateSlugs.length > 0) {
      console.log('⚠️ Duplicate slug\'lar bulundu:');
      duplicateSlugs.forEach(([slug, count]) => {
        console.log(`   ${slug} - ${count} kez kullanılmış`);
      });
    } else {
      console.log('✅ Duplicate slug yok!');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductSlugs();
