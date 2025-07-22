import { NextRequest, NextResponse } from 'next/server';
import { kargonomiAPI } from '@/lib/kargonomiService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parametrelerini al
    const page = searchParams.get('page');
    const shippingWebserviceOrderId = searchParams.get('filter[shipping_webservice_order_id]');
    const shippingWebserviceTrackingCode = searchParams.get('filter[shipping_webservice_tracking_code]');
    const shippingProviderSlug = searchParams.get('filter[shipping_provider_slug]');
    const status = searchParams.get('filter[status]');
    const ecommerceProviderOrderNo = searchParams.get('filter[ecommerce_provider_order_no]');
    const ecommerceProvider = searchParams.get('filter[ecommerce_provider]');
    const packageCountMin = searchParams.get('filter[package_count_min]');
    const packageCountMax = searchParams.get('filter[package_count_max]');
    const estimatedPriceMin = searchParams.get('filter[estimated_price_min]');
    const estimatedPriceMax = searchParams.get('filter[estimated_price_max]');
    const realPriceMin = searchParams.get('filter[real_price_min]');
    const realPriceMax = searchParams.get('filter[real_price_max]');
    const extraShippingPriceMin = searchParams.get('filter[extra_shipping_price_min]');
    const extraShippingPriceMax = searchParams.get('filter[extra_shipping_price_max]');
    const buyerName = searchParams.get('filter[buyer_name]');
    const deliveryDateToShipmentOfficeStartDate = searchParams.get('filter[delivery_date_to_shipment_office_start_date]');
    const deliveryDateToShipmentOfficeEndDate = searchParams.get('filter[delivery_date_to_shipment_office_end_date]');
    const shippingProviderCustomerDeliveryDateStartDate = searchParams.get('filter[shipping_provider_customer_delivery_date_start_date]');
    const shippingProviderCustomerDeliveryDateEndDate = searchParams.get('filter[shipping_provider_customer_delivery_date_end_date]');
    const createdAtStartDate = searchParams.get('filter[created_at_start_date]');
    const createdAtEndDate = searchParams.get('filter[created_at_end_date]');

    // Kargonomi API'ye query parametrelerini ekle
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (shippingWebserviceOrderId) queryParams.append('filter[shipping_webservice_order_id]', shippingWebserviceOrderId);
    if (shippingWebserviceTrackingCode) queryParams.append('filter[shipping_webservice_tracking_code]', shippingWebserviceTrackingCode);
    if (shippingProviderSlug) queryParams.append('filter[shipping_provider_slug]', shippingProviderSlug);
    if (status) queryParams.append('filter[status]', status);
    if (ecommerceProviderOrderNo) queryParams.append('filter[ecommerce_provider_order_no]', ecommerceProviderOrderNo);
    if (ecommerceProvider) queryParams.append('filter[ecommerce_provider]', ecommerceProvider);
    if (packageCountMin) queryParams.append('filter[package_count_min]', packageCountMin);
    if (packageCountMax) queryParams.append('filter[package_count_max]', packageCountMax);
    if (estimatedPriceMin) queryParams.append('filter[estimated_price_min]', estimatedPriceMin);
    if (estimatedPriceMax) queryParams.append('filter[estimated_price_max]', estimatedPriceMax);
    if (realPriceMin) queryParams.append('filter[real_price_min]', realPriceMin);
    if (realPriceMax) queryParams.append('filter[real_price_max]', realPriceMax);
    if (extraShippingPriceMin) queryParams.append('filter[extra_shipping_price_min]', extraShippingPriceMin);
    if (extraShippingPriceMax) queryParams.append('filter[extra_shipping_price_max]', extraShippingPriceMax);
    if (buyerName) queryParams.append('filter[buyer_name]', buyerName);
    if (deliveryDateToShipmentOfficeStartDate) queryParams.append('filter[delivery_date_to_shipment_office_start_date]', deliveryDateToShipmentOfficeStartDate);
    if (deliveryDateToShipmentOfficeEndDate) queryParams.append('filter[delivery_date_to_shipment_office_end_date]', deliveryDateToShipmentOfficeEndDate);
    if (shippingProviderCustomerDeliveryDateStartDate) queryParams.append('filter[shipping_provider_customer_delivery_date_start_date]', shippingProviderCustomerDeliveryDateStartDate);
    if (shippingProviderCustomerDeliveryDateEndDate) queryParams.append('filter[shipping_provider_customer_delivery_date_end_date]', shippingProviderCustomerDeliveryDateEndDate);
    if (createdAtStartDate) queryParams.append('filter[created_at_start_date]', createdAtStartDate);
    if (createdAtEndDate) queryParams.append('filter[created_at_end_date]', createdAtEndDate);

    // Kargonomi API'den kargo listesini al
    const shipments = await kargonomiAPI.getShipments(queryParams.toString());
    
    return NextResponse.json({
      success: true,
      shipments,
      filters: {
        page,
        shippingWebserviceOrderId,
        shippingWebserviceTrackingCode,
        shippingProviderSlug,
        status,
        ecommerceProviderOrderNo,
        ecommerceProvider,
        packageCountMin,
        packageCountMax,
        estimatedPriceMin,
        estimatedPriceMax,
        realPriceMin,
        realPriceMax,
        extraShippingPriceMin,
        extraShippingPriceMax,
        buyerName,
        deliveryDateToShipmentOfficeStartDate,
        deliveryDateToShipmentOfficeEndDate,
        shippingProviderCustomerDeliveryDateStartDate,
        shippingProviderCustomerDeliveryDateEndDate,
        createdAtStartDate,
        createdAtEndDate
      }
    });
  } catch (error) {
    console.error('Kargonomi shipments error:', error);
    return NextResponse.json(
      { error: 'Kargo listesi alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Kargonomi API'ye kargo oluştur
    const result = await kargonomiAPI.createShipment(shipmentData);
    
    return NextResponse.json({
      success: true,
      message: 'Kargo başarıyla oluşturuldu',
      shipment: result
    });
  } catch (error) {
    console.error('Kargonomi shipment create error:', error);
    return NextResponse.json(
      { error: 'Kargo oluşturulamadı' },
      { status: 500 }
    );
  }
} 