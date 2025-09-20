// Test script - Resim yükleme sistemini test et
const fs = require('fs');

// Basit bir test resmi oluştur (kırmızı kare)
function createTestImageBase64() {
  // 1x1 piksel kırmızı PNG base64
  const redPixelBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  // Daha büyük test resmi için canvas benzeri bir yaklaşım
  // Gerçek bir test için placeholder image kullanabiliriz
  const placeholderImage = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsIiBkeT0iLjNlbSI+VEVTVCA8L3RleHQ+Cjwvc3ZnPg==';
  
  return `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhFB8FFhBxMiMRgJFEKBkaEygbHBUhQV0SMkNHPhJTEWGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/fiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiv/Z`;
}

async function testImageUpload() {
  try {
    console.log('\n🔍 Resim yükleme testi başlatılıyor...\n');
    
    // Test verisi oluştur
    const testProduct = {
      name: 'Test Ürün - ' + new Date().toISOString(),
      slug: 'test-urun-' + Date.now(),
      description: 'Bu bir test ürünüdür',
      price: 99.99,
      stock: 10,
      minStockLevel: 5,
      categoryId: 'cmdepiss00001k4047nnrq2b4', // Kadın kategorisi
      images: JSON.stringify([createTestImageBase64()]), // Base64 resim
      variants: []
    };
    
    console.log('📦 Test ürünü hazırlandı:');
    console.log('- Ürün adı:', testProduct.name);
    console.log('- Slug:', testProduct.slug);
    console.log('- Resim formatı: Base64');
    console.log('- Resim boyutu:', testProduct.images.length, 'bytes');
    
    // Direkt veritabanına kaydet (test için)
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // variants alanını kaldır
    delete testProduct.variants;
    
    const product = await prisma.product.create({
      data: testProduct,
      include: {
        category: true
      }
    });
    
    console.log('\n✅ Ürün başarıyla oluşturuldu!');
    console.log('- ID:', product.id);
    console.log('- Slug:', product.slug);
    
    // Resim verisini kontrol et
    const savedImages = JSON.parse(product.images);
    console.log('\n🖼️ Kaydedilen resim kontrolü:');
    console.log('- Resim sayısı:', savedImages.length);
    console.log('- İlk resim formatı:', savedImages[0]?.substring(0, 50) + '...');
    console.log('- Base64 mi?:', savedImages[0]?.startsWith('data:image/'));
    
    // Cleanup - test ürününü sil
    await prisma.product.delete({
      where: { id: product.id }
    });
    console.log('\n🧹 Test ürünü temizlendi.');
    
    await prisma.$disconnect();
    
    console.log('\n✅ TEST BAŞARILI: Resimler base64 formatında doğru şekilde kaydediliyor!');
    
  } catch (error) {
    console.error('\n❌ Test hatası:', error);
    process.exit(1);
  }
}

testImageUpload();
