import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'
import { EmailService } from '@/lib/emailService'
import { InvoiceService } from '@/lib/invoiceService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Admin yetkisi gerekli' },
      { status: 401 }
    )
  }

  const { id } = params

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            surname: true,
            email: true,
            phone: true
          }
        },
        address: {
          select: {
            title: true,
            name: true,
            surname: true,
            email: true,
            phone: true,
            city: true,
            district: true,
            neighborhood: true,
            address: true,
            type: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: true,
                slug: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Sipariş bilgileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Admin yetkisi gerekli' },
      { status: 401 }
    )
  }

  const { id } = params
  const body = await request.json()
  const { 
    status, 
    trackingNumber, 
    adminNotes, 
    shippingCompany,
    shippingTrackingUrl,
    reason,
    // İade/Değişim işlemleri için yeni alanlar
    returnAction,
    exchangeAction,
    refundAmount,
    newProductId,
    newSize,
    newColor,
    // ✅ YENİ: Sipariş onay sistemi
    orderAction
  } = body

  try {
    // Önce siparişi al
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        address: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    // Sadece güncellenen alanları ayarla
    const updateData: any = {}
    if (status) updateData.status = status
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (shippingCompany !== undefined) updateData.shippingCompany = shippingCompany
    if (shippingTrackingUrl !== undefined) updateData.shippingTrackingUrl = shippingTrackingUrl

    // ✅ YENİ: Sipariş onay/red işlemleri
    if (orderAction) {
      if (orderAction === 'APPROVE') {
        updateData.status = 'APPROVED'
        updateData.adminNotes = `Sipariş onaylandı - ${adminNotes || 'İşletme onayı'}`
        console.log('✅ Sipariş onaylandı, ödeme emaili gönderilecek')
      } else if (orderAction === 'REJECT') {
        updateData.status = 'REJECTED'
        updateData.adminNotes = `Sipariş reddedildi - ${reason || adminNotes || 'Belirtilmemiş'}`
        console.log('❌ Sipariş reddedildi')
      }
    }

    // Durum değiştiyse ilgili tarihleri güncelle
    if (status === 'SHIPPED') updateData.shippedAt = new Date()
    if (status === 'DELIVERED') updateData.deliveredAt = new Date()
    if (status === 'REJECTED') updateData.adminNotes = `Reddedildi - Sebep: ${reason || 'Belirtilmemiş'}`

    // İade işlemleri
    if (returnAction) {
      if (returnAction === 'APPROVE') {
        updateData.status = 'RETURN_APPROVED'
        updateData.returnApprovedAt = new Date()
        updateData.adminNotes = `İade onaylandı - ${adminNotes || 'Admin onayı'}`
        
        // Stok geri ekle
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          })

          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              orderId: order.id,
              type: 'IN',
              quantity: item.quantity,
              description: `İade onaylandı - Sipariş #${order.id} için stok geri eklendi`
            }
          })
        }
      } else if (returnAction === 'REJECT') {
        updateData.status = 'RETURN_REJECTED'
        updateData.adminNotes = `İade reddedildi - ${adminNotes || 'Admin reddi'}`
      }
    }

    // Değişim işlemleri
    if (exchangeAction) {
      if (exchangeAction === 'APPROVE') {
        updateData.status = 'EXCHANGE_APPROVED'
        updateData.exchangeApprovedAt = new Date()
        updateData.adminNotes = `Değişim onaylandı - ${adminNotes || 'Admin onayı'}`
        
        // Eski ürün stokunu geri ekle
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          })

          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              orderId: order.id,
              type: 'IN',
              quantity: item.quantity,
              description: `Değişim onaylandı - Eski ürün stok geri eklendi`
            }
          })
        }

        // Yeni ürün stokunu düş
        if (newProductId) {
          await prisma.product.update({
            where: { id: newProductId },
            data: {
              stock: {
                decrement: 1
              }
            }
          })

          await prisma.stockMovement.create({
            data: {
              productId: newProductId,
              orderId: order.id,
              type: 'OUT',
              quantity: 1,
              description: `Değişim onaylandı - Yeni ürün stok düşüldü`
            }
          })
        }
      } else if (exchangeAction === 'REJECT') {
        updateData.status = 'EXCHANGE_REJECTED'
        updateData.adminNotes = `Değişim reddedildi - ${adminNotes || 'Admin reddi'}`
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        address: true
      }
    })

    // E-posta bildirimleri gönder
    const customerEmail = order.user?.email || order.guestEmail
    const customerName = order.user ? `${order.user.name} ${order.user.surname}` : 
                        order.guestName && order.guestSurname ? `${order.guestName} ${order.guestSurname}` : 
                        'Müşteri'

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

        // ✅ YENİ: Sipariş onaylandığında tek email gönder (onay + ödeme bilgileri)
        if (orderAction === 'APPROVE') {
          console.log('📧 Sipariş onaylandı, müşteriye tek email gönderiliyor...')
          
          let invoicePdfPath: string | undefined;
          
          // PDF E-Fatura oluştur
          try {
            const companyInfo = {
              name: 'Modahan İbrahim Kaya - ModaBase E-Ticaret',
              address: 'Malkoçoğlu Mah. 305/1 Sok. No: 17/A, Sultangazi/İstanbul/Türkiye',
              phone: '+90 536 297 12 55',
              email: 'info@modabase.com.tr',
              taxNumber: '1234567890',
              taxOffice: 'İstanbul Vergi Dairesi'
            };

            const invoiceData = {
              order: updatedOrder,
              companyInfo
            };

            const { filePath, fileName } = await InvoiceService.generateInvoicePDF(invoiceData);
            invoicePdfPath = filePath;

            // Order'a PDF URL'ini kaydet
            await prisma.order.update({
              where: { id: order.id },
              data: {
                einvoicePdfUrl: `/invoices/${fileName}`,
                einvoiceStatus: 'SUCCESS'
              }
            });

            console.log('✅ E-fatura oluşturuldu')
          } catch (invoiceError) {
            console.error('❌ E-fatura oluşturma hatası:', invoiceError)
          }

          // ✅ Email servisini başlat - kavram.triko@gmail.com ile
          EmailService.initialize({
            host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER || process.env.EMAIL_USER || 'kavram.triko@gmail.com',
              pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'yqarfkyevahfnenq'
            }
          });

          // ✅ TEK EMAIL: Sipariş onayı + ödeme talimatları + e-fatura
          await EmailService.sendOrderApprovalWithPaymentInstructions({
            to: customerEmail,
            customerName,
            orderId: order.id,
            orderNumber: order.id.slice(-8),
            totalAmount: order.total,
            paymentMethod: order.paymentMethod || 'Havale/EFT',
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            })),
            invoicePdfPath
          })

          console.log('✅ Sipariş onayı + ödeme talimatları tek mailde gönderildi')
        }

        // ✅ YENİ: Sipariş reddedildiğinde
        if (orderAction === 'REJECT') {
          await EmailService.sendOrderRejection({
            to: customerEmail,
            customerName,
            orderId: order.id,
            orderNumber: order.id.slice(-8),
            reason: reason || adminNotes || 'Belirtilmemiş',
            totalAmount: order.total,
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          })

          console.log('✅ Sipariş red bildirimi gönderildi')
        }

        // İade onaylandığında
        if (returnAction === 'APPROVE') {
          await EmailService.sendReturnApprovalNotification({
            to: customerEmail,
            customerName,
            orderId: order.id,
            orderNumber: order.id.slice(-8),
            refundAmount: refundAmount || order.total,
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          })
        }

        // İade reddedildiğinde
        if (returnAction === 'REJECT') {
          await EmailService.sendReturnRejectionNotification({
            to: customerEmail,
            customerName,
            orderId: order.id,
            orderNumber: order.id.slice(-8),
            reason: adminNotes || 'Belirtilmemiş',
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          })
        }

        // Değişim onaylandığında
        if (exchangeAction === 'APPROVE') {
          await EmailService.sendExchangeApprovalNotification({
            to: customerEmail,
            customerName,
            orderId: order.id,
            orderNumber: order.id.slice(-8),
            newProductId,
            newSize,
            newColor,
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          })
        }

        // Değişim reddedildiğinde
        if (exchangeAction === 'REJECT') {
          await EmailService.sendExchangeRejectionNotification({
            to: customerEmail,
            customerName,
            orderId: order.id,
            orderNumber: order.id.slice(-8),
            reason: adminNotes || 'Belirtilmemiş',
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          })
        }

        // ❌ KALDIRILDI: Eski otomatik ödeme talimatları
        // Artık sadece onay sonrası gönderiliyor

      } catch (emailError) {
        console.error('E-posta gönderme hatası:', emailError)
        // E-posta hatası sipariş güncellemesini etkilemesin
      }
    }

    let message = 'Sipariş başarıyla güncellendi'
    if (orderAction === 'APPROVE') {
      message = 'Sipariş onaylandı ve müşteriye ödeme talimatları gönderildi'
    } else if (orderAction === 'REJECT') {
      message = 'Sipariş reddedildi ve müşteriye bildirim gönderildi'
    }

    return NextResponse.json({
      success: true,
      message: message,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { error: 'Sipariş güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
