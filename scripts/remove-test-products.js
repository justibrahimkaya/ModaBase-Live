const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Veritabanı koruma sistemi
async function requireUserApproval(operation, details) {
  console.log('\n🚨 VERİTABANI KORUMA SİSTEMİ 🚨')
  console.log('=' .repeat(50))
  console.log(`⚠️  TEHLİKELİ İŞLEM TESPİT EDİLDİ!`)
  console.log(`📋 İşlem: ${operation}`)
  console.log(`📝 Detay: ${details}`)
  console.log('=' .repeat(50))
  console.log('🔒 Bu işlem için kullanıcı onayı gerekiyor!')
  console.log('📧 Lütfen WhatsApp veya Email ile onay gönderin.')
  console.log('❌ GÜVENLİK NEDENİYLE İŞLEM ENGELLENDİ!')
  console.log('✅ Veritabanınız korunuyor.')
  console.log('=' .repeat(50))
  return false
}

async function removeTestProducts() {
  try {
    // Kullanıcı onayı kontrolü
    const approved = await requireUserApproval(
      'BULK_DELETE_PRODUCTS',
      'Test ürünleri silinecek - Gerçek ürünler de etkilenebilir!'
    )
    
    if (!approved) {
      console.log('❌ İşlem onaylanmadı! Script durduruluyor.')
      return
    }
    
    console.log('🔍 Test ürünleri aranıyor...')
    
    // Test ürünlerini bul
    const testProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Kadın Bluz - Pamuklu' } },
          { name: { contains: 'Kadın Yaz Elbisesi - Çiçekli Desen' } },
          { name: { contains: 'Erkek' } },
          { name: { contains: 'Çocuk' } },
          { name: { contains: 'Aksesuar' } }
        ]
      },
      include: {
        reviews: true,
        orderItems: true,
        cartItems: true,
        favorites: true,
        wishlists: true,
        stockMovements: true,
        stockNotifications: true,
        variants: true
      }
    })

    console.log(`📦 ${testProducts.length} test ürünü bulundu:`)
    
    for (const product of testProducts) {
      console.log(`\n🗑️  Siliniyor: ${product.name} (ID: ${product.id})`)
      console.log(`   - Yorumlar: ${product.reviews.length}`)
      console.log(`   - Sipariş kalemleri: ${product.orderItems.length}`)
      console.log(`   - Sepet kalemleri: ${product.cartItems.length}`)
      console.log(`   - Favoriler: ${product.favorites.length}`)
      console.log(`   - İstek listesi: ${product.wishlists.length}`)
      console.log(`   - Stok hareketleri: ${product.stockMovements.length}`)
      console.log(`   - Stok bildirimleri: ${product.stockNotifications.length}`)
      console.log(`   - Varyantlar: ${product.variants.length}`)
      
      // Ürünü sil (cascade delete ile ilişkili kayıtlar da silinecek)
      await prisma.product.delete({
        where: { id: product.id }
      })
      
      console.log(`   ✅ Başarıyla silindi!`)
    }

    console.log('\n🎉 Tüm test ürünleri başarıyla silindi!')
    
  } catch (error) {
    console.error('❌ Hata:', error)
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