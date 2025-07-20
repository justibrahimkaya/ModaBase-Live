import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '../../utils';

// POST: Sipariş iade talebi
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
    // Siparişin kullanıcıya ait olduğunu ve iade edilebilir olduğunu kontrol et
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId, 
        userId,
        canReturn: true,
        status: { in: ['DELIVERED'] } // Sadece teslim edilmiş siparişler iade edilebilir
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı veya iade edilemez.' }, { status: 404 });
    }

    // İade talebini kaydet
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        returnReason: reason,
        returnRequestedAt: new Date(),
        status: 'RETURN_REQUESTED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'İade talebiniz alındı. En kısa sürede değerlendirilecek.',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Sipariş iade hatası:', error);
    return NextResponse.json({ error: 'İade talebi işlenirken hata oluştu.' }, { status: 500 });
  }
}
