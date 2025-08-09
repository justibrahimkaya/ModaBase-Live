import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/emailService';

// PayTR Konfigürasyonu (fallback KULLANMA!)
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || '';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || '';

export async function POST(request: NextRequest) {
  // PayTR notification için rate limiting tamamen devre dışı
  console.log('🔄 PayTR notification başlatıldı - Rate limiting devre dışı');
  
  try {
    // Env kontrolü
    if (!PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
      console.error('❌ PayTR credentials not set on server (KEY/SALT)');
      return new NextResponse('Server credentials missing', { status: 500 });
    }

    // PayTR, content-type olarak application/x-www-form-urlencoded gönderir
    // Hem urlencoded hem multipart formları destekle
    const contentType = request.headers.get('content-type') || '';
    let merchant_oid = '' as string;
    let status = '' as string;
    let total_amount = '' as string;
    let hash = '' as string;
    let payment_type = '' as string;
    let failed_reason_msg = '' as string;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      merchant_oid = params.get('merchant_oid') || '';
      status = params.get('status') || '';
      total_amount = params.get('total_amount') || '';
      hash = params.get('hash') || '';
      payment_type = params.get('payment_type') || '';
      failed_reason_msg = params.get('failed_reason_msg') || '';
    } else {
      const formData = await request.formData();
      merchant_oid = (formData.get('merchant_oid') as string) || '';
      status = (formData.get('status') as string) || '';
      total_amount = (formData.get('total_amount') as string) || '';
      hash = (formData.get('hash') as string) || '';
      payment_type = (formData.get('payment_type') as string) || '';
      failed_reason_msg = (formData.get('failed_reason_msg') as string) || '';
    }
    
    // Basit doğrulama
    if (!merchant_oid || !status || !total_amount || !hash) {
      console.error('❌ PayTR notification missing fields');
      return new NextResponse('Bad Request', { status: 400 });
    }

    // Hash doğrulama - PayTR resmi formülü
    const hashStr = `${merchant_oid}${PAYTR_MERCHANT_SALT}${status}${total_amount}`;
    const calculatedHash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashStr).digest('base64');

    if (hash !== calculatedHash) {
      console.error('PayTR hash verification failed');
      return new NextResponse('Hash verification failed', { status: 400 });
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

            // PayTR sadece "OK" bekliyor, JSON değil!
        return new NextResponse('OK', {
          status: 200,
          headers: {
            'Content-Type': 'text/plain'
          }
        });

  } catch (error) {
    console.error('PayTR notification error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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
