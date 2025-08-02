// =======================================================
// E.ARŞİV SİSTEM TESTİ - TEST ORTAMI
// =======================================================

const { EarsivService } = require('./lib/earsiv/earsivService');
const { EARSIV_CONFIG } = require('./lib/earsiv/constants');

async function testEarsivSystem() {
  console.log('🧪 E.arşiv sistem testi başlıyor...\n');

  try {
    // 1. SISTEM DURUMU KONTROL
    console.log('📊 1. SİSTEM DURUMU:');
    const status = EarsivService.getStatus();
    console.log('   Test modu:', status.isTestMode ? '✅ Aktif' : '❌ Pasif');
    console.log('   Giriş durumu:', status.isLoggedIn ? '✅ Girişli' : '❌ Çıkışlı');
    console.log('   Mod:', status.mode);

    // 2. TEST MODUNU BAŞLAT
    console.log('\n🔧 2. TEST MODU BAŞLATMA:');
    const initResult = await EarsivService.initializeTestMode();
    console.log('   Test modu başlatma:', initResult ? '✅ Başarılı' : '❌ Başarısız');

    if (!initResult) {
      console.log('❌ Test modu başlatılamadı. GİB test sunucusu erişilebilir mi kontrol edin.');
      return;
    }

    // 3. TEST FATURASI OLUŞTUR
    console.log('\n📄 3. TEST FATURASI OLUŞTURMA:');
    console.log('   Test verileri hazırlanıyor...');
    
    const testResult = await EarsivService.createTestInvoice();
    
    console.log('   Test faturası sonucu:');
    console.log('   ├─ Başarılı:', testResult.success ? '✅' : '❌');
    console.log('   ├─ Test modu:', testResult.isTest ? '✅' : '❌');
    
    if (testResult.success) {
      console.log('   ├─ Fatura UUID:', testResult.invoiceUuid || 'Yok');
      console.log('   ├─ Fatura ID:', testResult.invoiceId || 'Taslak');
      console.log('   └─ Durum: ✅ E.arşiv test faturası başarıyla oluşturuldu!');
    } else {
      console.log('   ├─ Hata:', testResult.error || 'Bilinmeyen hata');
      console.log('   └─ Durum: ❌ Test faturası oluşturulamadı');
    }

    // 4. KDV HESAPLAMA TESTİ
    console.log('\n💰 4. KDV HESAPLAMA TESTİ:');
    const testItems = [
      { price: 100, quantity: 1 },
      { price: 50, quantity: 2 }
    ];
    
    const taxCalc = EarsivService.calculateInvoiceTax(testItems);
    console.log('   Test ürünler: 100₺ x1 + 50₺ x2');
    console.log('   ├─ Ara toplam:', taxCalc.subtotal.toFixed(2), '₺');
    console.log('   ├─ KDV (%' + taxCalc.taxRate + '):', taxCalc.taxAmount.toFixed(2), '₺');
    console.log('   └─ Genel toplam:', taxCalc.total.toFixed(2), '₺');

    // 5. SISTEM BİLGİLERİ
    console.log('\n📋 5. SİSTEM BİLGİLERİ:');
    console.log('   ├─ Test VKN:', EARSIV_CONFIG.TEST_CREDENTIALS.username);
    console.log('   ├─ KDV oranları:', Object.entries(EARSIV_CONFIG.TAX_RATES).map(([k,v]) => `${k}:%${v}`).join(', '));
    console.log('   ├─ Para birimi:', EARSIV_CONFIG.CURRENCY);
    console.log('   └─ Test URL:', EARSIV_CONFIG.TEST_BASE_URL);

    // 6. SONUÇ RAPORU
    console.log('\n🎯 6. TEST SONUCU:');
    if (testResult.success) {
      console.log('✅ E.ARŞİV TEST ORTAMI BAŞARILI!');
      console.log('');
      console.log('📋 SONRAKİ ADIMLAR:');
      console.log('1. ✅ Test ortamı çalışıyor');
      console.log('2. ✅ Hibrit sistem (PDF + E.arşiv) hazır');
      console.log('3. 🎯 İşletme panelinde "Fatura Oluştur" test edin');
      console.log('4. 📊 Terminal\'de hem PDF hem E.arşiv loglarını göreceksiniz');
      console.log('5. 🔄 Gerçek verilerle production\'a geçmeye hazır!');
    } else {
      console.log('⚠️  E.ARŞİV TEST PROBLEMI');
      console.log('');
      console.log('📋 KONTROL EDİLMESİ GEREKENLER:');
      console.log('1. 🌐 İnternet bağlantısı var mı?');
      console.log('2. 🔓 GİB test sunucusu erişilebilir mi?');
      console.log('3. 🧾 PDF fatura sistemi çalışıyor mu?');
      console.log('4. ⚙️  Next.js uygulaması çalışıyor mu?');
      console.log('');
      console.log('💡 Not: PDF fatura sistemi e.arşiv olmadan da çalışmaya devam eder.');
    }

  } catch (error) {
    console.error('\n❌ TEST HATASI:', error.message);
    console.log('\n🔧 HATIRA NEDENLERİ:');
    console.log('- İnternet bağlantısı problemi');
    console.log('- GİB test sunucusu kapalı olabilir');
    console.log('- Node.js kütüphane eksikliği');
    console.log('- Network firewall engelleme');
  }

  console.log('\n📞 Test tamamlandı. Sonuçları paylaşabilirsiniz.');
}

// Test'i çalıştır
testEarsivSystem().catch(console.error); 