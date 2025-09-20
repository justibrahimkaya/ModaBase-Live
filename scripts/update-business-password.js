const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

// Veritabanı koruma sistemi
async function requireUserApproval(operation, details) {
  console.log('\n🚨 VERİTABANI KORUMA SİSTEMİ 🚨')
  console.log('=' .repeat(50))
  console.log(`⚠️  TEHLİKELİ İŞLEM TESPİT EDİLDİ!`)
  console.log(`📋 İşlem: ${operation}`)
  console.log(`📝 Detay: ${details}`)
  console.log('=' .repeat(50))
  console.log('🔒 Bu işlem için kullanıcı onayı gerekiyor!')
  console.log('📧 Lütfen WhatsApp veya Email ile onay gönderin.')
  console.log('❌ GÜVENLİK NEDENİYLE İŞLEM ENGELLENDİ!')
  console.log('✅ Veritabanınız korunuyor.')
  console.log('=' .repeat(50))
  return false
}

async function updateBusinessPassword() {
  try {
    // Kullanıcı onayı kontrolü
    const approved = await requireUserApproval(
      'PASSWORD_UPDATE',
      'İşletme hesabı şifresi değiştirilecek: mbmodabase@gmail.com'
    )
    
    if (!approved) {
      console.log('❌ İşlem onaylanmadı! Script durduruluyor.')
      return
    }
    
    console.log('🔐 İşletme Hesabı Şifresi Güncelleniyor...\n');

    const email = 'mbmodabase@gmail.com';
    const newPassword = '08513628JUst'; // İstediğiniz şifre

    // Mevcut işletme hesabını bul
    const existingBusiness = await prisma.business.findUnique({
      where: { email }
    });

    if (!existingBusiness) {
      console.log('❌ mbmodabase@gmail.com ile kayıtlı işletme hesabı bulunamadı!');
      return;
    }

    // Yeni şifreyi hash'le
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Şifreyi güncelle
    await prisma.business.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('✅ İşletme hesabı şifresi güncellendi!');
    console.log(`   E-posta: ${email}`);
    console.log(`   Yeni Şifre: ${newPassword}`);
    console.log('\n🎯 Giriş Bilgileri:');
    console.log('   URL: /admin/business-login');
    console.log('   E-posta: mbmodabase@gmail.com');
    console.log(`   Şifre: ${newPassword}`);

    console.log('\n⚠️  ÖNEMLİ: Bu şifreyi güvenli bir yerde saklayın!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
updateBusinessPassword(); 