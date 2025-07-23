const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testNextJS15Upload() {
  console.log('🧪 Next.js 15 Upload Test Başlatıldı')
  
  try {
    // 1. Database bağlantısını test et
    console.log('📊 Database bağlantısı test ediliyor...')
    await prisma.$connect()
    console.log('✅ Database bağlantısı başarılı')
    
    // 2. Kategorileri kontrol et
    console.log('📂 Kategoriler kontrol ediliyor...')
    const categories = await prisma.category.findMany({
      take: 5,
      select: { id: true, name: true }
    })
    console.log('📂 Mevcut kategoriler:', categories)
    
    if (categories.length === 0) {
      console.log('❌ Hiç kategori yok! Önce kategori ekleyin.')
      return
    }
    
    // 3. Test ürünü oluştur
    const testProduct = {
      name: 'Next.js 15 Test Ürünü',
      slug: 'nextjs15-test-urunu-' + Date.now(),
      description: 'Next.js 15 body size limit test ürünü',
      price: 99.99,
      originalPrice: 129.99,
      stock: 50,
      minStockLevel: 5,
      maxStockLevel: 100,
      categoryId: categories[0].id,
      images: JSON.stringify([
        'https://via.placeholder.com/400x400/cccccc/666666?text=Test+Resim+1',
        'https://via.placeholder.com/400x400/cccccc/666666?text=Test+Resim+2',
        'https://via.placeholder.com/400x400/cccccc/666666?text=Test+Resim+3',
        'https://via.placeholder.com/400x400/cccccc/666666?text=Test+Resim+4',
        'https://via.placeholder.com/400x400/cccccc/666666?text=Test+Resim+5',
        'https://via.placeholder.com/400x400/cccccc/666666?text=Test+Resim+6',
        'https://via.placeholder.com/400x400/cccccc/666666?text=Test+Resim+7',
        'https://via.placeholder.com/400x400/cccccc/666666?text=Test+Resim+8'
      ]),
      variants: []
    }
    
    console.log('📦 Test ürünü oluşturuluyor...')
    console.log('📊 Ürün verisi:', JSON.stringify(testProduct, null, 2))
    
    // 4. Payload boyutunu hesapla
    const payloadSize = JSON.stringify(testProduct).length
    console.log('📏 Payload boyutu:', payloadSize, 'bytes')
    console.log('📏 Payload boyutu (MB):', (payloadSize / 1024 / 1024).toFixed(2), 'MB')
    
    // 5. API test isteği gönder
    console.log('🌐 API test isteği gönderiliyor...')
    
    const response = await fetch('http://localhost:3000/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-NextJS-Version': '15',
        // Admin cookie'si gerekli - manuel olarak ekleyin
        'Cookie': 'admin-session=your-admin-session-cookie-here'
      },
      body: JSON.stringify(testProduct)
    })
    
    console.log('📥 API yanıtı:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Hatası:', errorText)
    } else {
      const responseData = await response.json()
      console.log('✅ API Başarılı:', responseData)
    }
    
    // 6. Ürünleri listele
    console.log('📋 Mevcut ürünler listeleniyor...')
    const products = await prisma.product.findMany({
      take: 10,
      select: { id: true, name: true, slug: true, createdAt: true }
    })
    console.log('📋 Ürünler:', products)
    
  } catch (error) {
    console.error('❌ Test hatası:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Test'i çalıştır
testNextJS15Upload()
  .then(() => {
    console.log('✅ Test tamamlandı')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test başarısız:', error)
    process.exit(1)
  }) 