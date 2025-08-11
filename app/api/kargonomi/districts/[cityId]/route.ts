import { NextRequest, NextResponse } from 'next/server';
import { kargonomiAPI } from '@/lib/kargonomiService';

export async function GET(
  _request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const cityId = parseInt(params.cityId);
    
    if (isNaN(cityId)) {
      return NextResponse.json(
        { error: 'Geçersiz şehir ID' },
        { status: 400 }
      );
    }

    const districts = await kargonomiAPI.getDistricts(cityId);
    
    return NextResponse.json({
      success: true,
      districts
    });
  } catch (error) {
    console.error('Kargonomi districts error:', error);
    return NextResponse.json(
      { error: 'İlçe listesi alınamadı' },
      { status: 500 }
    );
  }
} 