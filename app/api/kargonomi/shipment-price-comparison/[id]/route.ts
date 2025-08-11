import { NextRequest, NextResponse } from 'next/server';
import { kargonomiAPI } from '@/lib/kargonomiService';

// Kargo fiyat karşılaştırması
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipmentId = parseInt(params.id);
    
    if (isNaN(shipmentId)) {
      return NextResponse.json(
        { error: 'Geçersiz kargo ID' },
        { status: 400 }
      );
    }

    const priceComparison = await kargonomiAPI.getPriceComparison(shipmentId);
    
    return NextResponse.json({
      success: true,
      priceComparison
    });
  } catch (error) {
    console.error('Kargonomi price comparison error:', error);
    return NextResponse.json(
      { error: 'Fiyat karşılaştırması alınamadı' },
      { status: 500 }
    );
  }
} 