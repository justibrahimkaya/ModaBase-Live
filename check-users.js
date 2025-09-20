const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Kullanıcılar kontrol ediliyor...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📊 Toplam kullanıcı sayısı: ${users.length}`)
    console.log('=' .repeat(60))
    
    if (users.length === 0) {
      console.log('❌ Hiç kullanıcı bulunamadı!')
    } else {
      users.forEach((user, index) => {
        const status = user.isActive ? '✅ Aktif' : '❌ Pasif'
        const date = new Date(user.createdAt).toLocaleDateString('tr-TR')
        console.log(`${index + 1}. ${user.email}`)
        console.log(`   👤 ${user.name} ${user.surname}`)
        console.log(`   🏷️  Rol: ${user.role}`)
        console.log(`   📅 Oluşturulma: ${date}`)
        console.log(`   🔄 Durum: ${status}`)
        console.log('   ' + '-'.repeat(40))
      })
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers() 