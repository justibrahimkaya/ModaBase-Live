const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testTransferSystem() {
  try {
    console.log('🧪 Transfer Sistemi Test Ediliyor...\n');

    // 1. İşletme hesabını kontrol et
    console.log('1️⃣ İşletme Hesabı Kontrolü:');
    const business = await prisma.business.findUnique({
      where: { email: 'mbmodabase@gmail.com' },
      select: {
        id: true,
        businessName: true,
        contactEmail: true,
        ibanNumber: true,
        accountHolderName: true,
        bankName: true,
        bankBranch: true,
        accountType: true
      }
    });

    if (!business) {
      console.log('❌ İşletme hesabı bulunamadı!');
      return;
    }

    console.log('✅ İşletme hesabı bulundu:');
    console.log(`   İşletme: ${business.businessName}`);
    console.log(`   E-posta: ${business.contactEmail}`);
    console.log(`   IBAN: ${business.ibanNumber || '❌ Eksik'}`);
    console.log(`   Hesap Sahibi: ${business.accountHolderName || '❌ Eksik'}`);
    console.log(`   Banka: ${business.bankName || '❌ Eksik'}`);
    console.log(`   Şube: ${business.bankBranch || '❌ Eksik'}`);
    console.log(`   Hesap Türü: ${business.accountType || '❌ Eksik'}`);

    // 2. Örnek sipariş oluştur
    console.log('\n2️⃣ Örnek Sipariş Oluşturma:');
    const testOrder = {
      id: 'test-order-' + Date.now(),
      total: 299.99,
      status: 'PAID',
      paymentMethod: 'PAYTR',
      guestName: 'Test Müşteri',
      guestEmail: 'test@example.com'
    };

    console.log('✅ Test siparişi hazırlandı:');
    console.log(`   Sipariş ID: ${testOrder.id}`);
    console.log(`   Tutar: ${testOrder.total} TL`);
    console.log(`   Durum: ${testOrder.status}`);

    // 3. Transfer işlemi simülasyonu
    console.log('\n3️⃣ Transfer İşlemi Simülasyonu:');
    
    if (!business.ibanNumber || !business.accountHolderName || !business.bankName) {
      console.log('❌ Transfer için gerekli bilgiler eksik!');
      console.log('   Lütfen işletme hesabında banka bilgilerini tamamlayın.');
      return;
    }

    console.log('💰 Transfer Detayları:');
    console.log(`   Sipariş ID: ${testOrder.id}`);
    console.log(`   Tutar: ${testOrder.total} TL`);
    console.log(`   IBAN: ${business.ibanNumber}`);
    console.log(`   Hesap Sahibi: ${business.accountHolderName}`);
    console.log(`   Banka: ${business.bankName}`);
    console.log(`   Şube: ${business.bankBranch}`);
    console.log(`   Hesap Türü: ${business.accountType}`);

    // 4. E-posta bildirimi testi
    console.log('\n4️⃣ E-posta Bildirimi Testi:');
    console.log(`   Alıcı: ${business.contactEmail}`);
    console.log(`   Konu: 💰 Transfer Bildirimi - Sipariş #${testOrder.id}`);
    console.log('   İçerik: Transfer detayları ve banka bilgileri');

    // 5. Sistem durumu özeti
    console.log('\n5️⃣ Sistem Durumu Özeti:');
    
    const missingFields = [];
    if (!business.ibanNumber) missingFields.push('IBAN');
    if (!business.accountHolderName) missingFields.push('Hesap Sahibi');
    if (!business.bankName) missingFields.push('Banka Adı');
    if (!business.bankBranch) missingFields.push('Şube');
    if (!business.accountType) missingFields.push('Hesap Türü');

    if (missingFields.length === 0) {
      console.log('✅ Transfer sistemi tamamen hazır!');
      console.log('✅ Kullanıcı ödeme yaptığında otomatik transfer yapılacak');
      console.log('✅ İşletme sahibine e-posta bildirimi gönderilecek');
    } else {
      console.log('⚠️  Transfer sistemi eksik bilgilerle çalışıyor:');
      missingFields.forEach(field => console.log(`   ❌ ${field}`));
      console.log('\n💡 Eksik bilgileri tamamlamak için:');
      console.log('   node scripts/update-business-account.js');
    }

    // 6. Gerçek transfer entegrasyonu durumu
    console.log('\n6️⃣ Gerçek Transfer Entegrasyonu:');
    console.log('⚠️  Şu anda sadece bildirim sistemi aktif');
    console.log('⚠️  Gerçek banka transferi için API entegrasyonu gerekli');
    console.log('💡 Önerilen: Ziraat Bankası API entegrasyonu');

  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Test'i çalıştır
testTransferSystem(); 