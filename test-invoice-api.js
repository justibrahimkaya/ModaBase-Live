// =======================================================
// FATURA API TEST SCRIPTI - CANLI VERİ GÜVENLİ
// =======================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInvoiceAPI() {
  console.log('🧪 Fatura API test ediliyor...\n');

  try {
    // Herhangi bir sipariş al (test için)
    console.log('📋 Test siparişi aranıyor...');
    const testOrder = await prisma.order.findFirst({
      where: {
        einvoiceStatus: null // Henüz faturası olmayan
      },
      select: {
        id: true,
        total: true,
        status: true,
        user: { select: { name: true } },
        guestName: true
      }
    });

    if (!testOrder) {
      console.log('❌ Test edilebilir sipariş bulunamadı');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Test siparişi bulundu:');
    console.log(`   Sipariş ID: ${testOrder.id.slice(-8)}`);
    console.log(`   Müşteri: ${testOrder.user?.name || testOrder.guestName || 'Belirtilmemiş'}`);
    console.log(`   Tutar: ${testOrder.total}₺`);
    console.log(`   Durum: ${testOrder.status}`);

    console.log('\n📡 API çağrısı yapılıyor...');
    console.log('   Endpoint: http://localhost:3000/api/admin/invoices');
    console.log('   Method: POST');
    console.log(`   Body: { "orderId": "${testOrder.id}" }`);

    // API çağrısı yap
    const response = await fetch('http://localhost:3000/api/admin/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Admin yetkisiz erişim testi için cookie olmadan deneyeceğiz
      },
      body: JSON.stringify({ orderId: testOrder.id })
    });

    console.log('\n📥 API Yanıtı:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ API başarılı!');
      try {
        const data = JSON.parse(result);
        console.log('   Response data:', data);
      } catch {
        console.log('   Response (text):', result);
      }
    } else {
      console.log('❌ API hatası:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${result}`);
      
      // Yaygın hata durumları
      if (response.status === 401) {
        console.log('\n💡 ÇÖZÜM: Admin yetkisi gerekiyor');
        console.log('   - İşletme panelinde giriş yapın');
        console.log('   - Browser developer tools > Network tab\'da isteği inceleyin');
        console.log('   - Cookie\'lerin gönderildiğini kontrol edin');
      } else if (response.status === 500) {
        console.log('\n💡 ÇÖZÜM: Sunucu hatası var');
        console.log('   - Uygulama loglarını kontrol edin');
        console.log('   - Veritabanı bağlantısını kontrol edin');
        console.log('   - Environment variables\'ları kontrol edin');
      } else if (response.status === 404) {
        console.log('\n💡 ÇÖZÜM: API endpoint bulunamadı');
        console.log('   - URL doğru mu kontrol edin');
        console.log('   - Next.js uygulaması çalışıyor mu kontrol edin');
      }
    }

  } catch (error) {
    console.error('\n❌ TEST HATASI:');
    console.error('   Hata tipi:', error.constructor.name);
    console.error('   Hata mesajı:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 ÇÖZÜM: Uygulama çalışmıyor');
      console.log('   - npm run dev komutu ile uygulamayı başlatın');
      console.log('   - http://localhost:3000 adresine erişilebildiğini kontrol edin');
    }
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 ÇÖZÜM: Network hatası');
      console.log('   - İnternet bağlantınızı kontrol edin');
      console.log('   - Firewall ayarlarını kontrol edin');
    }
  }

  await prisma.$disconnect();
  
  console.log('\n📋 SONUÇ RAPORU:');
  console.log('1. Bu test API endpoint\'ini doğrudan çağırdı');
  console.log('2. Gerçek sorun büyük ihtimalle:');
  console.log('   - Admin kimlik doğrulama sorunu (401 hatası)');
  console.log('   - Sunucu tarafı kod hatası (500 hatası)');
  console.log('   - Environment variables eksikliği');
  console.log('3. Çözüm için işletme panelinde manuel test yapın');
}

// Test'i çalıştır
testInvoiceAPI().catch(console.error); 