import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin profile API çağırıldı');
    
    // Unified admin check using getAdminUser
    const adminUser = await getAdminUser(request)
    
    if (adminUser) {
      console.log('✅ Admin kullanıcı bulundu:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      });
      
      const response = {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        surname: adminUser.surname,
        role: adminUser.role === 'ADMIN' ? 'SITE_ADMIN' : adminUser.role
      };
      
      // Business admin ise business name'i de ekle
      if (adminUser.role === 'BUSINESS_ADMIN') {
        // Business name'i almak için additional query
        const { prisma } = await import('@/lib/prisma');
        const business = await prisma.business.findUnique({
          where: { id: adminUser.id },
          select: { businessName: true }
        });
        
        if (business?.businessName) {
          (response as any).businessName = business.businessName;
        }
      }
      
      return NextResponse.json(response);
    }

    console.log('❌ Admin kullanıcı bulunamadı');
    
    // No valid session found
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    )
  } catch (error) {
    console.error('❌ Admin profile hatası:', error)
    console.error('❌ Hata detayları:', {
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
