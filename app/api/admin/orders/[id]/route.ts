import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'

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
    shippingTrackingUrl 
  } = body

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

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        user: true,
        address: true
      }
    })
    return NextResponse.json(updatedOrder)
  } catch (error) {
    return NextResponse.json({ error: 'Sipariş güncellenemedi.' }, { status: 400 })
  }
}
