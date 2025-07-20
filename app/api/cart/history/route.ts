import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '../../utils';

// GET: Kullanıcının sepet geçmişini getir
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }

  // Kullanıcının arşivlenmiş sepetlerini getir
  const cartHistories = await prisma.cartHistory.findMany({
    where: { userId },
    include: {
      cart: {
        include: {
          items: {
            include: { product: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(cartHistories);
}
