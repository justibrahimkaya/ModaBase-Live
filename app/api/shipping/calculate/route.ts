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

      // Gönderi oluştur
      const createdShipment = await kargonomiAPI.createShipment(shipment);
      
      // Fiyat karşılaştırması al
      const priceComparison = await kargonomiAPI.getPriceComparison(createdShipment.id);

      // Kargonomi formatından bizim formatımıza çevir
      const quotes = priceComparison.providers.map(provider => ({
        companyId: provider.id.toString(),
        companyName: provider.name,
        price: provider.price,
        estimatedDays: provider.estimated_days,
        isAvailable: true
      }));

      return NextResponse.json({
        success: true,
        packageInfo,
        quotes,
        totalWeight: Math.round(totalWeight * 100) / 100,
        desi: Math.round(desi * 10) / 10,
        shipmentId: createdShipment.id
      });

    } catch (kargonomiError) {
      console.error('Kargonomi API error:', kargonomiError);
      
      // Kargonomi API çalışmıyorsa mock fiyatlar döndür
      const mockQuotes = [
        {
          companyId: 'kolaygelsin',
          companyName: 'Kolay Gelsin',
          price: desi <= 2 ? 106.80 : desi <= 5 ? 142.80 : 202.80,
          estimatedDays: 2,
          isAvailable: true
        },
        {
          companyId: 'aras',
          companyName: 'Aras Kargo',
          price: desi <= 1 ? 115.76 : desi <= 5 ? 187.68 : 254.30,
          estimatedDays: 3,
          isAvailable: true
        },
        {
          companyId: 'surat',
          companyName: 'Sürat Kargo',
          price: desi <= 2 ? 94.99 : desi <= 5 ? 112.49 : 143.93,
          estimatedDays: 2,
          isAvailable: true
        }
      ];

      return NextResponse.json({
        success: true,
        packageInfo,
        quotes: mockQuotes,
        totalWeight: Math.round(totalWeight * 100) / 100,
        desi: Math.round(desi * 10) / 10,
        note: 'Mock fiyatlar kullanılıyor (Kargonomi API bağlantısı kurulamadı)'
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