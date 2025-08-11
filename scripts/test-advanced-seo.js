const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdvancedSEO() {
  console.log('🚀 Gelişmiş SEO Sistemi Test Ediliyor...\n');

  try {
    // Test ürünü oluştur
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Gelişmiş SEO Ürünü',
        slug: 'test-gelismis-seo-urunu',
        description: 'Bu ürün gelişmiş SEO özelliklerini test etmek için oluşturulmuştur. Trendyol benzeri profesyonel SEO alanları içerir.',
        price: 299.99,
        originalPrice: 399.99,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop'
        ]),
        stock: 50,
        minStockLevel: 5,
        categoryId: 'test-category-id', // Gerçek kategori ID'si gerekli
        
        // Gelişmiş SEO alanları
        metaTitle: 'Test Gelişmiş SEO Ürünü - Moda Kategorisi | ModaBase',
        metaDescription: 'Test gelişmiş SEO ürünü. Trendyol benzeri profesyonel SEO özellikleri ile optimize edilmiş ürün sayfası.',
        keywords: 'test, gelişmiş, seo, ürün, moda, trendyol, optimizasyon',
        altText: 'Test Gelişmiş SEO Ürünü - Moda Kategorisi',
        
        // Ürün Detayları
        brand: 'TestBrand',
        sku: 'TEST-SEO-001',
        gtin: '1234567890123',
        mpn: 'MPN-TEST-001',
        condition: 'new',
        availability: 'in_stock',
        material: 'Pamuk %100',
        color: 'Mavi',
        size: 'M',
        weight: '250g',
        dimensions: '30x20x5cm',
        warranty: '2 yıl garanti',
        countryOfOrigin: 'Türkiye',
        
        // Sosyal Medya
        ogTitle: 'Test Gelişmiş SEO Ürünü - ModaBase',
        ogDescription: 'Test gelişmiş SEO ürünü. Profesyonel SEO optimizasyonu ile hazırlanmış.',
        ogImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
        ogType: 'product',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Test Gelişmiş SEO Ürünü - ModaBase',
        twitterDescription: 'Test gelişmiş SEO ürünü. Profesyonel SEO optimizasyonu ile hazırlanmış.',
        twitterImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
        
        // Yapılandırılmış Veri
        structuredData: JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": "Test Gelişmiş SEO Ürünü",
          "description": "Test gelişmiş SEO ürünü. Trendyol benzeri profesyonel SEO özellikleri ile optimize edilmiş.",
          "brand": {
            "@type": "Brand",
            "name": "TestBrand"
          },
          "category": "Moda",
          "image": [
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop"
          ],
          "offers": {
            "@type": "Offer",
            "price": 299.99,
            "priceCurrency": "TRY",
            "priceValidUntil": "2024-12-31",
            "availability": "https://schema.org/InStock",
            "condition": "https://schema.org/NewCondition",
            "seller": {
              "@type": "Organization",
              "name": "ModaBase"
            }
          },
          "sku": "TEST-SEO-001",
          "mpn": "MPN-TEST-001",
          "gtin": "1234567890123",
          "weight": "250g",
          "dimensions": "30x20x5cm",
          "material": "Pamuk %100",
          "color": "Mavi",
          "size": "M",
          "warranty": "2 yıl garanti",
          "countryOfOrigin": "Türkiye"
        }),
        canonicalUrl: 'https://modabase.com.tr/product/test-gelismis-seo-urunu',
        hreflang: 'tr-TR',
        
        // Analitik
        googleAnalyticsId: 'G-TEST123456',
        googleTagManagerId: 'GTM-TEST123',
        facebookPixelId: '123456789',
        
        // Arama Motoru
        robotsMeta: 'index,follow',
        sitemapPriority: 0.8,
        changeFrequency: 'weekly',
        lastModified: new Date()
      }
    });

    console.log('✅ Test ürünü başarıyla oluşturuldu!');
    console.log('📊 Ürün ID:', testProduct.id);
    console.log('🏷️ Ürün Adı:', testProduct.name);
    console.log('🔗 Slug:', testProduct.slug);
    console.log('💰 Fiyat:', testProduct.price, 'TL');
    console.log('🏭 Marka:', testProduct.brand);
    console.log('📦 SKU:', testProduct.sku);
    console.log('🏷️ GTIN:', testProduct.gtin);
    console.log('📏 Boyut:', testProduct.dimensions);
    console.log('⚖️ Ağırlık:', testProduct.weight);
    console.log('🎨 Renk:', testProduct.color);
    console.log('📐 Beden:', testProduct.size);
    console.log('🧵 Malzeme:', testProduct.material);
    console.log('🛡️ Garanti:', testProduct.warranty);
    console.log('🌍 Menşei:', testProduct.countryOfOrigin);
    
    console.log('\n📱 Sosyal Medya Meta Tag\'leri:');
    console.log('📘 OG Title:', testProduct.ogTitle);
    console.log('📘 OG Description:', testProduct.ogDescription);
    console.log('📘 OG Image:', testProduct.ogImage);
    console.log('🐦 Twitter Title:', testProduct.twitterTitle);
    console.log('🐦 Twitter Description:', testProduct.twitterDescription);
    
    console.log('\n🔍 SEO Meta Tag\'leri:');
    console.log('📄 Meta Title:', testProduct.metaTitle);
    console.log('📄 Meta Description:', testProduct.metaDescription);
    console.log('🔑 Keywords:', testProduct.keywords);
    console.log('🖼️ Alt Text:', testProduct.altText);
    console.log('🔗 Canonical URL:', testProduct.canonicalUrl);
    console.log('🌐 Hreflang:', testProduct.hreflang);
    console.log('🤖 Robots Meta:', testProduct.robotsMeta);
    
    console.log('\n📊 Analitik:');
    console.log('📈 Google Analytics ID:', testProduct.googleAnalyticsId);
    console.log('📈 Google Tag Manager ID:', testProduct.googleTagManagerId);
    console.log('📈 Facebook Pixel ID:', testProduct.facebookPixelId);
    
    console.log('\n🗂️ Yapılandırılmış Veri:');
    console.log('📋 Structured Data uzunluğu:', testProduct.structuredData?.length || 0, 'karakter');
    
    console.log('\n🎯 SEO Puanı Hesaplama:');
    let seoScore = 0;
    const checks = [];
    
    // Meta Title kontrolü
    if (testProduct.metaTitle && testProduct.metaTitle.length <= 60) {
      seoScore += 15;
      checks.push('✅ Meta Title (15/15)');
    } else {
      checks.push('❌ Meta Title (0/15)');
    }
    
    // Meta Description kontrolü
    if (testProduct.metaDescription && testProduct.metaDescription.length <= 160) {
      seoScore += 15;
      checks.push('✅ Meta Description (15/15)');
    } else {
      checks.push('❌ Meta Description (0/15)');
    }
    
    // Keywords kontrolü
    if (testProduct.keywords) {
      seoScore += 10;
      checks.push('✅ Keywords (10/10)');
    } else {
      checks.push('❌ Keywords (0/10)');
    }
    
    // Brand kontrolü
    if (testProduct.brand) {
      seoScore += 5;
      checks.push('✅ Brand (5/5)');
    } else {
      checks.push('❌ Brand (0/5)');
    }
    
    // SKU kontrolü
    if (testProduct.sku) {
      seoScore += 5;
      checks.push('✅ SKU (5/5)');
    } else {
      checks.push('❌ SKU (0/5)');
    }
    
    // Structured Data kontrolü
    if (testProduct.structuredData) {
      seoScore += 10;
      checks.push('✅ Structured Data (10/10)');
    } else {
      checks.push('❌ Structured Data (0/10)');
    }
    
    // Images kontrolü
    const images = JSON.parse(testProduct.images || '[]');
    if (images.length > 0) {
      seoScore += 10;
      checks.push('✅ Product Images (10/10)');
    } else {
      checks.push('❌ Product Images (0/10)');
    }
    
    // Description kontrolü
    if (testProduct.description && testProduct.description.length > 100) {
      seoScore += 15;
      checks.push('✅ Product Description (15/15)');
    } else {
      checks.push('❌ Product Description (0/15)');
    }
    
    // Ürün detayları kontrolü
    if (testProduct.material && testProduct.color && testProduct.size) {
      seoScore += 15;
      checks.push('✅ Product Details (15/15)');
    } else {
      checks.push('❌ Product Details (0/15)');
    }
    
    checks.forEach(check => console.log(check));
    console.log(`\n🎯 Toplam SEO Puanı: ${seoScore}/100`);
    
    if (seoScore >= 80) {
      console.log('🏆 Mükemmel! SEO optimizasyonu tamamlandı.');
    } else if (seoScore >= 60) {
      console.log('👍 İyi! SEO optimizasyonu yapılabilir.');
    } else {
      console.log('⚠️ Dikkat! SEO optimizasyonu gerekli.');
    }
    
    console.log('\n🔗 Test URL:');
    console.log(`https://modabase.com.tr/product/${testProduct.slug}`);
    
    console.log('\n📋 Google Rich Snippets Test URL:');
    console.log('https://search.google.com/test/rich-results');
    
    console.log('\n📘 Facebook Debugger URL:');
    console.log('https://developers.facebook.com/tools/debug/');
    
    console.log('\n🐦 Twitter Card Validator URL:');
    console.log('https://cards-dev.twitter.com/validator');
    
    // Test ürününü sil
    await prisma.product.delete({
      where: { id: testProduct.id }
    });
    
    console.log('\n🧹 Test ürünü temizlendi.');
    
  } catch (error) {
    console.error('❌ Test sırasında hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdvancedSEO(); 