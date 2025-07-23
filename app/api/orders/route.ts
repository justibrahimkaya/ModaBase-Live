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
  const userId = getUserIdFromRequest(request)
  const body = await request.json()
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
    // Adres oluştur (eğer address objesi gönderilmişse)
    let createdAddressId = addressId;
    if (!addressId && body.address) {
      const newAddress = await tx.address.create({
        data: {
          userId: userId || undefined,
          title: body.address.title,
          city: body.address.city,
          district: body.address.district,
          neighborhood: body.address.neighborhood,
          address: body.address.address,
          isDefault: false
        }
      });
      createdAddressId = newAddress.id;
    }

    // Sipariş oluştur
    const newOrder = await tx.order.create({
      data: {
        userId: userId || undefined,
        addressId: createdAddressId,
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

    // Stok güncelle ve hareket kaydet
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          orderId: newOrder.id,
          type: 'OUT',
          quantity: item.quantity,
          description: `Sipariş #${newOrder.id} için stok düşüldü`
        }
      })
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

  return NextResponse.json({
    success: true,
    order: order,
    message: 'Sipariş başarıyla oluşturuldu'
  })
}
