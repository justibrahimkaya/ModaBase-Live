const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function updateBusinessAccount() {
  try {
    console.log('🏢 İşletme Hesabı Güncelleniyor...\n');

    // Mevcut işletme hesabını bul
    const existingBusiness = await prisma.business.findUnique({
      where: { email: 'mbmodabase@gmail.com' }
    });

    if (!existingBusiness) {
      console.log('❌ mbmodabase@gmail.com ile kayıtlı işletme hesabı bulunamadı!');
      console.log('📝 Yeni işletme hesabı oluşturuluyor...\n');
      
      // Yeni işletme hesabı oluştur
      const newBusiness = await prisma.business.create({
        data: {
          businessName: 'ModaBase',
          businessType: 'ŞAHIS FİRMASI',
          taxNumber: '5320543093',
          tradeRegistryNumber: null,
          email: 'mbmodabase@gmail.com',
          phone: '05362971255',
          website: null,
          address: 'MALKOÇOĞLU MAH. 305/1 SOKAK NO:17/A SULTANGAZİ/İSTANBUL',
          city: 'İSTANBUL',
          district: 'SULTANGAZİ',
          postalCode: '34270',
          contactName: 'İbrahim',
          contactSurname: 'Kaya',
          contactTitle: 'İşletme Sahibi',
          contactPhone: '05362971255',
          contactEmail: 'mbmodabase@gmail.com',
          password: '$2a$12$defaultPasswordHash', // Şifre güncellenecek
          termsAccepted: true,
          privacyAccepted: true,
          marketingAccepted: false,
          
          // Banka Bilgileri
          bankName: 'Ziraat Bankası',
          bankBranch: 'Ziraat Sultangazi Şubesi',
          accountHolderName: 'İbrahim Kaya',
          ibanNumber: 'TR15 0001 0019 7980 1880 0750 01',
          accountType: 'TL',
          
          // İşletme Detayları
          taxOffice: 'ATIŞALANI',
          registrationDate: new Date('2025-05-15'),
          activityCode: '142101',
          activityDescription: 'DIŞ GİYİM EŞYASI İMALATI (ÖRGÜ VEYA TIG İŞİ OLANLAR HARİÇ)(SPOR VE BEBEK GİYSİLERİ HARİÇ)',
          
          // Yetkili Kişi Detayları
          contactTcKimlik: '46900704976',
          contactBirthDate: new Date('1989-11-04'),
          
          adminStatus: 'APPROVED', // Otomatik onay
          isActive: true,
          emailVerified: true,
          approvedAt: new Date(),
          appliedAt: new Date('2025-05-15')
        }
      });

      console.log('✅ Yeni işletme hesabı oluşturuldu:');
      console.log(`   ID: ${newBusiness.id}`);
      console.log(`   İşletme Adı: ${newBusiness.businessName}`);
      console.log(`   E-posta: ${newBusiness.email}`);
      console.log(`   Durum: ${newBusiness.adminStatus}`);
      console.log(`   Aktif: ${newBusiness.isActive ? 'Evet' : 'Hayır'}`);

    } else {
      console.log('📝 Mevcut işletme hesabı bulundu, güncelleniyor...\n');
      
      // Mevcut hesabı güncelle
      const updatedBusiness = await prisma.business.update({
        where: { email: 'mbmodabase@gmail.com' },
        data: {
          businessName: 'ModaBase',
          businessType: 'ŞAHIS FİRMASI',
          taxNumber: '5320543093',
          phone: '05362971255',
          address: 'MALKOÇOĞLU MAH. 305/1 SOKAK NO:17/A SULTANGAZİ/İSTANBUL',
          city: 'İSTANBUL',
          district: 'SULTANGAZİ',
          postalCode: '34270',
          contactName: 'İbrahim',
          contactSurname: 'Kaya',
          contactTitle: 'İşletme Sahibi',
          contactPhone: '05362971255',
          contactEmail: 'mbmodabase@gmail.com',
          
          // Banka Bilgileri
          bankName: 'Ziraat Bankası',
          bankBranch: 'Ziraat Sultangazi Şubesi',
          accountHolderName: 'İbrahim Kaya',
          ibanNumber: 'TR15 0001 0019 7980 1880 0750 01',
          accountType: 'TL',
          
          // İşletme Detayları
          taxOffice: 'ATIŞALANI',
          registrationDate: new Date('2025-05-15'),
          activityCode: '142101',
          activityDescription: 'DIŞ GİYİM EŞYASI İMALATI (ÖRGÜ VEYA TIG İŞİ OLANLAR HARİÇ)(SPOR VE BEBEK GİYSİLERİ HARİÇ)',
          
          // Yetkili Kişi Detayları
          contactTcKimlik: '46900704976',
          contactBirthDate: new Date('1989-11-04'),
          
          adminStatus: 'APPROVED',
          isActive: true,
          emailVerified: true,
          approvedAt: new Date(),
          appliedAt: new Date('2025-05-15')
        }
      });

      console.log('✅ İşletme hesabı güncellendi:');
      console.log(`   ID: ${updatedBusiness.id}`);
      console.log(`   İşletme Adı: ${updatedBusiness.businessName}`);
      console.log(`   E-posta: ${updatedBusiness.email}`);
      console.log(`   Durum: ${updatedBusiness.adminStatus}`);
      console.log(`   Aktif: ${updatedBusiness.isActive ? 'Evet' : 'Hayır'}`);
    }

    // Güncellenmiş bilgileri göster
    const finalBusiness = await prisma.business.findUnique({
      where: { email: 'mbmodabase@gmail.com' }
    });

    console.log('\n🏦 Banka Bilgileri:');
    console.log(`   Banka: ${finalBusiness.bankName || 'Belirtilmemiş'}`);
    console.log(`   Şube: ${finalBusiness.bankBranch || 'Belirtilmemiş'}`);
    console.log(`   Hesap Sahibi: ${finalBusiness.accountHolderName || 'Belirtilmemiş'}`);
    console.log(`   IBAN: ${finalBusiness.ibanNumber || 'Belirtilmemiş'}`);
    console.log(`   Hesap Türü: ${finalBusiness.accountType || 'Belirtilmemiş'}`);

    console.log('\n📋 İşletme Detayları:');
    console.log(`   Vergi Numarası: ${finalBusiness.taxNumber}`);
    console.log(`   Vergi Dairesi: ${finalBusiness.taxOffice || 'Belirtilmemiş'}`);
    console.log(`   İşletme Türü: ${finalBusiness.businessType}`);
    console.log(`   Kayıt Tarihi: ${finalBusiness.registrationDate ? finalBusiness.registrationDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş'}`);
    console.log(`   Faaliyet Kodu: ${finalBusiness.activityCode || 'Belirtilmemiş'}`);
    console.log(`   Faaliyet Açıklaması: ${finalBusiness.activityDescription || 'Belirtilmemiş'}`);

    console.log('\n👤 Yetkili Kişi:');
    console.log(`   Ad Soyad: ${finalBusiness.contactName} ${finalBusiness.contactSurname}`);
    console.log(`   TC Kimlik: ${finalBusiness.contactTcKimlik || 'Belirtilmemiş'}`);
    console.log(`   Doğum Tarihi: ${finalBusiness.contactBirthDate ? finalBusiness.contactBirthDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş'}`);
    console.log(`   Telefon: ${finalBusiness.contactPhone}`);

    console.log('\n🎯 Giriş Bilgileri:');
    console.log('   E-posta: mbmodabase@gmail.com');
    console.log('   Şifre: (mevcut şifre korundu)');
    console.log('   URL: /admin/business-login');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
updateBusinessAccount(); 