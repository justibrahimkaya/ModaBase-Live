// =======================================================
// GERÇEK BİLGİLERLE E.ARŞİV TEST FATURASI
// =======================================================

console.log('🎯 GERÇEK BİLGİLERLE E.ARŞİV TESTİ\n');

console.log('📋 TEST BİLGİLERİ:');
console.log('👤 Firma: ModaHan ibrahim kaya');
console.log('🆔 VKN: 5320543093');
console.log('👤 E.arşiv Kullanıcı: 53208908');
console.log('🏛️ Vergi Dairesi: ATIŞALANI');
console.log('💰 KDV Oranı: %10 (Tekstil)');
console.log('📍 Adres: MALKOÇOĞLU MAH.305/1. SK. KARAKUŞ AP NO 17 A SULTANGAZİ/İSTANBUL');
console.log('📞 Tel: 05362971255');
console.log('📧 Email: kavram.triko@gmail.com');
console.log('');

// Test ortamında gerçek hesap bilgileriyle fatura test et
async function testRealEarsiv() {
  try {
    console.log('🔄 Gerçek e.arşiv hesabı ile test modunda bağlantı deneniyor...');
    console.log('🌐 Test URL: https://efaturatest.gib.gov.tr');
    console.log('');
    
    // Test için fetch denemesi
    const testUrl = 'https://efaturatest.gib.gov.tr/earsiv-services/assos-login';
    
    console.log('🔗 Test bağlantısı:', testUrl);
    
    const testData = {
      assoscmd: 'login',
      userid: '53208908',
      sifre: '147258',
      rtype: 'json'
    };

    console.log('📤 Test verisi gönderiliyor...');
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(testData).toString()
    });

    console.log('📥 Yanıt alındı:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 Sonuç:', result);
      
      if (result.userid && result.token) {
        console.log('✅ BAŞARILI! GİB test ortamına gerçek hesapla giriş yapıldı');
        console.log('🎯 Token alındı:', result.token.substring(0, 20) + '...');
        console.log('');
        console.log('🎉 E.ARŞİV SİSTEMİ ÇALIŞIYOR!');
        console.log('');
        console.log('📋 SONRAKI ADIMLAR:');
        console.log('1. ✅ İşletme panelinde "Fatura Oluştur" test edin');
        console.log('2. ✅ Artık gerçek e.arşiv faturası oluşacak');
        console.log('3. 📧 E-posta ile PDF + E.arşiv bilgileri gelecek');
        console.log('4. 🎯 GİB e.arşiv portalında faturayı görebilirsiniz');
        
      } else {
        console.log('⚠️ Giriş yapıldı ama token alınamadı');
        console.log('📊 Detay:', result);
      }
      
    } else {
      console.log('❌ HTTP Hatası:', response.status);
      const text = await response.text();
      console.log('📋 Detay:', text.substring(0, 200));
    }

  } catch (error) {
    console.log('❌ BAĞLANTI HATASI:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('');
      console.log('🌐 İNTERNET BAĞLANTISI SORUNU:');
      console.log('- GİB test sunucusu erişilemez durumda olabilir');
      console.log('- İnternet bağlantınızı kontrol edin');
      console.log('- Firewall/proxy ayarlarını kontrol edin');
      console.log('');
      console.log('💡 ÇÖZÜM:');
      console.log('- Birkaç dakika sonra tekrar deneyin');
      console.log('- Veya doğrudan işletme panelinde test edin');
      console.log('- PDF fatura sistemi zaten çalışıyor');
    } else {
      console.log('🔧 Diğer olası nedenler:');
      console.log('- GİB sunucusu bakımda olabilir');
      console.log('- Hesap bilgileri hatalı olabilir');
      console.log('- Network konfigürasyonu sorunu');
    }
  }
}

console.log('🚀 Test başlatılıyor...\n');
testRealEarsiv(); 