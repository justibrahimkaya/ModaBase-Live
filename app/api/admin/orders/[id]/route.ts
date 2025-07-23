import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'
import { EmailService } from '@/lib/emailService'

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
    action
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

    // Durum değiştiyse ilgili tarihleri güncelle
    if (status === 'SHIPPED') updateData.shippedAt = new Date()
    if (status === 'DELIVERED') updateData.deliveredAt = new Date()
    if (status === 'REJECTED') updateData.adminNotes = `Reddedildi - Sebep: ${reason || 'Belirtilmemiş'}`

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
    try {
      EmailService.initialize({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'info@modabase.com.tr',
          pass: process.env.SMTP_PASS || 'password'
        }
      })

      const customerEmail = order.user?.email || order.guestEmail
      const customerName = order.user ? `${order.user.name} ${order.user.surname}` : 
                          order.guestName && order.guestSurname ? `${order.guestName} ${order.guestSurname}` : 
                          'Müşteri'

      if (customerEmail) {
        if (action === 'reject' && status === 'REJECTED') {
          // Sipariş reddedildi e-postası
          await EmailService.sendOrderRejection({
            to: customerEmail,
            customerName,
            orderId: order.id,
            orderNumber: order.id.slice(-8),
            reason: reason || 'Belirtilmemiş',
            totalAmount: order.total,
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          })
        } else if (action === 'approve' && (status === 'CONFIRMED' || status === 'PAID')) {
          // Sipariş onaylandı e-postası
          await EmailService.sendOrderApproval({
            to: customerEmail,
            customerName,
            orderId: order.id,
            orderNumber: order.id.slice(-8),
            totalAmount: order.total,
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          })

          // Eğer ödeme henüz yapılmamışsa, ödeme talimatları e-postası gönder
          if (order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT') {
            await EmailService.sendPaymentInstructions({
              to: customerEmail,
              customerName,
              orderId: order.id,
              orderNumber: order.id.slice(-8),
              totalAmount: order.total,
              paymentMethod: order.paymentMethod,
              items: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price
              }))
            })
          }
        }
      }
    } catch (emailError) {
      console.error('E-posta gönderme hatası:', emailError)
      // E-posta hatası sipariş güncellemesini etkilemesin
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: action === 'reject' ? 'Sipariş reddedildi ve müşteriye bilgilendirme e-postası gönderildi.' :
              action === 'approve' ? 'Sipariş onaylandı ve müşteriye bilgilendirme e-postası gönderildi.' :
              'Sipariş başarıyla güncellendi.'
    })

  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Sipariş güncellenemedi.' 
    }, { status: 400 })
  }
}
