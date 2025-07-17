import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '../../utils';

// POST: Mevcut sepeti arşivle
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }
  const body = await request.json();
  const { name } = body;

  // Kullanıcının aktif sepetini bul
  const cart = await prisma.cart.findFirst({ where: { userId, isArchived: false } });
  if (!cart) {
    return NextResponse.json({ error: 'Aktif sepet bulunamadı.' }, { status: 404 });
  }

  // Sepeti arşivle
  await prisma.cart.update({
    where: { id: cart.id },
    data: { isArchived: true }
  });

  // CartHistory kaydı oluştur
  const cartHistory = await prisma.cartHistory.create({
    data: {
      userId,
      cartId: cart.id,
      name: name || 'Sepetim',
    },
    include: {
      cart: {
        include: {
          items: { include: { product: true } }
        }
      }
    }
  });

  return NextResponse.json(cartHistory);
}
