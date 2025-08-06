const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProducts() {
  try {
    console.log('🔍 "Bluzlar" ve "Elbiseler" isimli ürünleri aranıyor...')
    
    // Önce bu isimli ürünleri ara
    const problemProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { equals: 'Bluzlar', mode: 'insensitive' } },
          { name: { equals: 'Elbiseler', mode: 'insensitive' } },
          { name: { contains: 'Bluzlar', mode: 'insensitive' } },
          { name: { contains: 'Elbiseler', mode: 'insensitive' } }
        ]
      },
      include: {
        category: true
      }
    })
    
    console.log(`🎯 "Bluzlar/Elbiseler" bulunan ürün sayısı: ${problemProducts.length}`)
    
    if (problemProducts.length > 0) {
      console.log('\n❌ Sorunlu ürünler bulundu:')
      problemProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. "${product.name}"`)
        console.log(`   ID: ${product.id}`)
        console.log(`   Slug: ${product.slug}`)
        console.log(`   Kategori: ${product.category?.name || 'Kategori yok'}`)
      })
    } else {
      console.log('✅ "Bluzlar" ve "Elbiseler" isimli ürün bulunamadı.')
    }
    
    // Tüm ürünleri de listele
    const allProducts = await prisma.product.findMany({
      include: {
        category: true
      }
    })
    
    console.log(`\n📊 Toplam ürün sayısı: ${allProducts.length}`)
    
    if (allProducts.length === 0) {
      console.log('❌ Veritabanında hiç ürün yok!')
      return
    }
    
    console.log('\n📋 Tüm ürünler:')
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}" (ID: ${product.id})`)
    })
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts() 