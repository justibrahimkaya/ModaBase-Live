const fetch = require('node-fetch')

async function testProductAPI() {
  try {
    console.log('🧪 API test ediliyor...')
    
    // Test ürünü
    const testProduct = {
      name: "Test Ürün",
      slug: "test-urun-" + Date.now(),
      description: "Test ürün açıklaması",
      price: 99.99,
      originalPrice: 129.99,
      images: JSON.stringify(["https://via.placeholder.com/400x400/cccccc/666666?text=Test"]),
      stock: 10,
      minStockLevel: 5,
      maxStockLevel: 100,
      categoryId: "test-category-id", // Bu ID'yi gerçek bir kategori ID'si ile değiştirmen gerekecek
      variants: []
    }
    
    console.log('📤 Test ürünü gönderiliyor...')
    console.log('Ürün:', JSON.stringify(testProduct, null, 2))
    
    // Önce kategorileri kontrol et
    console.log('\n📋 Kategoriler kontrol ediliyor...')
    const categoriesResponse = await fetch('http://localhost:3000/api/categories')
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json()
      console.log('Kategoriler:', categories)
      if (categories.length > 0) {
        testProduct.categoryId = categories[0].id
        console.log('İlk kategori ID kullanılıyor:', testProduct.categoryId)
      }
    }
    
    // Ürün ekleme testi
    const response = await fetch('http://localhost:3000/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct)
    })
    
    console.log('\n📥 Yanıt:')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    
    const responseText = await response.text()
    console.log('Response Body:', responseText)
    
    if (response.ok) {
      console.log('✅ Ürün başarıyla eklendi!')
    } else {
      console.log('❌ Ürün eklenemedi!')
    }
    
  } catch (error) {
    console.error('❌ Hata:', error)
  }
}

testProductAPI() 