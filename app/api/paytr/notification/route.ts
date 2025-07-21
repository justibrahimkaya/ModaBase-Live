import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// PayTR Konfigürasyonu
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'srMxKnSgipN1Z1Td';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'TzXLtjFSuyDPsi8B';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // PayTR'den gelen parametreler
    const merchant_oid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const total_amount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;
    const payment_type = formData.get('payment_type') as string;
    const failed_reason_msg = formData.get('failed_reason_msg') as string;

    // Hash doğrulama
    const hashStr = `${PAYTR_MERCHANT_SALT}${merchant_oid}${status}${total_amount}`;
    const calculatedHash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashStr).digest('base64');

    if (hash !== calculatedHash) {
      console.error('PayTR hash verification failed');
      return NextResponse.json({ status: 'error', message: 'Hash verification failed' }, { status: 400 });
    }

    // Siparişi veritabanından bul
    const order = await prisma.order.findUnique({
      where: { id: merchant_oid },
      include: { items: true }
    });

    if (!order) {
      console.error('Order not found:', merchant_oid);
      return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 });
    }

    // Ödeme durumunu güncelle
    let orderStatus = 'PENDING';

    if (status === 'success') {
      orderStatus = 'PAID';
      
      // Stok güncelleme
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
    } else {
      orderStatus = 'FAILED';
    }

    // Siparişi güncelle
    await prisma.order.update({
      where: { id: merchant_oid },
      data: {
        status: orderStatus,
        paymentMethod: payment_type,
        adminNotes: status === 'success' 
          ? 'Ödeme başarılı - PayTR' 
          : `Ödeme başarısız - ${failed_reason_msg || 'Bilinmeyen hata'}`
      }
    });

    console.log(`PayTR notification processed: ${merchant_oid} - ${status}`);

    return NextResponse.json({ status: 'OK' });

  } catch (error) {
    console.error('PayTR notification error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Notification processing failed' 
    }, { status: 500 });
  }
} 