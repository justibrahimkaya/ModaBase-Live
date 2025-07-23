import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Havale bildirimi alınıyor...')
    
    let body;
    try {
      body = await request.json();
      console.log('📋 Request body:', body)
    } catch (parseError) {
      console.error('❌ JSON parse hatası:', parseError)
      return NextResponse.json({ 
        success: false, 
        error: 'Geçersiz JSON verisi' 
      }, { status: 400 });
    }
    
    const { orderId, customerName, customerEmail, customerPhone, transferAmount, transferDate, transferNote } = body;

    // Gerekli alanları kontrol et
    if (!orderId || !customerName || !customerEmail || !customerPhone || !transferAmount) {
      console.error('❌ Eksik alanlar:', { orderId, customerName, customerEmail, customerPhone, transferAmount })
      return NextResponse.json({ 
        success: false, 
        error: 'Eksik bilgiler: Sipariş ID, müşteri bilgileri ve tutar gereklidir' 
      }, { status: 400 });
    }

    // Siparişi kontrol et
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sipariş bulunamadı' 
      }, { status: 404 });
    }

    // İşletme hesabını al
    const business = await prisma.business.findUnique({
      where: { email: 'mbmodabase@gmail.com' },
      select: {
        id: true,
        businessName: true,
        contactEmail: true,
        ibanNumber: true,
        accountHolderName: true,
        bankName: true,
        bankBranch: true
      }
    });

    if (!business || !business.ibanNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'İşletme banka bilgileri eksik' 
      }, { status: 500 });
    }

    // Havale bildirimi kaydı oluştur
    const transferNotification = await prisma.transferNotification.create({
      data: {
        orderId: orderId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        transferAmount: transferAmount,
        transferDate: new Date(transferDate),
        transferNote: transferNote,
        status: 'PENDING', // Onay bekliyor
        businessId: business.id,
        iban: business.ibanNumber,
        accountHolder: business.accountHolderName || 'Belirtilmemiş',
        bankName: business.bankName || 'Belirtilmemiş'
      }
    });

    // Müşteriye havale bilgilerini e-posta ile gönder
    try {
      EmailService.initialize({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'info@modabase.com.tr',
          pass: process.env.SMTP_PASS || 'password'
        }
      });

      await EmailService.sendBankTransferInstructions({
        to: customerEmail,
        customerName: customerName,
        orderId: orderId,
        amount: transferAmount,
        iban: business.ibanNumber,
        accountHolder: business.accountHolderName || 'Belirtilmemiş',
        bankName: business.bankName || 'Belirtilmemiş',
        bankBranch: business.bankBranch || 'Belirtilmemiş',
        transferNote: transferNote
      });

    } catch (emailError) {
      console.error('Havale bilgileri e-postası gönderme hatası:', emailError);
    }

    // İşletme sahibine havale bildirimi gönder
    try {
      await EmailService.sendTransferNotification({
        to: business.contactEmail,
        businessName: business.businessName,
        orderId: orderId,
        amount: transferAmount,
        iban: business.ibanNumber,
        accountHolder: business.accountHolderName || 'Belirtilmemiş',
        bankName: business.bankName || 'Belirtilmemiş'
      });
    } catch (emailError) {
      console.error('İşletme bildirimi e-postası hatası:', emailError);
    }

    // Sipariş durumunu güncelle
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'AWAITING_PAYMENT',
        paymentMethod: 'BANK_TRANSFER',
        adminNotes: `Havale bekleniyor - Müşteri: ${customerName}, Tutar: ${transferAmount} TL, Tarih: ${transferDate}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Havale bildirimi başarıyla alındı',
      transferId: transferNotification.id,
      bankInfo: {
        iban: business.ibanNumber,
        accountHolder: business.accountHolderName,
        bankName: business.bankName,
        bankBranch: business.bankBranch
      }
    });

  } catch (error) {
    console.error('Havale bildirimi hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Havale bildirimi işlenirken hata oluştu' 
    }, { status: 500 });
  }
}

// Havale onaylama (admin tarafından)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transferId, status, adminNote } = body;

    const transfer = await prisma.transferNotification.findUnique({
      where: { id: transferId },
      include: { order: true }
    });

    if (!transfer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Havale bildirimi bulunamadı' 
      }, { status: 404 });
    }

    // Havale durumunu güncelle
    await prisma.transferNotification.update({
      where: { id: transferId },
      data: {
        status: status, // CONFIRMED veya REJECTED
        adminNote: adminNote,
        confirmedAt: status === 'CONFIRMED' ? new Date() : null
      }
    });

    // Sipariş durumunu güncelle
    if (status === 'CONFIRMED') {
      await prisma.order.update({
        where: { id: transfer.orderId },
        data: {
          status: 'PAID',
          adminNotes: `Havale onaylandı - ${adminNote || 'Admin onayı'}`
        }
      });

      // Stok güncelle
      const order = await prisma.order.findUnique({
        where: { id: transfer.orderId },
        include: { items: true }
      });

      if (order) {
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Havale ${status === 'CONFIRMED' ? 'onaylandı' : 'reddedildi'}`
    });

  } catch (error) {
    console.error('Havale onaylama hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Havale onaylama işlenirken hata oluştu' 
    }, { status: 500 });
  }
}
