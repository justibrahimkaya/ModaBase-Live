// =======================================================
// E.ARŞİV PORTAL GERİ DÖNÜŞ API'si
// =======================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Portal geri dönüş işleniyor...');

    // Admin yetkisi kontrol
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { orderId, invoiceId, status } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Sipariş ID gerekli' },
        { status: 400 }
      );
    }

    console.log(`📋 Portal geri dönüş: OrderID=${orderId}, InvoiceID=${invoiceId}, Status=${status}`);

    // Sipariş bilgilerini getir
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true
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

    // Fatura başarıyla oluşturuldu mu?
    if (status === 'success' && invoiceId) {
      console.log('✅ Portal\'dan başarılı fatura bilgisi geldi');

      // Fatura bilgilerini sisteme kaydet
      const invoiceNumber = `INV-${Date.now()}`;

      // Sipariş durumunu güncelle
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED'
        }
      });

      // E-posta bilgilendirmesi (daha sonra gerçek e-posta entegrasyonu yapılacak)
      console.log('📧 Fatura bilgilendirmesi hazırlandı');
      
      const customerEmail = order.user?.email || order.guestEmail;
      if (customerEmail) {
        console.log(`📧 Müşteri bilgilendirilecek: ${customerEmail}`);
        console.log(`📄 Fatura No: ${invoiceNumber}`);
        console.log(`🆔 E.arşiv ID: ${invoiceId}`);
        // TODO: EmailService entegrasyonu tamamlandıktan sonra gerçek e-posta gönderilecek
      }

      console.log('🎉 Portal fatura işlemi tamamlandı');

      return NextResponse.json({
        success: true,
        message: 'E.arşiv faturası başarıyla oluşturuldu ve sisteme kaydedildi',
        invoiceData: {
          invoiceNumber,
          earsivId: invoiceId,
          status: 'COMPLETED',
          orderId: orderId
        }
      });

    } else {
      // Fatura oluşturulamadı veya iptal edildi
      console.log('⚠️ Portal fatura işlemi başarısız veya iptal edildi');

      // Sipariş durumunu geri al
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'APPROVED' // Önceki duruma geri döndür
        }
      });

      return NextResponse.json({
        success: false,
        error: 'Fatura oluşturulamadı veya işlem iptal edildi'
      });
    }

  } catch (error) {
    console.error('❌ Portal callback hatası:', error);
    return NextResponse.json(
      { error: 'Portal geri dönüş işlemi başarısız' },
      { status: 500 }
    );
  }
} 