import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Stok uyarılarını getir
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Stok uyarıları API çağırıldı');
    
    const admin = await getAdminUser(request)
    if (!admin) {
      console.log('❌ Admin yetkisi yok');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin yetkisi onaylandı:', admin.email);

    // Tüm ürünleri getir
    console.log('🔍 Ürünler getiriliyor...');
    const allProducts = await prisma.product.findMany({
      include: {
        category: true
      }
    })
    
    console.log('📦 Toplam ürün sayısı:', allProducts.length);
    
    // Minimum stok seviyesinin altındaki ürünler
    console.log('⚠️ Düşük stok kontrolü yapılıyor...');
    const lowStockProducts = allProducts.filter(product => {
      const isLowStock = product.stock <= product.minStockLevel && product.stock > 0;
      if (isLowStock) {
        console.log(`📉 Düşük stok: ${product.name} - Stok: ${product.stock}, Min: ${product.minStockLevel}`);
      }
      return isLowStock;
    }).map(product => ({
      ...product,
      categoryName: product.category.name,
      categorySlug: product.category.slug
    })).sort((a, b) => a.stock - b.stock)

    // Stokta olmayan ürünler
    console.log('❌ Stoksuz ürün kontrolü yapılıyor...');
    const outOfStockProducts = allProducts.filter(product => {
      const isOutOfStock = product.stock === 0;
      if (isOutOfStock) {
        console.log(`🚫 Stoksuz: ${product.name}`);
      }
      return isOutOfStock;
    }).map(product => ({
      ...product,
      categoryName: product.category.name,
      categorySlug: product.category.slug
    })).sort((a, b) => a.name.localeCompare(b.name))

    console.log('📊 Stok özeti:', {
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length
    });

    // Son 7 günlük stok hareketleri
    console.log('📈 Stok hareketleri getiriliyor...');
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

    console.log('📈 Stok hareketleri sayısı:', recentMovements.length);

    const response = {
      lowStockProducts,
      outOfStockProducts,
      recentMovements
    };

    console.log('✅ Stok uyarıları başarıyla döndürülüyor:', {
      lowStock: response.lowStockProducts.length,
      outOfStock: response.outOfStockProducts.length,
      movements: response.recentMovements.length
    });

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Stok uyarıları API hatası:', error)
    console.error('❌ Hata detayları:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return NextResponse.json(
      { 
        error: 'Stok uyarıları getirilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}
