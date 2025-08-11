const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCategories() {
  try {
    console.log('🔍 Kategoriler kontrol ediliyor...')
    
    const categories = await prisma.category.findMany()
    
    console.log(`📊 Toplam kategori sayısı: ${categories.length}`)
    
    if (categories.length === 0) {
      console.log('❌ Veritabanında hiç kategori yok!')
      console.log('💡 Önce kategoriler oluşturulmalı!')
      return
    }
    
    console.log('\n📋 Kategoriler:')
    categories.forEach((category, index) => {
      console.log(`\n${index + 1}. ${category.name}`)
      console.log(`   ID: ${category.id}`)
      console.log(`   Slug: ${category.slug}`)
      console.log(`   Oluşturulma: ${category.createdAt}`)
    })
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories() 