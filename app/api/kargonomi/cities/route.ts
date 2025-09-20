import { NextResponse } from 'next/server';
import { kargonomiAPI } from '@/lib/kargonomiService';

export async function GET() {
  try {
    const cities = await kargonomiAPI.getCities();
    
    return NextResponse.json({
      success: true,
      cities
    });
  } catch (error) {
    console.error('Kargonomi cities error:', error);
    return NextResponse.json(
      { error: 'Şehir listesi alınamadı' },
      { status: 500 }
    );
  }
} 