const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

async function createAdmin() {
  try {
    console.log('🔐 Admin hesabı oluşturuluyor...')
    
    const hashedPassword = hashPassword('JUst08513628ib')
    
    const admin = await prisma.user.create({
      data: {
        email: 'info@modabase.com',
        name: 'ModaBase',
        surname: 'Admin',
        role: 'ADMIN',
        isActive: true,
        passwordHash: hashedPassword
      }
    })
    
    console.log('\n🎉 Admin Hesabı Başarıyla Oluşturuldu!')
    console.log('=' .repeat(50))
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Şifre: JUst08513628ib`)
    console.log(`👤 Admin: ${admin.name} ${admin.surname}`)
    console.log(`🆔 ID: ${admin.id}`)
    console.log('=' .repeat(50))
    console.log('\n✅ Artık bu bilgilerle giriş yapabilirsiniz!')
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
    if (error.code === 'P2002') {
      console.error('Bu email adresi zaten kullanılıyor.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
