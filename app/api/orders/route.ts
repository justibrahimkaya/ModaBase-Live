import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '../utils'
import { InvoiceService } from '@/lib/invoiceService'
import { EmailService } from '@/lib/emailService'

// GET: Tüm siparişleri getir (artık sadece giriş yapan kullanıcının siparişleri)
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 })
  }
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      },
      address: true,
      user: true
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(orders)
}

// POST: Yeni sipariş oluştur (userId session'dan alınacak)
export async function POST(request: NextRequest) {
  try {
    console.log('📦 Sipariş oluşturma başlıyor...')
    
    const userId = getUserIdFromRequest(request)
    console.log('👤 User ID:', userId)
    
    let body;
    try {
      body = await request.json()
      console.log('📋 Request body:', body)
    } catch (parseError) {
      console.error('❌ JSON parse hatası:', parseError)
      return NextResponse.json({ 
        success: false,
        error: 'Geçersiz JSON verisi' 
      }, { status: 400 })
    }
  const {
    addressId,
    invoiceAddressId,
    shippingMethod,
    paymentMethod,
    discount,
    shippingCost,
    note,
    items,
    total,
    guestName,
    guestSurname,
    guestEmail,
    guestPhone,
    // E-fatura alanları
    invoiceType,
    tcKimlikNo,
    vergiNo,
    vergiDairesi,
    unvan
  } = body

  // Guest checkout validasyonu
  if (!userId) {
    if (!guestName || !guestSurname || !guestEmail || !guestPhone) {
      return NextResponse.json({ 
        success: false,
        error: 'Kayıtsız alışveriş için ad, soyad, e-posta ve telefon gereklidir.' 
      }, { status: 400 })
    }
  }

  // Stok kontrolü
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    })
    
    if (!product) {
      return NextResponse.json(
        { 
          success: false,
          error: `Ürün bulunamadı: ${item.productId}` 
        },
        { status: 400 }
      )
    }
    
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { 
          success: false,
          error: `${product.name} için yeterli stok yok. Mevcut: ${product.stock}, İstenen: ${item.quantity}` 
        },
        { status: 400 }
      )
    }
  }

  // Transaction ile sipariş oluştur ve stok güncelle
  const order = await prisma.$transaction(async (tx: any) => {
    // Sipariş oluştur (guest checkout için adres bilgileri doğrudan kullanılır)
    const newOrder = await tx.order.create({
      data: {
        userId: userId || undefined,
        addressId: addressId, // Eğer varsa kullan, yoksa null
        invoiceAddressId,
        shippingMethod,
        paymentMethod,
        discount,
        shippingCost,
        note,
        total,
        guestName: userId ? undefined : guestName,
        guestSurname: userId ? undefined : guestSurname,
        guestEmail: userId ? undefined : guestEmail,
        guestPhone: userId ? undefined : guestPhone,
        // E-fatura alanları
        invoiceType,
        tcKimlikNo,
        vergiNo,
        vergiDairesi,
        unvan,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color
          }))
        }
      },
      include: {
        items: true
      }
    })

    // Stok rezervasyonu yap (henüz düşme, sadece kontrol)
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      })
      
      if (!product) {
        throw new Error(`Ürün bulunamadı: ${item.productId}`)
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`${product.name} için yeterli stok yok. Mevcut: ${product.stock}, İstenen: ${item.quantity}`)
      }
    }

    return newOrder
  })

  // Stok geri getirildiğinde bildirim gönder (iptal durumunda)
  // Bu kısım sipariş iptal edildiğinde çalışacak

  // PDF E-Fatura oluştur ve e-posta gönder
  try {
    // Şirket bilgileri
    const companyInfo = {
              name: 'Modahan İbrahim Kaya - ModaBase E-Ticaret',
              address: 'Malkoçoğlu Mah. 305/1 Sok. No: 17/A, Sultangazi/İstanbul/Türkiye',
              phone: '+90 536 297 12 55',
                    email: 'info@modabase.com.tr',
      taxNumber: '1234567890',
      taxOffice: 'İstanbul Vergi Dairesi'
    };

    // Sipariş bilgilerini tam olarak al
    const orderWithDetails = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    if (orderWithDetails) {
      // PDF E-Fatura oluştur
      const invoiceData = {
        order: orderWithDetails,
        companyInfo
      };

      const { filePath, fileName } = await InvoiceService.generateInvoicePDF(invoiceData);

      // E-posta gönder
      const customerEmail = orderWithDetails.user?.email || orderWithDetails.guestEmail;
      const customerName = orderWithDetails.user?.name || orderWithDetails.guestName || 'Müşteri';

      if (customerEmail) {
        // E-posta servisini başlat (gerçek ortamda environment variables kullanılmalı)
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

        // Sipariş onay e-postası gönder
        await EmailService.sendOrderConfirmation(
          customerEmail,
          customerName,
          order.id,
          order.total
        );
      }

      // Order'a PDF URL'ini kaydet
      await prisma.order.update({
        where: { id: order.id },
        data: {
          einvoicePdfUrl: `/invoices/${fileName}`,
          einvoiceStatus: 'SUCCESS'
        }
      });
    }
  } catch (error) {
    console.error('E-fatura oluşturma hatası:', error);
    // Hata durumunda siparişi iptal etme, sadece log
  }

  // İşletme paneline bildirim gönder
  try {
    console.log('📧 İşletme paneline bildirim gönderiliyor...')
    
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
      // İşletme sahibine yeni sipariş bildirimi gönder
      EmailService.initialize({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'info@modabase.com.tr',
          pass: process.env.SMTP_PASS || 'password'
        }
      });

      const customerName = order.user ? `${order.user.name} ${order.user.surname}` : 
                          order.guestName && order.guestSurname ? `${order.guestName} ${order.guestSurname}` : 
                          'Misafir Müşteri';

      await EmailService.sendNewOrderNotification({
        to: business.contactEmail,
        businessName: business.businessName,
        orderId: order.id,
        orderNumber: order.id.slice(-8),
        customerName,
        customerEmail: order.user?.email || order.guestEmail || 'E-posta yok',
        totalAmount: order.total,
        paymentMethod: order.paymentMethod,
        items: order.items.map((item: { product?: { name?: string }, quantity: number, price: number }) => ({
          name: item.product?.name || 'Ürün',
          quantity: item.quantity,
          price: item.price
        }))
      });

      console.log('✅ İşletme paneline bildirim gönderildi')
    }
  } catch (notificationError) {
    console.error('❌ İşletme bildirimi hatası:', notificationError)
    // Bildirim hatası sipariş oluşturmayı etkilemesin
  }

  return NextResponse.json({
    success: true,
    order: order,
    message: 'Sipariş başarıyla oluşturuldu ve işletme paneline bildirim gönderildi'
  })
  
  } catch (error) {
    console.error('❌ Sipariş oluşturma hatası:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Sipariş oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') 
    }, { status: 500 })
  }
}
