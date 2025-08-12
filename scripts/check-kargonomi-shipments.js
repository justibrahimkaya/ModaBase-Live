const { kargonomiAPI } = require('C:/Users/Hp/Desktop/ModaBase/lib/kargonomiService');
require('dotenv').config();

async function checkKargonomiShipments() {
  try {
    console.log('🚚 Kargonomi API Kargo Kayıtları Kontrol Ediliyor...\n');

    // Kargonomi API'den kargo listesini al
    console.log('📡 Kargonomi API\'ye bağlanılıyor...');
    const shipments = await kargonomiAPI.getShipments();
    
    console.log(`📊 Toplam Kargo Sayısı: ${shipments.length || 0}\n`);

    if (shipments && shipments.length > 0) {
      console.log('📦 KARGONOMİ KARGOLARI:');
      shipments.forEach((shipment, index) => {
        console.log(`${index + 1}. ID: ${shipment.id} | Takip: ${shipment.tracking_number || 'Yok'} | Alıcı: ${shipment.buyer_name} | Gönderici: ${shipment.sender_name} | Durum: ${shipment.status} | Tarih: ${shipment.created_at}`);
      });
    } else {
      console.log('❌ Kargonomi API\'den kargo verisi alınamadı veya hiç kargo yok.');
    }

    // Şehirleri kontrol et
    console.log('\n🏙️ ŞEHİRLER KONTROL EDİLİYOR...');
    try {
      const cities = await kargonomiAPI.getCities();
      console.log(`📊 Toplam Şehir Sayısı: ${cities.length || 0}`);
      
      if (cities && cities.length > 0) {
        console.log('İlk 5 şehir:');
        cities.slice(0, 5).forEach((city, index) => {
          console.log(`${index + 1}. ${city.name} (ID: ${city.id})`);
        });
      }
    } catch (error) {
      console.log('❌ Şehir verisi alınamadı:', error.message);
    }

    // İstanbul'un ilçelerini kontrol et
    console.log('\n🏘️ İSTANBUL İLÇELERİ KONTROL EDİLİYOR...');
    try {
      const districts = await kargonomiAPI.getDistricts(34); // İstanbul ID'si
      console.log(`📊 İstanbul İlçe Sayısı: ${districts.length || 0}`);
      
      if (districts && districts.length > 0) {
        console.log('İlk 5 ilçe:');
        districts.slice(0, 5).forEach((district, index) => {
          console.log(`${index + 1}. ${district.name} (ID: ${district.id})`);
        });
      }
    } catch (error) {
      console.log('❌ İlçe verisi alınamadı:', error.message);
    }

  } catch (error) {
    console.error('❌ Kargonomi API Hatası:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('🔑 API Token hatası - KARGONOMI_API_TOKEN kontrol edilmeli');
    } else if (error.message.includes('404')) {
      console.log('🔗 API URL hatası - KARGONOMI_API_URL kontrol edilmeli');
    }
  }
}

checkKargonomiShipments(); 