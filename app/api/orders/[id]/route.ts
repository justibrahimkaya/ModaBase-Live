import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '../../utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const orderId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        address: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 });
    }

    // Kullanıcının kendi siparişi mi kontrol et
    if (order.userId && order.userId !== userId) {
      return NextResponse.json({ error: 'Bu siparişe erişim yetkiniz yok.' }, { status: 403 });
    }

    // Guest siparişler için e-posta kontrolü
    if (!order.userId && order.guestEmail) {
      // Guest siparişler için e-posta doğrulama yapılabilir
      // Şimdilik sadece sipariş ID'si ile erişime izin veriyoruz
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Sipariş detay hatası:', error);
    return NextResponse.json({ error: 'Sipariş detayı alınamadı.' }, { status: 500 });
  }
}
