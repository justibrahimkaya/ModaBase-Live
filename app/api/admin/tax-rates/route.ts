// =======================================================
// KDV ORANLARI YÖNETİM API'si - ADMIN PANELİ
// =======================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/adminAuth';
import { EARSIV_CONFIG } from '@/lib/earsiv/constants';

export const dynamic = 'force-dynamic';

// KDV Oranlarını Getir
export async function GET(request: NextRequest) {
  try {
    console.log('📊 KDV oranları listesi isteniyor...');

    // Admin yetkisi kontrol
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Mevcut KDV sabitlerini döndür
    const taxRates = {
      predefinedRates: EARSIV_CONFIG.TAX_RATES,
      categoryRates: await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          defaultTaxRate: true,
          products: {
            select: {
              id: true,
              name: true,
              taxRate: true
            }
          }
        }
      })
    };

    console.log('✅ KDV oranları başarıyla getirildi');
    return NextResponse.json({
      success: true,
      data: taxRates
    });

  } catch (error) {
    console.error('❌ KDV oranları getirme hatası:', error);
    return NextResponse.json(
      { error: 'KDV oranları getirilemedi' },
      { status: 500 }
    );
  }
}

// Kategori KDV Oranını Güncelle
export async function PATCH(request: NextRequest) {
  try {
    console.log('🔧 Kategori KDV oranı güncelleniyor...');

    // Admin yetkisi kontrol
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { categoryId, taxRate } = await request.json();

    // Validasyon
    if (!categoryId || taxRate === undefined) {
      return NextResponse.json(
        { error: 'Kategori ID ve KDV oranı gerekli' },
        { status: 400 }
      );
    }

    if (taxRate < 0 || taxRate > 100) {
      return NextResponse.json(
        { error: 'KDV oranı 0-100 arasında olmalı' },
        { status: 400 }
      );
    }

    // Kategori KDV oranını güncelle
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { defaultTaxRate: taxRate },
      include: {
        products: {
          select: { id: true, name: true, taxRate: true }
        }
      }
    });

    console.log(`✅ Kategori "${updatedCategory.name}" KDV oranı %${taxRate} olarak güncellendi`);

    return NextResponse.json({
      success: true,
      message: `Kategori KDV oranı %${taxRate} olarak güncellendi`,
      data: updatedCategory
    });

  } catch (error) {
    console.error('❌ Kategori KDV güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'KDV oranı güncellenemedi' },
      { status: 500 }
    );
  }
}

// Ürün KDV Oranını Güncelle
export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 Ürün KDV oranı güncelleniyor...');

    // Admin yetkisi kontrol
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { productId, taxRate } = await request.json();

    // Validasyon
    if (!productId || taxRate === undefined) {
      return NextResponse.json(
        { error: 'Ürün ID ve KDV oranı gerekli' },
        { status: 400 }
      );
    }

    if (taxRate < 0 || taxRate > 100) {
      return NextResponse.json(
        { error: 'KDV oranı 0-100 arasında olmalı' },
        { status: 400 }
      );
    }

    // Ürün KDV oranını güncelle
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { taxRate: taxRate },
      include: {
        category: {
          select: { name: true, defaultTaxRate: true }
        }
      }
    });

    console.log(`✅ Ürün "${updatedProduct.name}" KDV oranı %${taxRate} olarak güncellendi`);

    return NextResponse.json({
      success: true,
      message: `Ürün KDV oranı %${taxRate} olarak güncellendi`,
      data: updatedProduct
    });

  } catch (error) {
    console.error('❌ Ürün KDV güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Ürün KDV oranı güncellenemedi' },
      { status: 500 }
    );
  }
} 