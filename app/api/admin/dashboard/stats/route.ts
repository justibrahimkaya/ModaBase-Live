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
    // Toplam sipariş sayısı
    const totalOrders = await prisma.order.count()

    // Toplam ürün sayısı
    const totalProducts = await prisma.product.count()

    // Aktif ürün sayısı (stok > 0)
    const activeProducts = await prisma.product.count({
      where: {
        stock: {
          gt: 0
        }
      }
    })

    // Toplam kullanıcı sayısı (sadece süper admin için)
    const totalUsers = adminUser.role === 'ADMIN' ? await prisma.user.count() : 0

    // Toplam işletme sayısı (sadece süper admin için)
    const totalBusinesses = adminUser.role === 'ADMIN' ? await prisma.business.count() : 0

    // Onaylı işletme sayısı (sadece süper admin için)
    const approvedBusinesses = adminUser.role === 'ADMIN' ? await prisma.business.count({
      where: {
        adminStatus: 'APPROVED'
      }
    }) : 0

    // Bekleyen işletme sayısı (sadece süper admin için)
    const pendingBusinesses = adminUser.role === 'ADMIN' ? await prisma.business.count({
      where: {
        adminStatus: 'PENDING'
      }
    }) : 0

    // Toplam gelir
    const revenueResult = await prisma.order.aggregate({
      where: {
        status: {
          in: ['CONFIRMED', 'SHIPPED', 'DELIVERED']
        }
      },
      _sum: {
        total: true
      }
    })
    const totalRevenue = revenueResult._sum.total || 0

    // Bekleyen sipariş sayısı
    const pendingOrders = await prisma.order.count({
      where: {
        status: 'PENDING'
      }
    })

    // Düşük stok ürün sayısı (stok < 10)
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: {
          lt: 10
        }
      }
    })

    // Son 10 sipariş
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            surname: true
          }
        }
      }
    })

    return NextResponse.json({
      totalOrders,
      totalProducts,
      activeProducts,
      totalUsers,
      totalBusinesses,
      approvedBusinesses,
      pendingBusinesses,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      userRole: adminUser.role
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'İstatistikler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
