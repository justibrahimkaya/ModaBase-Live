const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Türkçe karakterleri İngilizce karakterlere dönüştür
function fixSlug(text) {
  const turkishToEnglish = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  }
  
  let result = text
  for (const [turkish, english] of Object.entries(turkishToEnglish)) {
    result = result.replace(new RegExp(turkish, 'g'), english)
  }
  
  return result.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function fixBlogSlugs() {
  try {
    console.log('🔧 Blog yazılarının slug\'ları düzeltiliyor...\n')
    
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    })
    
    for (const post of posts) {
      const newSlug = fixSlug(post.title)
      
      if (newSlug !== post.slug) {
        console.log(`📝 "${post.title}"`)
        console.log(`   Eski slug: ${post.slug}`)
        console.log(`   Yeni slug: ${newSlug}`)
        
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { slug: newSlug }
        })
        
        console.log(`   ✅ Güncellendi\n`)
      }
    }
    
    console.log('🎉 Tüm slug\'lar düzeltildi!')
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixBlogSlugs() 