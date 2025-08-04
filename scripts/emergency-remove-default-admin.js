// ACİL: Varsayılan Admin Hesabını Sil
// Bu script hemen çalıştırılmalı!

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeDefaultAdmin() {
  try {
    console.log('🚨 ACİL: Varsayılan admin hesabı siliniyor...')
    
    // Tüm varsayılan admin hesaplarını sil
    const deleted = await prisma.user.deleteMany({
      where: { 
        email: 'info@modabase.com.tr',
        role: 'ADMIN'
      }
    })
    
    console.log(`✅ ${deleted.count} varsayılan admin hesabı silindi`)
    
    // Diğer tehlikeli varsayılan hesapları da kontrol et
    const dangerousEmails = [
          'admin@modabase.com.tr',
    'super@modabase.com.tr',
    'test@modabase.com.tr',
    'demo@modabase.com.tr'
    ]
    
    for (const email of dangerousEmails) {
      const deletedTest = await prisma.user.deleteMany({
        where: { 
          email: email,
          role: 'ADMIN'
        }
      })
      
      if (deletedTest.count > 0) {
        console.log(`⚠️  ${deletedTest.count} tehlikeli hesap silindi: ${email}`)
      }
    }
    
    console.log('\n🔒 Güvenlik Durumu:')
    console.log('✅ Varsayılan admin hesapları temizlendi')
    console.log('⚠️  Şimdi yeni güvenli admin hesabı oluşturun:')
    console.log('   node scripts/create-secure-admin.js')
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Script'i çalıştır
if (require.main === module) {
  removeDefaultAdmin()
    .then(() => {
      console.log('\n✅ Acil müdahale tamamlandı!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Fatal Error:', error)
      process.exit(1)
    })
}

module.exports = { removeDefaultAdmin }
