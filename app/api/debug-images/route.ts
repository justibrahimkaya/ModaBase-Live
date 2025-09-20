import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Son 5 ürünü al
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        images: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Her ürün için resim durumunu analiz et
    const analysis = products.map(product => {
      let imageStatus = {
        id: product.id,
        name: product.name,
        createdAt: product.createdAt,
        imagesFieldLength: product.images?.length || 0,
        parsedImages: [] as any[],
        error: null as string | null
      }

      try {
        const images = JSON.parse(product.images || '[]')
        imageStatus.parsedImages = images.map((img: string, index: number) => {
          if (!img) return { index, type: 'empty', length: 0 }
          
          if (img.startsWith('data:image/')) {
            const mimeMatch = img.match(/data:image\/([^;]+)/)
            const mime = mimeMatch ? mimeMatch[1] : 'unknown'
            return {
              index,
              type: 'base64',
              mime,
              length: img.length,
              sizeKB: Math.round(img.length * 0.75 / 1024),
              preview: img.substring(0, 100)
            }
          } else if (img.startsWith('http://') || img.startsWith('https://')) {
            return {
              index,
              type: 'http_url',
              url: img,
              isPlaceholder: img.includes('placeholder'),
              length: img.length
            }
          } else if (img.startsWith('/')) {
            return {
              index,
              type: 'local_path',
              path: img,
              isDefault: img === '/default-product.svg',
              length: img.length
            }
          } else {
            return {
              index,
              type: 'unknown',
              content: img.substring(0, 100),
              length: img.length
            }
          }
        })
      } catch (error: any) {
        imageStatus.error = error.message
      }

      return imageStatus
    })

    // Özet istatistikler
    const stats = {
      totalProducts: products.length,
      productsWithBase64: analysis.filter(a => 
        a.parsedImages.some((img: any) => img.type === 'base64')
      ).length,
      productsWithHttpUrl: analysis.filter(a => 
        a.parsedImages.some((img: any) => img.type === 'http_url')
      ).length,
      productsWithLocalPath: analysis.filter(a => 
        a.parsedImages.some((img: any) => img.type === 'local_path')
      ).length,
      productsWithNoImages: analysis.filter(a => 
        a.parsedImages.length === 0
      ).length,
      productsWithErrors: analysis.filter(a => a.error !== null).length
    }

    return NextResponse.json({
      success: true,
      stats,
      products: analysis,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
