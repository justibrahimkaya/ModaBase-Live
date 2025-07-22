const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function updateBusinessPassword() {
  try {
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