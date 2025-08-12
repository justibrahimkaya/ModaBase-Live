const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProductVariants() {
  try {
    const productId = 'cmdg1xcu80001lf04152ltmue'
    
    console.log('🔍 Ürün varyantları kontrol ediliyor...')
    console.log('Ürün ID:', productId)
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: [
            { size: 'asc' },
            { color: 'asc' }
          ]
        }
      }
    })
    
    if (!product) {
      console.log('❌ Ürün bulunamadı!')
      return
    }
    
    console.log('\n📦 Ürün Bilgileri:')
    console.log('ID:', product.id)
    console.log('Ad:', product.name)
    console.log('Slug:', product.slug)
    console.log('Fiyat:', product.price)
    console.log('Stok:', product.stock)
    
    console.log('\n🎨 Varyantlar:')
    console.log('Toplam varyant sayısı:', product.variants.length)
    
    if (product.variants.length === 0) {
      console.log('❌ Hiç varyant yok!')
      console.log('Bu yüzden renk ve beden seçenekleri görünmüyor.')
    } else {
      product.variants.forEach((variant, index) => {
        console.log(`\nVaryant ${index + 1}:`)
        console.log('  ID:', variant.id)
        console.log('  Beden:', variant.size || 'Yok')
        console.log('  Renk:', variant.color || 'Yok')
        console.log('  Renk Kodu:', variant.colorCode || 'Yok')
        console.log('  Stok:', variant.stock)
        console.log('  Fiyat:', variant.price || 'Ana fiyat')
        console.log('  Aktif:', variant.isActive)
      })
    }
    
    // Mevcut bedenleri çıkar
    const availableSizes = product.variants
      .filter(v => v.size && v.stock > 0)
      .map(v => v.size)
      .filter((size, index, arr) => arr.indexOf(size) === index)
      .sort()
    
    // Mevcut renkleri çıkar
    const availableColors = product.variants
      .filter(v => v.color && v.stock > 0)
      .map(v => ({
        name: v.color,
        code: v.colorCode || '',
        hex: v.colorCode || '#cccccc'
      }))
      .filter((color, index, arr) => arr.findIndex(c => c.name === color.name) === index)
    
    console.log('\n📊 Özet:')
    console.log('Mevcut bedenler:', availableSizes.length > 0 ? availableSizes : 'Yok')
    console.log('Mevcut renkler:', availableColors.length > 0 ? availableColors.map(c => c.name) : 'Yok')
    
    if (availableSizes.length === 0 && availableColors.length === 0) {
      console.log('\n❌ SORUN: Hiç beden veya renk varyantı yok!')
      console.log('Çözüm: Admin panelden ürünü düzenleyip varyant eklemen gerekiyor.')
    }
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductVariants() 