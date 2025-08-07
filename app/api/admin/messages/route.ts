import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - İşletme mesajlarını listele (sadece o işletmeye ait)
export async function GET(request: NextRequest) {
  try {
    // İşletme admin kontrolü (bu kısmı gerçek auth ile değiştirin)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const businessId = searchParams.get('businessId') // İşletme ID'si
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }
    
    const skip = (page - 1) * limit

    // Filtreleme - sadece bu işletmeye ait mesajlar
    const where: any = {
      businessId: businessId
    }
    
    if (status && status !== 'all') {
      where.status = status
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          business: {
            select: {
              id: true,
              businessName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.contactMessage.count({ where })
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Business messages fetch error:', error)
    return NextResponse.json(
      { error: 'Mesajlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}