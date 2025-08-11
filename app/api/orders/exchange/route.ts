import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '../../utils';

// POST: Sipariş değişim talebi
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }

  const { orderId, reason, newProductId, newSize, newColor } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: 'Sipariş ID gerekli.' }, { status: 400 });
  }

  try {
    // Siparişin kullanıcıya ait olduğunu ve değişim yapılabilir olduğunu kontrol et
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId, 
        userId,
        canExchange: true,
        status: { in: ['DELIVERED'] } // Sadece teslim edilmiş siparişler değişim yapılabilir
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı veya değişim yapılamaz.' }, { status: 404 });
    }

    // Değişim talebini kaydet
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        exchangeReason: reason,
        exchangeRequestedAt: new Date(),
        status: 'EXCHANGE_REQUESTED',
        adminNotes: `Değişim talebi: ${reason}${newProductId ? ` - Yeni ürün: ${newProductId}` : ''}${newSize ? ` - Yeni beden: ${newSize}` : ''}${newColor ? ` - Yeni renk: ${newColor}` : ''}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Değişim talebiniz alındı. En kısa sürede değerlendirilecek.',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Sipariş değişim hatası:', error);
    return NextResponse.json({ error: 'Değişim talebi işlenirken hata oluştu.' }, { status: 500 });
  }
}
