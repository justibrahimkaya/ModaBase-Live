import { NextRequest, NextResponse } from 'next/server';
import { kargonomiAPI } from '@/lib/kargonomiService';

// Kargo detayını getir
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

    const shipment = await kargonomiAPI.getShipment(shipmentId);
    
    return NextResponse.json({
      success: true,
      shipment
    });
  } catch (error) {
    console.error('Kargonomi shipment detail error:', error);
    return NextResponse.json(
      { error: 'Kargo detayı alınamadı' },
      { status: 500 }
    );
  }
}

// Kargo güncelle
export async function PUT(
  request: NextRequest,
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

    const formData = await request.formData();
    
    // FormData'dan kargo bilgilerini al
    const shipmentData: any = {
      sender_name: formData.get('shipment[sender_name]') as string,
      sender_email: formData.get('shipment[sender_email]') as string,
      sender_tax_number: formData.get('shipment[sender_tax_number]') as string,
      sender_tax_place: formData.get('shipment[sender_tax_place]') as string,
      sender_phone: formData.get('shipment[sender_phone]') as string,
      sender_address: formData.get('shipment[sender_address]') as string,
      sender_city_id: parseInt(formData.get('shipment[sender_city_id]') as string),
      sender_district_id: parseInt(formData.get('shipment[sender_district_id]') as string),
      buyer_name: formData.get('shipment[buyer_name]') as string,
      buyer_email: formData.get('shipment[buyer_email]') as string,
      buyer_phone: formData.get('shipment[buyer_phone]') as string,
      buyer_address: formData.get('shipment[buyer_address]') as string,
      buyer_city_id: parseInt(formData.get('shipment[buyer_city_id]') as string),
      buyer_district_id: parseInt(formData.get('shipment[buyer_district_id]') as string),
      packages: []
    };

    // Optional fields
    const buyerTaxNumber = formData.get('shipment[buyer_tax_number]') as string;
    const buyerTaxPlace = formData.get('shipment[buyer_tax_place]') as string;
    
    if (buyerTaxNumber) shipmentData.buyer_tax_number = buyerTaxNumber;
    if (buyerTaxPlace) shipmentData.buyer_tax_place = buyerTaxPlace;

    // Package bilgilerini al
    let packageIndex = 0;
    while (formData.has(`shipment[packages][${packageIndex}][desi]`)) {
      const packageData: any = {
        desi: parseFloat(formData.get(`shipment[packages][${packageIndex}][desi]`) as string)
      };
      
      const barcode = formData.get(`shipment[packages][${packageIndex}][barcode]`) as string;
      const content = formData.get(`shipment[packages][${packageIndex}][content]`) as string;
      
      if (barcode) packageData.barcode = barcode;
      if (content) packageData.content = content;
      
      shipmentData.packages.push(packageData);
      packageIndex++;
    }

    const result = await kargonomiAPI.updateShipment(shipmentId, shipmentData);
    
    return NextResponse.json({
      success: true,
      message: 'Kargo başarıyla güncellendi',
      shipment: result
    });
  } catch (error) {
    console.error('Kargonomi shipment update error:', error);
    return NextResponse.json(
      { error: 'Kargo güncellenemedi' },
      { status: 500 }
    );
  }
}

// Kargo sil
export async function DELETE(
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

    await kargonomiAPI.deleteShipment(shipmentId);
    
    return NextResponse.json({
      success: true,
      message: 'Kargo başarıyla silindi'
    });
  } catch (error) {
    console.error('Kargonomi shipment delete error:', error);
    return NextResponse.json(
      { error: 'Kargo silinemedi' },
      { status: 500 }
    );
  }
} 