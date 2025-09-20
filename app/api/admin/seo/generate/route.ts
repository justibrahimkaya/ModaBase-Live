import { NextRequest, NextResponse } from 'next/server';
import { generateSEO, validateSEO, getSEORecommendations } from '@/lib/seoService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, brand, price, description } = body;

    // Gerekli alanları kontrol et
    if (!name || !category) {
      return NextResponse.json({
        error: 'Ürün adı ve kategori zorunludur'
      }, { status: 400 });
    }

    // SEO oluştur
    const seoData = await generateSEO({
      name,
      category,
      ...(brand && { brand }),
      ...(price && { price }),
      ...(description && { description })
    });

    // SEO kalite kontrolü
    const validation = validateSEO(seoData);
    const recommendations = getSEORecommendations(seoData);

    return NextResponse.json({
      success: true,
      data: seoData,
      validation,
      recommendations
    });

  } catch (error) {
    console.error('SEO generation API error:', error);
    return NextResponse.json({
      error: 'SEO oluşturulurken hata oluştu'
    }, { status: 500 });
  }
} 