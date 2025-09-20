import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '../../utils';

// POST: Sipariş iptal talebi
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }

  const { orderId, reason } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: 'Sipariş ID gerekli.' }, { status: 400 });
  }

  try {
    // Siparişin kullanıcıya ait olduğunu ve iptal edilebilir olduğunu kontrol et
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId, 
        userId,
        canCancel: true,
        status: { in: ['PENDING', 'CONFIRMED'] } // Sadece bekleyen ve onaylanmış siparişler iptal edilebilir
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı veya iptal edilemez.' }, { status: 404 });
    }

    // İptal talebini kaydet
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        cancelReason: reason,
        cancelRequestedAt: new Date(),
        status: 'CANCELLATION_REQUESTED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'İptal talebiniz alındı. En kısa sürede değerlendirilecek.',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Sipariş iptal hatası:', error);
    return NextResponse.json({ error: 'İptal talebi işlenirken hata oluştu.' }, { status: 500 });
  }
}
