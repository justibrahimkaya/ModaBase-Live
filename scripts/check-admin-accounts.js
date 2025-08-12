// Admin hesaplarını kontrol et
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdminAccounts() {
  try {
    console.log('🔍 Database deki admin hesapları kontrol ediliyor...')
    
    const admins = await prisma.user.findMany({
      where: { 
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
    
    console.log(`\n📊 Toplam admin hesabı: ${admins.length}`)
    console.log('=' .repeat(60))
    
    if (admins.length === 0) {
      console.log('❌ Hiç admin hesabı bulunamadı!')
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Admin:`)
        console.log(`   📧 Email: ${admin.email}`)
        console.log(`   👤 Ad Soyad: ${admin.name} ${admin.surname}`)
        console.log(`   🆔 ID: ${admin.id}`)
        console.log(`   ✅ Aktif: ${admin.isActive ? 'Evet' : 'Hayır'}`)
        console.log(`   📅 Oluşturulma: ${admin.createdAt.toLocaleString('tr-TR')}`)
        console.log('---')
      })
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Script'i çalıştır
if (require.main === module) {
  checkAdminAccounts()
    .then(() => {
      console.log('\n✅ Kontrol tamamlandı!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Fatal Error:', error)
      process.exit(1)
    })
}

module.exports = { checkAdminAccounts }