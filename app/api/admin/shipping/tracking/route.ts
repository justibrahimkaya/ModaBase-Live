import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/adminAuth';
import { EmailService } from '@/lib/emailService';

// Kargo takip durumlarını güncelle
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, trackingNumber, shippingCompany, shippingTrackingUrl } = await request.json();

    if (!orderId || !trackingNumber || !shippingCompany) {
      return NextResponse.json({ 
        error: 'Sipariş ID, takip numarası ve kargo firması gerekli' 
      }, { status: 400 });
    }

    // Siparişi güncelle
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber,
        shippingCompany,
        shippingTrackingUrl,
        status: 'SHIPPED',
        shippedAt: new Date()
      },
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

    // Müşteriye kargo bildirimi gönder
    const customerEmail = updatedOrder.user?.email || updatedOrder.guestEmail;
    const customerName = updatedOrder.user 
      ? `${updatedOrder.user.name} ${updatedOrder.user.surname}`
      : updatedOrder.guestName && updatedOrder.guestSurname 
        ? `${updatedOrder.guestName} ${updatedOrder.guestSurname}`
        : 'Değerli Müşterimiz';

    if (customerEmail) {
      try {
        // Email servisini başlat
        EmailService.initialize({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
            pass: process.env.SMTP_PASS || 'yqarfkyevahfnenq'
          }
        });

        await EmailService.sendShippingNotification({
          to: customerEmail,
          customerName,
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.id.slice(-8),
          trackingNumber,
          shippingCompany,
          shippingTrackingUrl,
          items: updatedOrder.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          }))
        });

        console.log(`Kargo bildirimi gönderildi: ${customerEmail} - ${trackingNumber}`);
      } catch (emailError) {
        console.error('Kargo bildirimi gönderme hatası:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Kargo bilgileri güncellendi ve müşteriye bildirim gönderildi',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Kargo takip güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kargo bilgileri güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Kargo durumunu otomatik kontrol et (cron job için)
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kargoda olan siparişleri al
    const shippedOrders = await prisma.order.findMany({
      where: {
        status: 'SHIPPED',
        trackingNumber: { not: null },
        shippingCompany: { not: null },
        deliveredAt: null // Henüz teslim edilmemiş
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    const updatedOrders = [];

    for (const order of shippedOrders) {
      try {
        // Kargo firması API'sinden durum kontrolü
        const trackingStatus = await checkTrackingStatus(
          order.shippingCompany!,
          order.trackingNumber!
        );

        if (!trackingStatus) {
          console.error(`Kargo takip durumu alınamadı - Sipariş ${order.id}`);
          continue;
        }

        if (trackingStatus.status === 'DELIVERED' && order.status !== 'DELIVERED') {
          // Teslim edildi olarak güncelle
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'DELIVERED',
              deliveredAt: new Date(),
              adminNotes: `Otomatik güncelleme: ${trackingStatus.description}`
            }
          });

          // Müşteriye teslim bildirimi gönder
          const customerEmail = order.user?.email || order.guestEmail;
          const customerName = order.user 
            ? `${order.user.name} ${order.user.surname}`
            : 'Değerli Müşterimiz';

          if (customerEmail) {
            try {
              // Email servisini başlat
              EmailService.initialize({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: false,
                auth: {
                  user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
                  pass: process.env.SMTP_PASS || 'yqarfkyevahfnenq'
                }
              });

              await EmailService.sendDeliveryNotification({
                to: customerEmail,
                customerName,
                orderId: order.id,
                orderNumber: order.id.slice(-8),
                trackingNumber: order.trackingNumber!,
                shippingCompany: order.shippingCompany!,
                items: order.items.map(item => ({
                  name: item.product.name,
                  quantity: item.quantity,
                  price: item.price
                }))
              });

              console.log(`Teslim bildirimi gönderildi: ${customerEmail}`);
            } catch (emailError) {
              console.error('Teslim bildirimi gönderme hatası:', emailError);
            }
          }

          updatedOrders.push({
            orderId: order.id,
            status: 'DELIVERED',
            message: 'Sipariş teslim edildi'
          });
        } else if (trackingStatus.status !== order.status) {
          // Durum güncellemesi
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: trackingStatus.status,
              adminNotes: `Otomatik güncelleme: ${trackingStatus.description}`
            }
          });

          updatedOrders.push({
            orderId: order.id,
            status: trackingStatus.status,
            message: trackingStatus.description
          });
        }

      } catch (error) {
        console.error(`Kargo takip hatası - Sipariş ${order.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updatedOrders.length} sipariş güncellendi`,
      updatedOrders
    });

  } catch (error) {
    console.error('Kargo takip kontrol hatası:', error);
    return NextResponse.json(
      { error: 'Kargo takip kontrolü sırasında hata oluştu' },
      { status: 500 }
    );
  }
}

// Kargo firması API'sinden durum kontrolü (mock)
async function checkTrackingStatus(_shippingCompany: string, trackingNumber: string) {
  // Gerçek uygulamada kargo firması API'sine bağlanılacak
  // Şimdilik mock response döndürüyoruz
  
  const mockStatuses = [
    { status: 'IN_TRANSIT', description: 'Kargoda - Transit' },
    { status: 'OUT_FOR_DELIVERY', description: 'Kargoda - Dağıtımda' },
    { status: 'DELIVERED', description: 'Teslim Edildi' },
    { status: 'SHIPPED', description: 'Kargoya Verildi' }
  ];

  // Tracking number'a göre rastgele durum seç
  const randomIndex = trackingNumber.charCodeAt(trackingNumber.length - 1) % mockStatuses.length;
  
  // %20 ihtimalle teslim edildi olarak işaretle
  if (Math.random() < 0.2) {
    return { status: 'DELIVERED', description: 'Teslim Edildi' };
  }

  return mockStatuses[randomIndex];
} 