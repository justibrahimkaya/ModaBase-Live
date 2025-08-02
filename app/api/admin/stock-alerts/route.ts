import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // ✅ 30 saniye timeout

// Stok uyarılarını getir - ULTRA OPTIMIZED
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Stok uyarıları API çağırıldı - OPTIMIZED VERSION');
    const startTime = Date.now();
    
    const admin = await getAdminUser(request)
    if (!admin) {
      console.log('❌ Admin yetkisi yok');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin yetkisi onaylandı:', admin.email);

    // ✅ OPTIMIZED: Database seviyesinde filtreleme
    console.log('🚀 Optimized database queries başlatılıyor...');
    
    // Paralel query'ler - daha hızlı
    const [lowStockProducts, outOfStockProducts, recentMovements] = await Promise.all([
             // Low stock products - database seviyesinde filtre
              // Low stock products - optimized query
       prisma.product.findMany({
         select: {
           id: true,
           name: true,
           slug: true,
           stock: true,
           minStockLevel: true,
           price: true,
           updatedAt: true,
           category: {
             select: {
               name: true,
               slug: true
             }
           }
         },
         orderBy: { stock: 'asc' },
         take: 200 // ✅ Limit - sonra filter edeceğiz
       }),
      
      // Out of stock products - database seviyesinde filtre  
      prisma.product.findMany({
        where: {
          stock: 0
        },
        select: {
          id: true,
          name: true,
          slug: true,
          stock: true,
          minStockLevel: true,
          price: true,
          updatedAt: true,
          category: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: { name: 'asc' },
        take: 100 // ✅ Limit ekledik
      }),
      
      // Recent movements - optimized
      prisma.stockMovement.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
                 select: {
           id: true,
           type: true,
           quantity: true,
           createdAt: true,
           description: true,
          product: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  name: true
                }
              }
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
        take: 50 // ✅ Limit
      })
    ]);

    const queryTime = Date.now() - startTime;
    console.log(`⚡ Database queries tamamlandı: ${queryTime}ms`);

         // ✅ FAST: Filtreleme ve mapping
     const processedLowStock = lowStockProducts
       .filter(product => product.stock > 0 && product.stock <= product.minStockLevel)
       .slice(0, 100) // İlk 100'ü al
       .map(product => ({
         ...product,
         categoryName: product.category.name,
         categorySlug: product.category.slug
       }));

     const processedOutOfStock = outOfStockProducts.map(product => ({
       ...product,
       categoryName: product.category.name,
       categorySlug: product.category.slug
     }));

    console.log('📊 OPTIMIZED Stok özeti:', {
      lowStockCount: processedLowStock.length,
      outOfStockCount: processedOutOfStock.length,
      movementsCount: recentMovements.length,
      totalTime: `${Date.now() - startTime}ms`
    });

    const response = {
      lowStockProducts: processedLowStock,
      outOfStockProducts: processedOutOfStock,
      recentMovements
    };

    console.log('✅ Stok uyarıları başarıyla döndürülüyor:', {
      lowStock: response.lowStockProducts.length,
      outOfStock: response.outOfStockProducts.length,
      movements: response.recentMovements.length,
      performanceTime: `${Date.now() - startTime}ms`
    });

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Stok uyarıları hatası:', {
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return NextResponse.json(
      { error: 'Stok verileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
