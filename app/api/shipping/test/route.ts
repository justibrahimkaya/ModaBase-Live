import { NextResponse } from 'next/server';
import { getShippingQuotes, calculateDesi } from '@/lib/shippingService';

export async function GET() {
  try {
    // Test paket bilgileri
    const testPackages = [
      {
        name: 'Küçük Paket',
        weight: 0.5,
        length: 20,
        width: 15,
        height: 10
      },
      {
        name: 'Orta Paket',
        weight: 2,
        length: 30,
        width: 25,
        height: 20
      },
      {
        name: 'Büyük Paket',
        weight: 5,
        length: 50,
        width: 40,
        height: 30
      },
      {
        name: 'Çok Büyük Paket',
        weight: 15,
        length: 80,
        width: 60,
        height: 50
      }
    ];

    const results = [];

    for (const testPackage of testPackages) {
      const desi = calculateDesi(testPackage.length, testPackage.width, testPackage.height, testPackage.weight);
      
      const packageInfo = {
        weight: testPackage.weight,
        length: testPackage.length,
        width: testPackage.width,
        height: testPackage.height,
        desi
      };

      const quotes = await getShippingQuotes(packageInfo, 'İstanbul', 'Ankara');
      
      results.push({
        packageName: testPackage.name,
        packageInfo,
        quotes: quotes.map(quote => ({
          company: quote.companyName,
          price: quote.price,
          priceWithoutKDV: quote.price / 1.2, // KDV'siz fiyat
          estimatedDays: quote.estimatedDays
        }))
      });
    }

    return NextResponse.json({
      success: true,
      testResults: results,
      note: 'Fiyatlar KDV dahil olarak hesaplanmıştır (%20)'
    });

  } catch (error) {
    console.error('Test hatası:', error);
    return NextResponse.json(
      { error: 'Test sırasında hata oluştu' },
      { status: 500 }
    );
  }
} 