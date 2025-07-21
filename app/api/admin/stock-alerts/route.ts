import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Stok uyarılarını getir
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tüm ürünleri getir
    const allProducts = await prisma.product.findMany({
      include: {
        category: true
      }
    })
    
    // Minimum stok seviyesinin altındaki ürünler
    const lowStockProducts = allProducts.filter(product => 
      product.stock <= product.minStockLevel && product.stock > 0
    ).map(product => ({
      ...product,
      categoryName: product.category.name,
      categorySlug: product.category.slug
    })).sort((a, b) => a.stock - b.stock)

    // Stokta olmayan ürünler
    const outOfStockProducts = allProducts.filter(product => 
      product.stock === 0
    ).map(product => ({
      ...product,
      categoryName: product.category.name,
      categorySlug: product.category.slug
    })).sort((a, b) => a.name.localeCompare(b.name))

    // Son 7 günlük stok hareketleri
    const recentMovements = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        product: {
          include: {
            category: true
          }
        },
        order: {
          select: {
            id: true,
            status: true,
            trackingNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      lowStockProducts,
      outOfStockProducts,
      recentMovements
    })
  } catch (error) {
    console.error('Stock alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock alerts' },
      { status: 500 }
    )
  }
}
