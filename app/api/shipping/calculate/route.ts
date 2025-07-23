import { NextRequest, NextResponse } from 'next/server';
import { calculateDesi, PackageInfo } from '@/lib/shippingService';
import { kargonomiAPI, createKargonomiShipment } from '@/lib/kargonomiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, toAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Ürün bilgileri gerekli' },
        { status: 400 }
      );
    }

    // Toplam paket bilgilerini hesapla
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let totalHeight = 0;

    items.forEach((item: any) => {
      const itemWeight = (item.product.weight || 0.5) * item.quantity;
      const itemLength = item.product.length || 20;
      const itemWidth = item.product.width || 15;
      const itemHeight = item.product.height || 10;

      totalWeight += itemWeight;
      maxLength = Math.max(maxLength, itemLength);
      maxWidth = Math.max(maxWidth, itemWidth);
      totalHeight += itemHeight * item.quantity;
    });

    // Desi hesaplama
    const desi = calculateDesi(maxLength, maxWidth, totalHeight, totalWeight);

    const packageInfo: PackageInfo = {
      weight: totalWeight,
      length: maxLength,
      width: maxWidth,
      height: totalHeight,
      desi
    };

    // Kargonomi API ile gerçek fiyat hesaplama
    try {
      console.log('🚚 Kargonomi API ile gerçek fiyat hesaplanıyor...');
      
      // Örnek gönderi oluştur (gerçek uygulamada adres bilgileri kullanılacak)
      const shipment = createKargonomiShipment(
        {
          name: 'ModaBase',
          email: 'info@modabase.com.tr',
          taxNumber: '1234567890',
          taxPlace: 'İstanbul',
          phone: '0212 123 45 67',
          address: 'İstanbul, Türkiye',
          cityId: 34, // İstanbul
          districtId: 1, // Örnek ilçe
        },
        {
          name: 'Müşteri',
          email: 'customer@example.com',
          phone: '0555 123 45 67',
          address: toAddress || 'Ankara, Türkiye',
          cityId: 6, // Ankara
          districtId: 1, // Örnek ilçe
        },
        [{
          desi: desi,
          content: 'Moda ürünleri',
        }]
      );

      console.log('📦 Gönderi oluşturuluyor:', shipment);
      
      // Gönderi oluştur
      const createdShipment = await kargonomiAPI.createShipment(shipment);
      console.log('✅ Gönderi oluşturuldu:', createdShipment);
      
      // Fiyat karşılaştırması al
      const priceComparison = await kargonomiAPI.getPriceComparison(createdShipment.id);
      console.log('💰 Fiyat karşılaştırması:', priceComparison);

      // Kargonomi formatından bizim formatımıza çevir
      const quotes = priceComparison.providers.map(provider => ({
        companyId: provider.id.toString(),
        companyName: provider.name,
        price: provider.price,
        estimatedDays: provider.estimated_days,
        isAvailable: true
      }));

      console.log('✅ Gerçek kargo fiyatları alındı:', quotes.length, 'firma');

      return NextResponse.json({
        success: true,
        packageInfo,
        quotes,
        totalWeight: Math.round(totalWeight * 100) / 100,
        desi: Math.round(desi * 10) / 10,
        shipmentId: createdShipment.id,
        source: 'Kargonomi API'
      });

    } catch (kargonomiError) {
      console.error('❌ Kargonomi API error:', kargonomiError);
      
      // Kargonomi API çalışmıyorsa gerçek fiyatları kullan
      console.log('🔄 Gerçek fiyatlar kullanılıyor...');
      
      const realQuotes = [
        {
          companyId: 'aras',
          companyName: 'Aras Kargo',
          price: desi <= 1 ? 115.76 : desi <= 2 ? 131.21 : desi <= 5 ? 187.68 : desi <= 10 ? 254.30 : desi <= 15 ? 318.55 : desi <= 20 ? 404.81 : desi <= 25 ? 502.04 : desi <= 30 ? 582.77 : 582.77,
          estimatedDays: 3,
          isAvailable: true
        },
        {
          companyId: 'surat',
          companyName: 'Sürat Kargo',
          price: desi <= 2 ? 94.99 : desi <= 5 ? 112.49 : desi <= 10 ? 143.93 : desi <= 15 ? 179.30 : desi <= 20 ? 239.08 : desi <= 25 ? 311.30 : desi <= 30 ? 373.57 : 373.57,
          estimatedDays: 2,
          isAvailable: true
        },
        {
          companyId: 'ptt',
          companyName: 'PTT Kargo',
          price: desi <= 0.5 ? 83.88 : desi <= 2 ? 97.50 : desi <= 5 ? 128.40 : desi <= 10 ? 178.80 : desi <= 15 ? 252.00 : desi <= 20 ? 306.00 : desi <= 25 ? 375.60 : desi <= 30 ? 444.00 : 444.00,
          estimatedDays: 3,
          isAvailable: true
        },
        {
          companyId: 'hepsijet',
          companyName: 'Hepsijet',
          price: desi <= 2 ? 83.88 : desi <= 5 ? 107.88 : desi <= 10 ? 141.60 : desi <= 20 ? 204.00 : desi <= 30 ? 312.00 : 312.00,
          estimatedDays: 2,
          isAvailable: true
        },
        {
          companyId: 'ups',
          companyName: 'UPS Kargo',
          price: desi <= 2 ? 102.60 : desi <= 5 ? 107.88 : desi <= 10 ? 133.20 : desi <= 15 ? 162.00 : desi <= 20 ? 181.20 : desi <= 25 ? 210.00 : desi <= 30 ? 256.80 : desi <= 40 ? 325.20 : desi <= 50 ? 409.20 : 409.20,
          estimatedDays: 2,
          isAvailable: true
        }
      ];

      return NextResponse.json({
        success: true,
        packageInfo,
        quotes: realQuotes,
        totalWeight: Math.round(totalWeight * 100) / 100,
        desi: Math.round(desi * 10) / 10,
        note: 'Gerçek fiyatlar kullanılıyor (Kargonomi API bağlantısı kurulamadı)',
        source: 'Real Prices'
      });
    }

  } catch (error) {
    console.error('Kargo fiyat hesaplama hatası:', error);
    return NextResponse.json(
      { error: 'Kargo fiyatı hesaplanırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 