const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeTestProducts() {
  try {
    console.log('🧹 Test ürünleri temizleniyor...')
    
    // Test ürünleri (seed.ts'deki ürünler)
    const testProductSlugs = [
      'kadin-yaz-elbisesi-cicekli',
      'kadin-bluz-pamuklu', 
      'kadin-etek-midi',
      'kadin-gomlek-klasik'
    ]
    
    // Önce test ürünlerinin ID'lerini al
    const testProducts = await prisma.product.findMany({
      where: {
        slug: {
          in: testProductSlugs
        }
      },
      select: { id: true, name: true }
    })
    
    if (testProducts.length === 0) {
      console.log('ℹ️  Test ürünü bulunamadı')
    } else {
      console.log(`📋 ${testProducts.length} test ürünü bulundu:`)
      testProducts.forEach(p => console.log(`   - ${p.name}`))
      
      // Önce bu ürünlerin review'larını sil
      const deletedReviews = await prisma.review.deleteMany({
        where: {
          productId: {
            in: testProducts.map(p => p.id)
          }
        }
      })
      
      console.log(`✅ ${deletedReviews.count} test review silindi`)
      
      // Sonra ürünleri sil
      const deletedProducts = await prisma.product.deleteMany({
        where: {
          slug: {
            in: testProductSlugs
          }
        }
      })
      
      console.log(`✅ ${deletedProducts.count} test ürünü silindi`)
    }
    
    // Test kullanıcılarını da sil
    const testUserEmails = [
      'ayse@example.com',
      'fatma@example.com'
    ]
    
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: testUserEmails
        }
      }
    })
    
    console.log(`✅ ${deletedUsers.count} test kullanıcısı silindi`)
    
    // Kalan ürünleri listele
    const remainingProducts = await prisma.product.findMany({
      include: {
        category: true
      }
    })
    
    console.log('\n📦 Kalan Ürünler:')
    if (remainingProducts.length === 0) {
      console.log('   Hiç ürün yok - temiz database ✨')
    } else {
      remainingProducts.forEach(product => {
        console.log(`   - ${product.name} (${product.category.name})`)
      })
    }
    
    // Kalan kullanıcıları listele (admin hariç)
    const remainingUsers = await prisma.user.findMany({
      where: {
        role: {
          not: 'SITE_ADMIN'
        }
      }
    })
    
    console.log('\n👥 Kalan Kullanıcılar:')
    if (remainingUsers.length === 0) {
      console.log('   Hiç normal kullanıcı yok - temiz database ✨')
    } else {
      remainingUsers.forEach(user => {
        console.log(`   - ${user.name} ${user.surname} (${user.email})`)
      })
    }
    
    console.log('\n🎉 Database temizleme tamamlandı!')
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Script'i çalıştır
removeTestProducts()
  .then(() => {
    console.log('\n✅ Test veriler başarıyla temizlendi')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Temizleme hatası:', error)
    process.exit(1)
  }) 