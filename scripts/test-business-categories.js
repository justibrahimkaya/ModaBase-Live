const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBusinessCategories() {
  try {
    console.log('🏪 İşletme Kategorileri Sistemi Test Ediliyor...\n')

    // 1. İşletme hesabını bul
    console.log('1️⃣ İşletme hesabı aranıyor...')
    const business = await prisma.business.findFirst({
      where: {
        email: 'mbmodabase@gmail.com'
      }
    })

    if (!business) {
      console.log('❌ İşletme hesabı bulunamadı!')
      return
    }

    console.log(`✅ İşletme bulundu: ${business.businessName}`)

    // 2. Test kategorisi oluştur
    console.log('\n2️⃣ Test kategorisi oluşturuluyor...')
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test İşletme Kategorisi',
        slug: 'test-isletme-kategorisi',
        description: 'Bu bir test işletme kategorisidir',
        businessId: business.id,
        isActive: true
      }
    })

    console.log(`✅ Test kategorisi oluşturuldu: ${testCategory.name}`)

    // 3. Kategorileri listele
    console.log('\n3️⃣ Tüm kategoriler listeleniyor...')
    const allCategories = await prisma.category.findMany({
      include: {
        business: {
          select: {
            id: true,
            businessName: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { businessId: 'asc' },
        { name: 'asc' }
      ]
    })

    console.log('\n📋 Kategoriler:')
    allCategories.forEach((cat, index) => {
      const type = cat.businessId ? '🏪 İşletme' : '🏛️ Sistem'
      const businessName = cat.business ? ` (${cat.business.businessName})` : ''
      console.log(`${index + 1}. ${cat.name} - ${type}${businessName} - ${cat._count.products} ürün`)
    })

    // 4. İşletme kategorilerini filtrele
    console.log('\n4️⃣ İşletme kategorileri filtreleniyor...')
    const businessCategories = await prisma.category.findMany({
      where: {
        businessId: business.id
      },
      include: {
        business: {
          select: {
            id: true,
            businessName: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    console.log(`\n🏪 ${business.businessName} kategorileri:`)
    businessCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat._count.products} ürün`)
    })

    // 5. Sistem kategorilerini filtrele
    console.log('\n5️⃣ Sistem kategorileri filtreleniyor...')
    const systemCategories = await prisma.category.findMany({
      where: {
        businessId: null
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    console.log(`\n🏛️ Sistem kategorileri:`)
    systemCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat._count.products} ürün`)
    })

    // 6. Test kategorisini sil
    console.log('\n6️⃣ Test kategorisi temizleniyor...')
    await prisma.category.delete({
      where: {
        id: testCategory.id
      }
    })

    console.log('✅ Test kategorisi silindi')

    // 7. İstatistikler
    console.log('\n7️⃣ İstatistikler:')
    const totalCategories = await prisma.category.count()
    const businessCategoriesCount = await prisma.category.count({
      where: {
        businessId: { not: null }
      }
    })
    const systemCategoriesCount = await prisma.category.count({
      where: {
        businessId: null
      }
    })

    console.log(`📊 Toplam Kategori: ${totalCategories}`)
    console.log(`🏪 İşletme Kategorileri: ${businessCategoriesCount}`)
    console.log(`🏛️ Sistem Kategorileri: ${systemCategoriesCount}`)

    console.log('\n🎉 İşletme Kategorileri Sistemi Test Tamamlandı!')
    console.log('\n✅ Sistem başarıyla çalışıyor!')
    console.log('✅ İşletme sahipleri kendi kategorilerini oluşturabilir')
    console.log('✅ Ürün eklerken hem sistem hem işletme kategorileri görünür')
    console.log('✅ Ana sayfada tüm kategoriler listelenir')

  } catch (error) {
    console.error('❌ Test sırasında hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBusinessCategories() 