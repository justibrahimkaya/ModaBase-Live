const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function listAllProducts() {
  try {
    console.log('🔍 Tüm ürünler listeleniyor...')
    
    const products = await prisma.product.findMany({
      include: {
        variants: {
          where: { isActive: true }
        },
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📦 Toplam ${products.length} ürün bulundu:`)
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. Ürün:`)
      console.log('  ID:', product.id)
      console.log('  Ad:', product.name)
      console.log('  Slug:', product.slug)
      console.log('  Fiyat:', product.price)
      console.log('  Kategori:', product.category?.name || 'Yok')
      console.log('  Varyant sayısı:', product.variants.length)
      console.log('  Oluşturulma:', product.createdAt.toISOString())
      
      if (product.variants.length > 0) {
        console.log('  Varyantlar:')
        product.variants.forEach((variant, vIndex) => {
          console.log(`    ${vIndex + 1}. Beden: ${variant.size || 'Yok'}, Renk: ${variant.color || 'Yok'}, Stok: ${variant.stock}`)
        })
      }
    })
    
    // Slug ile arama yapalım
    console.log('\n🔍 Slug ile arama:')
    const slugSearch = 'rmdg1fcu800018041521tmue'
    const productBySlug = await prisma.product.findUnique({
      where: { slug: slugSearch },
      include: { variants: true }
    })
    
    if (productBySlug) {
      console.log('✅ Slug ile bulundu:', productBySlug.id)
    } else {
      console.log('❌ Slug ile bulunamadı')
    }
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listAllProducts() 