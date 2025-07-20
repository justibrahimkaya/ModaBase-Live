// Güvenli Admin Hesabı Oluşturma Script'i
// Bu script sadece prodüksiyonda çalıştırılmalı!

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
  
  return {
    hash: `pbkdf2_sha512$${iterations}$${salt}$${hash}`,
    salt,
    iterations
  }
}

// Güçlü şifre oluştur
function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

async function createSecureAdmin() {
  try {
    console.log('🔐 Güvenli Admin Hesabı Oluşturuluyor...')
    
    // 1. Eski varsayılan hesabı sil
    console.log('❌ Varsayılan admin hesabı siliniyor...')
    await prisma.user.deleteMany({
      where: { 
        email: 'info@modabase.com',
        role: 'ADMIN'
      }
    })
    
    // 2. Yeni güvenli şifre oluştur
    const securePassword = generateSecurePassword()
    const hashedPassword = hashPassword(securePassword)
    
    // 3. Kullanıcıdan email adresi al
    console.log('\n📧 Yeni admin email adresinizi girin:')
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const adminEmail = await new Promise((resolve) => {
      readline.question('Admin Email: ', resolve)
    })
    
    const adminName = await new Promise((resolve) => {
      readline.question('Admin Adı: ', resolve)
    })
    
    const adminSurname = await new Promise((resolve) => {
      readline.question('Admin Soyadı: ', resolve)
    })
    
    const adminPhone = await new Promise((resolve) => {
      readline.question('Admin Telefon: ', resolve)
    })
    
    readline.close()
    
    // 4. Yeni güvenli admin hesabı oluştur
    console.log('\n✅ Yeni güvenli admin hesabı oluşturuluyor...')
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail.toLowerCase().trim(),
        name: adminName,
        surname: adminSurname,
        phone: adminPhone,
        role: 'ADMIN',
        isActive: true,
        passwordHash: hashedPassword.hash
      }
    })
    
    console.log('\n🎉 Güvenli Admin Hesabı Başarıyla Oluşturuldu!')
    console.log('=' .repeat(50))
    console.log(`📧 Email: ${newAdmin.email}`)
    console.log(`🔑 Şifre: ${securePassword}`)
    console.log(`👤 Kullanıcı ID: ${newAdmin.id}`)
    console.log('=' .repeat(50))
    console.log('\n⚠️  Bu bilgileri güvenli bir yerde saklayın!')
    console.log('⚠️  Şifreyi hemen değiştirmeniz önerilir!')
    
    return {
      email: newAdmin.email,
      password: securePassword,
      id: newAdmin.id
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
  createSecureAdmin()
    .then(() => {
      console.log('\n✅ İşlem tamamlandı!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Fatal Error:', error)
      process.exit(1)
    })
}

module.exports = { createSecureAdmin }
