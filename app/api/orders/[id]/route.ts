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

    console.log('🔍 Sipariş detayı aranıyor:', { orderId, userId });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true
          }
        },
        address: {
          select: {
            title: true,
            name: true,
            surname: true,
            city: true,
            district: true,
            neighborhood: true,
            address: true
          }
        }
      }
    });

    if (!order) {
      console.log('❌ Sipariş bulunamadı:', orderId);
      return NextResponse.json({ 
        error: 'Sipariş bulunamadı',
        message: 'Belirtilen sipariş numarası sistemde bulunamadı.'
      }, { status: 404 });
    }

    console.log('✅ Sipariş bulundu:', { 
      orderId: order.id, 
      status: order.status, 
      hasUser: !!order.userId,
      hasGuestEmail: !!order.guestEmail 
    });

    // Kullanıcı giriş yapmışsa kendi siparişi mi kontrol et
    if (userId && order.userId && order.userId !== userId) {
      console.log('❌ Yetkisiz erişim:', { userId, orderUserId: order.userId });
      return NextResponse.json({ 
        error: 'Bu siparişe erişim yetkiniz yok.',
        message: 'Bu sipariş başka bir hesaba ait.'
      }, { status: 403 });
    }

    // Guest siparişler için sadece sipariş ID'si ile erişime izin ver
    // (Güvenlik için e-posta doğrulaması eklenebilir)

    return NextResponse.json(order);
  } catch (error) {
    console.error('❌ Sipariş detay hatası:', error);
    return NextResponse.json({ 
      error: 'Sipariş detayı alınamadı.',
      message: 'Teknik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    }, { status: 500 });
  }
}
