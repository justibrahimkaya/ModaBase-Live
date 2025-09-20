const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkBlogSlugs() {
  try {
    console.log('📝 Blog yazılarının slug\'ları kontrol ediliyor...\n')
    
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        isPublished: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Toplam ${posts.length} blog yazısı bulundu:\n`)
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Kategori: ${post.category}`)
      console.log(`   Yayınlandı: ${post.isPublished ? '✅' : '❌'}`)
      console.log(`   URL: /blog/${post.slug}`)
      console.log('')
    })
    
    console.log('🔗 Test URL\'leri:')
    posts.slice(0, 3).forEach(post => {
      console.log(`   https://www.modabase.com.tr/blog/${post.slug}`)
    })
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBlogSlugs() 