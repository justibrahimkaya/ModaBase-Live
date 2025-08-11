// =======================================================
// E.ARŞİV PORTAL YÖNLENDİRME API'si
// =======================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/adminAuth';
import { REAL_COMPANY_INFO } from '@/lib/earsiv/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🌐 E.arşiv portal yönlendirme hazırlanıyor...');

    // Admin yetkisi kontrol
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Sipariş ID gerekli' },
        { status: 400 }
      );
    }

    // Sipariş bilgilerini getir
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    console.log(`📋 Sipariş hazırlanıyor: ${order.id}`);

    // Portal için callback URL oluştur
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/invoices/callback?orderId=${orderId}`;
    
    // Portal session'u kaydet (fatura oluştuktan sonra takip için)
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'INVOICE_PENDING' // Fatura beklemede
      }
    });

    // Portal URL'ini oluştur (✅ Gerçek e.arşiv portal URL'i)
    const portalUrl = 'https://earsivportal.efatura.gov.tr/intragiris.html';
    
    // Müşteri bilgilerini hazırla
    const customerInfo = {
      name: order.user?.name || order.guestName || 'Bireysel Müşteri',
      email: order.user?.email || order.guestEmail || '',
      phone: order.user?.phone || order.guestPhone || '',
      address: order.address ? {
        street: order.address.address || '',
        district: order.address.district || '',
        city: order.address.city || ''
      } : null
    };

    // Ürün bilgilerini hazırla
    const items = order.items.map(item => ({
      name: item.product?.name || 'Ürün',
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
      taxRate: 10 // Tekstil için %10 (database güncellenince dinamik olacak)
    }));

    // Kargo ücretini ayrı kalem olarak ekle (varsa)
    if (order.shippingCost && order.shippingCost > 0) {
      items.push({
        name: `Kargo Hizmeti (${order.shippingMethod || 'Standart'})`,
        quantity: 1,
        unitPrice: order.shippingCost,
        total: order.shippingCost,
        taxRate: 10 // Kargo hizmeti de %10 KDV
      });
    }

    // Toplam tutar kontrolü ve otomatik düzeltme
    const calculatedTotal = items.reduce((sum, item) => sum + item.total, 0);
    const difference = order.total - calculatedTotal;
    
    if (Math.abs(difference) > 0.01) { // 1 kuruştan fazla fark varsa
      items.push({
        name: difference > 0 ? 'Hizmet Bedeli' : 'İndirim',
        quantity: 1,
        unitPrice: Math.abs(difference),
        total: Math.abs(difference),
        taxRate: 10
      });
      console.log(`⚖️ Fark düzeltmesi: ${difference.toFixed(2)} TL`);
    }

    console.log('✅ Portal yönlendirme hazırlandı');

    return NextResponse.json({
      success: true,
      redirectData: {
        portalUrl,
        callbackUrl,
        orderInfo: {
          orderId: order.id,
          orderDate: order.createdAt,
          total: order.total,
          customerInfo,
          items,
          companyInfo: REAL_COMPANY_INFO
        }
      }
    });

  } catch (error) {
    console.error('❌ Portal yönlendirme hatası:', error);
    return NextResponse.json(
      { error: 'Portal yönlendirme hazırlanamadı' },
      { status: 500 }
    );
  }
} 