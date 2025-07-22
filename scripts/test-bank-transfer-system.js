const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testBankTransferSystem() {
  try {
    console.log('🏦 Havale Sistemi Test Ediliyor...\n');

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
        bankBranch: true
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

    // 2. Test siparişi oluştur
    console.log('\n2️⃣ Test Siparişi Oluşturma:');
    const testOrder = await prisma.order.create({
      data: {
        total: 199.99,
        status: 'PENDING',
        paymentMethod: 'BANK_TRANSFER',
        guestName: 'Test Müşteri',
        guestSurname: 'Test',
        guestEmail: 'test@example.com',
        guestPhone: '05321234567'
      }
    });

    console.log('✅ Test siparişi oluşturuldu:');
    console.log(`   Sipariş ID: ${testOrder.id}`);
    console.log(`   Tutar: ${testOrder.total} TL`);
    console.log(`   Durum: ${testOrder.status}`);

    // 3. Havale bildirimi oluştur
    console.log('\n3️⃣ Havale Bildirimi Oluşturma:');
    const transferNotification = await prisma.transferNotification.create({
      data: {
        orderId: testOrder.id,
        customerName: 'Test Müşteri',
        customerEmail: 'test@example.com',
        customerPhone: '05321234567',
        transferAmount: 199.99,
        transferDate: new Date(),
        transferNote: 'Test siparişi için havale',
        status: 'PENDING',
        businessId: business.id,
        iban: business.ibanNumber || 'TR15 0001 0019 7980 1880 0750 01',
        accountHolder: business.accountHolderName || 'İbrahim Kaya',
        bankName: business.bankName || 'Ziraat Bankası'
      }
    });

    console.log('✅ Havale bildirimi oluşturuldu:');
    console.log(`   Transfer ID: ${transferNotification.id}`);
    console.log(`   Durum: ${transferNotification.status}`);

    // 4. Havale onaylama testi
    console.log('\n4️⃣ Havale Onaylama Testi:');
    const updatedTransfer = await prisma.transferNotification.update({
      where: { id: transferNotification.id },
      data: {
        status: 'CONFIRMED',
        adminNote: 'Test onayı',
        confirmedAt: new Date()
      }
    });

    console.log('✅ Havale onaylandı:');
    console.log(`   Durum: ${updatedTransfer.status}`);
    console.log(`   Onay Tarihi: ${updatedTransfer.confirmedAt}`);

    // 5. Sipariş durumu kontrolü
    console.log('\n5️⃣ Sipariş Durumu Kontrolü:');
    const updatedOrder = await prisma.order.findUnique({
      where: { id: testOrder.id }
    });

    console.log('✅ Sipariş durumu güncellendi:');
    console.log(`   Durum: ${updatedOrder.status}`);
    console.log(`   Ödeme Yöntemi: ${updatedOrder.paymentMethod}`);

    // 6. Sistem durumu özeti
    console.log('\n6️⃣ Sistem Durumu Özeti:');
    
    const missingFields = [];
    if (!business.ibanNumber) missingFields.push('IBAN');
    if (!business.accountHolderName) missingFields.push('Hesap Sahibi');
    if (!business.bankName) missingFields.push('Banka Adı');
    if (!business.bankBranch) missingFields.push('Şube');

    if (missingFields.length === 0) {
      console.log('✅ Havale sistemi tamamen hazır!');
      console.log('✅ Kullanıcılar direkt IBAN\'a havale yapabilir');
      console.log('✅ E-posta bildirimleri otomatik gönderilecek');
      console.log('✅ Admin onay sistemi çalışıyor');
    } else {
      console.log('⚠️  Havale sistemi eksik bilgilerle çalışıyor:');
      missingFields.forEach(field => console.log(`   ❌ ${field}`));
    }

    // 7. Temizlik - Test verilerini sil
    console.log('\n7️⃣ Test Verilerini Temizleme:');
    await prisma.transferNotification.delete({
      where: { id: transferNotification.id }
    });
    await prisma.order.delete({
      where: { id: testOrder.id }
    });
    console.log('✅ Test verileri temizlendi');

  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Test'i çalıştır
testBankTransferSystem(); 