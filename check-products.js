const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProducts() {
  try {
    console.log('🔍 Veritabanındaki ürünleri kontrol ediliyor...')
    
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      }
    })
    
    console.log(`📊 Toplam ürün sayısı: ${products.length}`)
    
    if (products.length === 0) {
      console.log('❌ Veritabanında hiç ürün yok!')
      return
    }
    
    console.log('\n📋 Ürünler:')
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   Fiyat: ${product.price}`)
      console.log(`   Stok: ${product.stock}`)
      console.log(`   Kategori: ${product.category?.name || 'Kategori yok'}`)
      console.log(`   Resim sayısı: ${product.images ? JSON.parse(product.images).length : 0}`)
      console.log(`   Varyant sayısı: ${product.variants?.length || 0}`)
      console.log(`   Oluşturulma: ${product.createdAt}`)
    })
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts() 