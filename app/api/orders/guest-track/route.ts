import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Guest order tracking
export async function POST(request: NextRequest) {
  const { orderId, guestEmail } = await request.json();

  if (!orderId || !guestEmail) {
    return NextResponse.json({ error: 'Sipariş numarası ve e-posta gereklidir.' }, { status: 400 });
  }

  try {
    // Order ID can be full or last 8 chars (for user-friendly input)
    let order;
    if (orderId.length === 8) {
      // Try to find by last 8 chars
      order = await prisma.order.findFirst({
        where: {
          id: { endsWith: orderId },
          guestEmail: guestEmail,
        },
        include: {
          items: { include: { product: true } },
          address: true,
        },
      });
    } else {
      // Try to find by full id
      order = await prisma.order.findFirst({
        where: {
          id: orderId,
          guestEmail: guestEmail,
        },
        include: {
          items: { include: { product: true } },
          address: true,
        },
      });
    }

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin.' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Sipariş sorgulanırken hata oluştu.' }, { status: 500 });
  }
}
