// Admin şifresini güncelle
const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

// PBKDF2 ile şifre hashleme (mevcut sistemle uyumlu)
function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex')
  const iterations = 10000
  const keylen = 64
  const digest = 'sha512'
  
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')
  
  return `pbkdf2_sha512$${iterations}$${salt}$${hash}`
}

async function updateAdminPassword() {
  try {
    console.log('🔐 Admin şifresi güncelleniyor...')
    
    const newPassword = 'JUst08513628ib'
    const hashedPassword = hashPassword(newPassword)
    
    // Mevcut admin hesabını bul ve şifresini güncelle
    const updatedAdmin = await prisma.user.update({
      where: {
        email: 'info@modabase.com',
        role: 'ADMIN'
      },
      data: {
        passwordHash: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true
      }
    })
    
    console.log('\n🎉 Admin Şifresi Başarıyla Güncellendi!')
    console.log('=' .repeat(50))
    console.log(`📧 Email: ${updatedAdmin.email}`)
    console.log(`🔑 Yeni Şifre: ${newPassword}`)
    console.log(`👤 Admin: ${updatedAdmin.name} ${updatedAdmin.surname}`)
    console.log(`🆔 ID: ${updatedAdmin.id}`)
    console.log('=' .repeat(50))
    console.log('\n✅ Artık bu şifre ile giriş yapabilirsiniz!')
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
    if (error.code === 'P2025') {
      console.error('Admin hesabı bulunamadı. Önce hesap oluşturun.')
    }
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Script'i çalıştır
if (require.main === module) {
  updateAdminPassword()
    .then(() => {
      console.log('\n✅ Şifre güncelleme tamamlandı!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Fatal Error:', error)
      process.exit(1)
    })
}

module.exports = { updateAdminPassword }