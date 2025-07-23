import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/emailService';

// PayTR Konfigürasyonu
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'srMxKnSgipN1Z1Td';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'TzXLtjFSuyDPsi8B';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // PayTR'den gelen parametreler
    const merchant_oid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const total_amount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;
    const payment_type = formData.get('payment_type') as string;
    const failed_reason_msg = formData.get('failed_reason_msg') as string;

    // Hash doğrulama
    const hashStr = `${PAYTR_MERCHANT_SALT}${merchant_oid}${status}${total_amount}`;
    const calculatedHash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashStr).digest('base64');

    if (hash !== calculatedHash) {
      console.error('PayTR hash verification failed');
      return NextResponse.json({ status: 'error', message: 'Hash verification failed' }, { status: 400 });
    }

    // Siparişi veritabanından bul
    const order = await prisma.order.findUnique({
      where: { id: merchant_oid },
      include: { items: true }
    });

    if (!order) {
      console.error('Order not found:', merchant_oid);
      return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 });
    }

    // Ödeme durumunu güncelle
    let orderStatus = 'PENDING';

    if (status === 'success') {
      orderStatus = 'PAID';
      
      // Stok güncelleme ve hareket kaydet
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            orderId: order.id,
            type: 'OUT',
            quantity: item.quantity,
            description: `PayTR ödeme başarılı - Sipariş #${order.id} için stok düşüldü`
          }
        });
      }

      // İşletme hesabına transfer işlemi
      try {
        await processBusinessTransfer(order);
      } catch (transferError) {
        console.error('Transfer işlemi hatası:', transferError);
        // Transfer hatası siparişi etkilemesin, sadece log
      }
    } else {
      orderStatus = 'FAILED';
    }

    // Siparişi güncelle
    const updatedOrder = await prisma.order.update({
      where: { id: merchant_oid },
      data: {
        status: orderStatus,
        paymentMethod: payment_type,
        adminNotes: status === 'success' 
          ? 'Ödeme başarılı - PayTR - İşletme hesabına transfer yapıldı' 
          : `Ödeme başarısız - ${failed_reason_msg || 'Bilinmeyen hata'}`
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

    console.log(`PayTR notification processed: ${merchant_oid} - ${status}`);

    // Ödeme başarılıysa işletme paneline bildirim gönder
    if (status === 'success') {
      try {
        console.log('📧 Ödeme başarılı - İşletme paneline bildirim gönderiliyor...')
        
        // İşletme hesabını bul
        const business = await prisma.business.findUnique({
          where: { email: 'mbmodabase@gmail.com' },
          select: {
            id: true,
            businessName: true,
            contactEmail: true
          }
        });

        if (business && business.contactEmail) {
          EmailService.initialize({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
              pass: process.env.SMTP_PASS || 'yqarfkyevahfnenq'
            }
          });

          const customerName = updatedOrder.user ? `${updatedOrder.user.name} ${updatedOrder.user.surname}` : 
                              updatedOrder.guestName && updatedOrder.guestSurname ? `${updatedOrder.guestName} ${updatedOrder.guestSurname}` : 
                              'Misafir Müşteri';

          await EmailService.sendPaymentSuccessNotification({
            to: business.contactEmail,
            businessName: business.businessName,
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.id.slice(-8),
            customerName,
            customerEmail: updatedOrder.user?.email || updatedOrder.guestEmail || 'E-posta yok',
            totalAmount: updatedOrder.total,
            paymentMethod: updatedOrder.paymentMethod || 'Belirtilmemiş',
            items: updatedOrder.items.map(item => ({
              name: item.product?.name || 'Ürün',
              quantity: item.quantity,
              price: item.price
            }))
          });

          console.log('✅ Ödeme başarılı bildirimi gönderildi')
        }
      } catch (notificationError) {
        console.error('❌ Ödeme bildirimi hatası:', notificationError)
        // Bildirim hatası ödeme işlemini etkilemesin
      }
    }

    return NextResponse.json({ status: 'OK' });

  } catch (error) {
    console.error('PayTR notification error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Notification processing failed' 
    }, { status: 500 });
  }
}

// İşletme hesabına transfer işlemi
async function processBusinessTransfer(order: any) {
  try {
    // İşletme hesabını bul (ModaBase hesabı)
    const business = await prisma.business.findUnique({
      where: { email: 'mbmodabase@gmail.com' },
      select: {
        id: true,
        businessName: true,
        contactEmail: true,
        ibanNumber: true,
        accountHolderName: true,
        bankName: true
      }
    });

    if (!business) {
      console.error('İşletme hesabı bulunamadı');
      return;
    }

    if (!business.ibanNumber) {
      console.error('İşletme IBAN bilgisi eksik');
      return;
    }

    // Transfer bilgilerini log'a kaydet
    console.log('💰 Transfer Kaydı:');
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Business ID: ${business.id}`);
    console.log(`   Amount: ${order.total} TL`);
    console.log(`   IBAN: ${business.ibanNumber}`);
    console.log(`   Account Holder: ${business.accountHolderName || 'Belirtilmemiş'}`);
    console.log(`   Bank: ${business.bankName || 'Belirtilmemiş'}`);
    console.log(`   Status: PENDING`);
    console.log(`   Date: ${new Date().toISOString()}`);
    console.log(`   Description: Sipariş #${order.id} için transfer`);

    console.log('💰 İşletme hesabına transfer işlemi:');
    console.log(`   Sipariş ID: ${order.id}`);
    console.log(`   Tutar: ${order.total} TL`);
    console.log(`   IBAN: ${business.ibanNumber}`);
    console.log(`   Hesap Sahibi: ${business.accountHolderName || 'Belirtilmemiş'}`);
    console.log(`   Banka: ${business.bankName || 'Belirtilmemiş'}`);

    // Transfer bildirimi e-postası gönder
    try {
      EmailService.initialize({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
          pass: process.env.SMTP_PASS || 'yqarfkyevahfnenq'
        }
      });

      // İşletme sahibine transfer bildirimi
      await EmailService.sendTransferNotification({
        to: business.contactEmail,
        businessName: business.businessName,
        orderId: order.id,
        amount: order.total,
        iban: business.ibanNumber,
        accountHolder: business.accountHolderName || 'Belirtilmemiş',
        bankName: business.bankName || 'Belirtilmemiş'
      });

      console.log('✅ Transfer bildirimi e-postası gönderildi');

    } catch (emailError) {
      console.error('Transfer bildirimi e-postası hatası:', emailError);
    }

    // TODO: Gerçek banka API entegrasyonu burada yapılacak
    // Şu anda sadece kayıt ve bildirim yapılıyor
    console.log('⚠️  Gerçek transfer işlemi için banka API entegrasyonu gerekli');

  } catch (error) {
    console.error('Transfer işlemi hatası:', error);
    throw error;
  }
}
