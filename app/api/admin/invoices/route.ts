import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/adminAuth';
import { InvoiceService } from '@/lib/invoiceService';
import { EmailService } from '@/lib/emailService';

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
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Sipariş ID gerekli' }, { status: 400 });
    }

    // Siparişi bul
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    // Şirket bilgileri
    const companyInfo = {
              name: 'Modahan İbrahim Kaya - ModaBase E-Ticaret',
              address: 'Malkoçoğlu Mah. 305/1 Sok. No: 17/A, Sultangazi/İstanbul/Türkiye',
              phone: '+90 536 297 12 55',
                    email: 'info@modabase.com.tr',
      taxNumber: '1234567890',
      taxOffice: 'İstanbul Vergi Dairesi'
    };

    // PDF E-Fatura oluştur
    const invoiceData = {
      order,
      companyInfo
    };

    const { filePath, fileName } = await InvoiceService.generateInvoicePDF(invoiceData);

    // E-posta gönder
    const customerEmail = order.user?.email || order.guestEmail;
    const customerName = order.user?.name || order.guestName || 'Müşteri';

    if (customerEmail) {
      // E-posta servisini başlat
      EmailService.initialize({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'test@example.com',
          pass: process.env.EMAIL_PASS || 'password'
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

    return NextResponse.json({ 
      success: true, 
      message: 'E-fatura başarıyla oluşturuldu',
      fileName 
    });

  } catch (error) {
    console.error('Manuel e-fatura oluşturma hatası:', error);
    return NextResponse.json({ error: 'E-fatura oluşturulamadı' }, { status: 500 });
  }
}
