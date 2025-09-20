import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '../../utils';

// POST: Eski bir sepeti tekrar aktif yap
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }
  const body = await request.json();
  const { cartHistoryId } = body;

  // CartHistory ve ilişkili sepeti bul
  const cartHistory = await prisma.cartHistory.findUnique({
    where: { id: cartHistoryId },
    include: {
      cart: {
        include: { items: true }
      }
    }
  });
  if (!cartHistory || cartHistory.userId !== userId) {
    return NextResponse.json({ error: 'Sepet geçmişi bulunamadı.' }, { status: 404 });
  }

  // Kullanıcının mevcut aktif sepetini arşivle
  await prisma.cart.updateMany({
    where: { userId, isArchived: false },
    data: { isArchived: true }
  });

  // Yeni aktif sepet oluştur
  const newCart = await prisma.cart.create({ data: { userId } });

  // Eski sepetin ürünlerini yeni sepete kopyala
  const items = cartHistory.cart.items;
  for (const item of items) {
    await prisma.cartItem.create({
      data: {
        cartId: newCart.id,
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }
    });
  }

  // Yeni sepeti detaylı şekilde döndür
  const result = await prisma.cart.findUnique({
    where: { id: newCart.id },
    include: {
      items: { include: { product: true } }
    }
  });

  return NextResponse.json(result);
}
