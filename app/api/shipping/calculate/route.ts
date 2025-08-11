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
      
      // Kargonomi API çalışmıyorsa ShippingService ile uyumlu fiyatları kullan
      console.log('🔄 ShippingService ile uyumlu fiyatlar kullanılıyor...');
      
      const realQuotes = [
        {
          companyId: 'aras',
          companyName: 'Aras Kargo',
          price: desi <= 1 ? 106.12 : desi <= 2 ? 120.27 : desi <= 5 ? 172.04 : desi <= 10 ? 233.11 : desi <= 15 ? 292.01 : desi <= 20 ? 371.07 : desi <= 25 ? 460.19 : desi <= 30 ? 534.20 : 534.20,
          estimatedDays: 3,
          isAvailable: true
        },
        {
          companyId: 'surat',
          companyName: 'Sürat Kargo',
          price: desi <= 2 ? 87.08 : desi <= 5 ? 103.11 : desi <= 10 ? 131.93 : desi <= 15 ? 164.36 : desi <= 20 ? 219.15 : desi <= 25 ? 285.36 : desi <= 30 ? 342.44 : 342.44,
          estimatedDays: 2,
          isAvailable: true
        },
        {
          companyId: 'ptt',
          companyName: 'PTT Kargo',
          price: desi <= 0.5 ? 76.89 : desi <= 2 ? 89.38 : desi <= 5 ? 117.70 : desi <= 10 ? 163.90 : desi <= 15 ? 231.00 : desi <= 20 ? 280.50 : desi <= 25 ? 344.30 : desi <= 30 ? 407.00 : 407.00,
          estimatedDays: 3,
          isAvailable: true
        },
        {
          companyId: 'hepsijet',
          companyName: 'Hepsijet',
          price: desi <= 2 ? 76.89 : desi <= 5 ? 98.89 : desi <= 10 ? 129.80 : desi <= 20 ? 187.00 : desi <= 30 ? 286.00 : 286.00,
          estimatedDays: 2,
          isAvailable: true
        },
        {
          companyId: 'ups',
          companyName: 'UPS Kargo',
          price: desi <= 2 ? 94.05 : desi <= 5 ? 98.89 : desi <= 10 ? 122.10 : desi <= 15 ? 148.50 : desi <= 20 ? 166.10 : desi <= 25 ? 192.50 : desi <= 30 ? 235.40 : desi <= 40 ? 298.10 : desi <= 50 ? 375.10 : 375.10,
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