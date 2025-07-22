const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkBusinessAccount() {
  try {
    console.log('🔍 İşletme Hesabı Detayları Kontrol Ediliyor...\n');

    const business = await prisma.business.findUnique({
      where: { email: 'mbmodabase@gmail.com' }
    });

    if (!business) {
      console.log('❌ mbmodabase@gmail.com ile kayıtlı işletme hesabı bulunamadı!');
      return;
    }

    console.log('✅ İşletme Hesabı Bulundu!\n');

    console.log('🏢 İŞLETME BİLGİLERİ:');
    console.log(`   ID: ${business.id}`);
    console.log(`   İşletme Adı: ${business.businessName}`);
    console.log(`   İşletme Türü: ${business.businessType}`);
    console.log(`   Vergi Numarası: ${business.taxNumber}`);
    console.log(`   Vergi Dairesi: ${business.taxOffice || 'Belirtilmemiş'}`);
    console.log(`   Kayıt Tarihi: ${business.registrationDate ? business.registrationDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş'}`);
    console.log(`   Faaliyet Kodu: ${business.activityCode || 'Belirtilmemiş'}`);
    console.log(`   Faaliyet Açıklaması: ${business.activityDescription || 'Belirtilmemiş'}`);

    console.log('\n📍 ADRES BİLGİLERİ:');
    console.log(`   Adres: ${business.address}`);
    console.log(`   Şehir: ${business.city}`);
    console.log(`   İlçe: ${business.district || 'Belirtilmemiş'}`);
    console.log(`   Posta Kodu: ${business.postalCode || 'Belirtilmemiş'}`);

    console.log('\n🏦 BANKA BİLGİLERİ:');
    console.log(`   Banka: ${business.bankName || 'Belirtilmemiş'}`);
    console.log(`   Şube: ${business.bankBranch || 'Belirtilmemiş'}`);
    console.log(`   Hesap Sahibi: ${business.accountHolderName || 'Belirtilmemiş'}`);
    console.log(`   IBAN: ${business.ibanNumber || 'Belirtilmemiş'}`);
    console.log(`   Hesap Türü: ${business.accountType || 'Belirtilmemiş'}`);

    console.log('\n👤 YETKİLİ KİŞİ:');
    console.log(`   Ad Soyad: ${business.contactName} ${business.contactSurname}`);
    console.log(`   Ünvan: ${business.contactTitle || 'Belirtilmemiş'}`);
    console.log(`   TC Kimlik: ${business.contactTcKimlik || 'Belirtilmemiş'}`);
    console.log(`   Doğum Tarihi: ${business.contactBirthDate ? business.contactBirthDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş'}`);
    console.log(`   Telefon: ${business.contactPhone || 'Belirtilmemiş'}`);
    console.log(`   E-posta: ${business.contactEmail}`);

    console.log('\n📞 İLETİŞİM BİLGİLERİ:');
    console.log(`   Telefon: ${business.phone}`);
    console.log(`   E-posta: ${business.email}`);
    console.log(`   Website: ${business.website || 'Belirtilmemiş'}`);

    console.log('\n🔐 HESAP DURUMU:');
    console.log(`   Admin Durumu: ${business.adminStatus}`);
    console.log(`   Aktif: ${business.isActive ? 'Evet' : 'Hayır'}`);
    console.log(`   E-posta Doğrulandı: ${business.emailVerified ? 'Evet' : 'Hayır'}`);
    console.log(`   Başvuru Tarihi: ${business.appliedAt.toLocaleDateString('tr-TR')}`);
    console.log(`   Onay Tarihi: ${business.approvedAt ? business.approvedAt.toLocaleDateString('tr-TR') : 'Onaylanmamış'}`);
    console.log(`   Son Giriş: ${business.lastLoginAt ? business.lastLoginAt.toLocaleDateString('tr-TR') : 'Hiç giriş yapılmamış'}`);

    console.log('\n📋 YASAL BİLGİLER:');
    console.log(`   Kullanım Şartları: ${business.termsAccepted ? 'Kabul Edildi' : 'Kabul Edilmedi'}`);
    console.log(`   Gizlilik Politikası: ${business.privacyAccepted ? 'Kabul Edildi' : 'Kabul Edilmedi'}`);
    console.log(`   Pazarlama İzni: ${business.marketingAccepted ? 'Verildi' : 'Verilmedi'}`);

    console.log('\n🎯 GİRİŞ BİLGİLERİ:');
    console.log('   URL: /admin/business-login');
    console.log('   E-posta: mbmodabase@gmail.com');
    console.log('   Şifre: 08513628JUst');

    console.log('\n✅ Tüm bilgiler başarıyla güncellendi!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
checkBusinessAccount(); 