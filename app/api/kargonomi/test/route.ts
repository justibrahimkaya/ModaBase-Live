import { NextResponse } from 'next/server';
import { kargonomiAPI } from '@/lib/kargonomiService';

export async function GET() {
  try {
    const results: any = {};

    // Test 1: Şehir listesi
    try {
      const cities = await kargonomiAPI.getCities();
      results.cities = {
        success: true,
        count: cities.length,
        sample: cities.slice(0, 5) // İlk 5 şehir
      };
    } catch (error) {
      results.cities = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 2: İstanbul ilçeleri
    try {
      const districts = await kargonomiAPI.getDistricts(34); // İstanbul
      results.istanbulDistricts = {
        success: true,
        count: districts.length,
        sample: districts.slice(0, 5) // İlk 5 ilçe
      };
    } catch (error) {
      results.istanbulDistricts = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 3: Gönderi listesi
    try {
      const shipments = await kargonomiAPI.getShipments();
      results.shipments = {
        success: true,
        count: shipments.length
      };
    } catch (error) {
      results.shipments = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      success: true,
      apiBaseUrl: process.env.KARGONOMI_BASE_URL,
      hasBearerToken: !!process.env.KARGONOMI_BEARER_TOKEN,
      tokenLength: process.env.KARGONOMI_BEARER_TOKEN?.length || 0,
      tokenPreview: process.env.KARGONOMI_BEARER_TOKEN?.substring(0, 20) + '...' || 'Yok',
      tests: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kargonomi test error:', error);
    return NextResponse.json(
      { 
        error: 'Test sırasında hata oluştu',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 