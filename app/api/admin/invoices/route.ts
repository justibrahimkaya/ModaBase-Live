import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/adminAuth';
import { InvoiceService } from '@/lib/invoiceService';
import { EmailService } from '@/lib/emailService';
import { EarsivService } from '@/lib/earsiv/earsivService';

export const dynamic = 'force-dynamic'

// GET: Tüm faturaları listele
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Tüm siparişleri getir (e-fatura durumu önemli değil)
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Fatura listesi hatası:', error);
    return NextResponse.json({ error: 'Fatura listesi alınamadı' }, { status: 500 });
  }
}

// POST: Manuel e-fatura oluştur
export async function POST(request: NextRequest) {
  try {
    console.log('🏭 Manuel e-fatura oluşturma başlatıldı...');
    
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      console.log('❌ Yetkisiz erişim');
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { orderId } = await request.json();
    console.log('📋 Order ID:', orderId);

    if (!orderId) {
      console.log('❌ Sipariş ID eksik');
      return NextResponse.json({ error: 'Sipariş ID gerekli' }, { status: 400 });
    }

    // Siparişi bul
    console.log('🔍 Sipariş aranıyor...');
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        address: true // ✅ Address'i de dahil et
      }
    });

    if (!order) {
      console.log('❌ Sipariş bulunamadı:', orderId);
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    console.log('✅ Sipariş bulundu:', {
      id: order.id,
      total: order.total,
      itemCount: order.items.length,
      customerName: order.user?.name || order.guestName
    });

    // Şirket bilgileri
    const companyInfo = {
              name: 'Modahan İbrahim Kaya - ModaBase E-Ticaret',
              address: 'Malkoçoğlu Mah. 305/1 Sok. No: 17/A, Sultangazi/İstanbul/Türkiye',
              phone: '+90 536 297 12 55',
                    email: 'info@modabase.com.tr',
      taxNumber: '1234567890',
      taxOffice: 'İstanbul Vergi Dairesi'
    };

    // HİBRİT FATURA OLUŞTUR (PDF + E.ARŞİV)
    console.log('🔄 Hibrit fatura oluşturuluyor (PDF + E.arşiv test)...');
    
    // 1. PDF Fatura oluştur (mevcut sistem)
    console.log('📄 PDF fatura oluşturuluyor...');
    const invoiceData = {
      order,
      companyInfo
    };

    const { filePath, fileName } = await InvoiceService.generateInvoicePDF(invoiceData);
    console.log('✅ PDF oluşturuldu:', fileName);

    // 2. E.arşiv GERÇEK BİLGİLERLE TEST faturası oluştur (paralel)
    try {
      console.log('🎯 E.arşiv gerçek bilgilerle test faturası oluşturuluyor...');

      // Sipariş bilgilerini E-arşiv formatında hazırla
      const earsivInvoiceData = {
        order: {
          id: order.id,
          total: order.total,
          shippingCost: order.shippingCost || 0,
          items: order.items.map(item => ({
            product: { 
              name: item.product?.name || 'Ürün',
              taxRate: item.taxRate || item.product?.taxRate || 10 
            },
            quantity: item.quantity,
            price: item.price,
            taxRate: item.taxRate || item.product?.taxRate || 10
          })),
          user: order.user,
          guestName: order.guestName,
          guestEmail: order.guestEmail,
          address: order.address,
          paymentMethod: order.paymentMethod || 'Diğer'
        },
        companyInfo: companyInfo,
        invoiceNumber: 'RTS' + Date.now(),
        invoiceDate: new Date(),
        isTest: true
      };

      // Gerçek bilgilerle test faturası oluştur
      const earsivResult = await EarsivService.createHybridInvoice(earsivInvoiceData);
      
      if (earsivResult.success) {
        console.log('✅ E.arşiv test faturası başarılı:', {
          invoiceId: earsivResult.invoiceId,
          invoiceUuid: earsivResult.invoiceUuid,
          isTest: earsivResult.isTest
        });
      } else {
        console.log('⚠️ E.arşiv test faturası başarısız:', earsivResult.error);
        console.log('   PDF fatura normal şekilde devam ediyor...');
      }
      
    } catch (earsivError) {
      console.error('❌ E.arşiv test hatası:', earsivError);
      console.log('   PDF fatura normal şekilde devam ediyor...');
    }

    // E-posta gönder
    const customerEmail = order.user?.email || order.guestEmail;
    const customerName = order.user?.name || order.guestName || 'Müşteri';

    if (customerEmail) {
      // E-posta servisini başlat - Email değişkenleri de destekleniyor
      EmailService.initialize({
        host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER || 'kavram.triko@gmail.com',
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'yqarfkyevahfnenq'
        }
      });

      // E-fatura e-postası gönder
      await EmailService.sendInvoiceEmail({
        to: customerEmail,
        customerName,
        orderNumber: order.id,
        invoiceNumber: fileName.replace('.pdf', ''),
        pdfPath: filePath,
        totalAmount: order.total
      });
    }

    // Order'a PDF URL'ini kaydet
    await prisma.order.update({
      where: { id: orderId },
      data: {
        einvoicePdfUrl: `/invoices/${fileName}`,
        einvoiceStatus: 'SUCCESS'
      }
    });

    console.log('🎉 E-fatura işlemi tamamlandı:', fileName);
    
    return NextResponse.json({ 
      success: true, 
      message: 'E-fatura başarıyla oluşturuldu',
      fileName,
      filePath: `/invoices/${fileName}`,
      orderId: order.id,
      orderNumber: order.id.slice(-8)
    });

  } catch (error) {
    console.error('Manuel e-fatura oluşturma hatası:', error);
    return NextResponse.json({ error: 'E-fatura oluşturulamadı' }, { status: 500 });
  }
}
