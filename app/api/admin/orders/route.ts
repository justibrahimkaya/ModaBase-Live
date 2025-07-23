import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Admin yetkisi gerekli' },
      { status: 401 }
    )
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        trackingNumber: true,
        shippingCompany: true,
        // Guest checkout bilgileri
        guestName: true,
        guestSurname: true,
        guestEmail: true,
        guestPhone: true,
        // User bilgileri (null olabilir)
        user: {
          select: {
            name: true,
            surname: true,
            email: true
          }
        },
        // Address bilgileri (null olabilir)
        address: {
          select: {
            title: true,
            city: true,
            district: true,
            address: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Siparişler alınırken hata oluştu' },
      { status: 500 }
    )
  }
} 