require('dotenv').config();

async function testKargonomiAPI() {
  try {
    console.log('🚚 Kargonomi API Test Ediliyor...\n');
    
    // Environment variables kontrol
    console.log('🔧 Environment Variables:');
    console.log('KARGONOMI_BASE_URL:', process.env.KARGONOMI_BASE_URL || 'https://app.kargonomi.com.tr/api/v1');
    console.log('KARGONOMI_BEARER_TOKEN:', process.env.KARGONOMI_BEARER_TOKEN ? '✅ Tanımlı' : '❌ Tanımlı değil');
    console.log('');

    if (!process.env.KARGONOMI_BEARER_TOKEN) {
      console.log('❌ KARGONOMI_BEARER_TOKEN tanımlı değil!');
      console.log('📝 .env dosyasına KARGONOMI_BEARER_TOKEN=your-token-here ekleyin');
      return;
    }

    // API test
    console.log('📡 API Bağlantısı Test Ediliyor...');
    
    const baseURL = process.env.KARGONOMI_BASE_URL || 'https://app.kargonomi.com.tr/api/v1';
    const token = process.env.KARGONOMI_BEARER_TOKEN;
    
    // Şehirler endpoint'ini test et
    const citiesResponse = await fetch(`${baseURL}/cities`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (citiesResponse.ok) {
      const cities = await citiesResponse.json();
      console.log(`✅ Şehirler API Çalışıyor! Toplam: ${cities.length} şehir`);
      
      if (cities.length > 0) {
        console.log('İlk 3 şehir:');
        cities.slice(0, 3).forEach((city, index) => {
          console.log(`   ${index + 1}. ${city.name} (ID: ${city.id})`);
        });
      }
    } else {
      console.log(`❌ Şehirler API Hatası: ${citiesResponse.status} ${citiesResponse.statusText}`);
    }

    // Kargo listesi endpoint'ini test et
    console.log('\n📦 Kargo Listesi Test Ediliyor...');
    const shipmentsResponse = await fetch(`${baseURL}/shipments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (shipmentsResponse.ok) {
      const shipments = await shipmentsResponse.json();
      console.log(`✅ Kargo Listesi API Çalışıyor! Toplam: ${shipments.length || 0} kargo`);
      
      if (shipments && shipments.length > 0) {
        console.log('İlk 3 kargo:');
        shipments.slice(0, 3).forEach((shipment, index) => {
          console.log(`   ${index + 1}. ID: ${shipment.id} | Alıcı: ${shipment.buyer_name} | Durum: ${shipment.status}`);
        });
      } else {
        console.log('📭 Henüz hiç kargo yok');
      }
    } else {
      console.log(`❌ Kargo Listesi API Hatası: ${shipmentsResponse.status} ${shipmentsResponse.statusText}`);
    }

  } catch (error) {
    console.error('❌ Test Hatası:', error.message);
  }
}

testKargonomiAPI(); 