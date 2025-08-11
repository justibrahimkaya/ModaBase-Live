import { NextRequest, NextResponse } from 'next/server';
import { kargonomiAPI } from '@/lib/kargonomiService';

// Kargo fiyat onaylama
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const shipmentId = parseInt(formData.get('shipment_id') as string);
    const shippingProviderId = parseInt(formData.get('shipping_provider_id') as string);
    
    if (isNaN(shipmentId) || isNaN(shippingProviderId)) {
      return NextResponse.json(
        { error: 'Geçersiz kargo ID veya kargo firması ID' },
        { status: 400 }
      );
    }

    const result = await kargonomiAPI.confirmShippingPrice({
      shipment_id: shipmentId,
      shipping_provider_id: shippingProviderId
    });
    
    return NextResponse.json({
      success: true,
      message: 'Kargo fiyatı başarıyla onaylandı',
      result
    });
  } catch (error) {
    console.error('Kargonomi confirm shipping price error:', error);
    return NextResponse.json(
      { error: 'Kargo fiyatı onaylanamadı' },
      { status: 500 }
    );
  }
} 