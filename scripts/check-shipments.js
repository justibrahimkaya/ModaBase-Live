const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkShipments() {
  try {
    console.log('🚚 Sipariş/Kargo Kayıtları Kontrol Ediliyor...\n');

    // Toplam sipariş sayısı
    const totalOrders = await prisma.order.count();
    console.log(`📊 Toplam Sipariş Sayısı: ${totalOrders}`);

    // Kargo bilgisi olan siparişler
    const ordersWithShipping = await prisma.order.findMany({
      where: {
        OR: [
          { trackingNumber: { not: null } },
          { shippingCompany: { not: null } },
          { status: { in: ['SHIPPED', 'DELIVERED'] } }
        ]
      },
      select: {
        id: true,
        trackingNumber: true,
        shippingCompany: true,
        status: true,
        total: true,
        guestName: true,
        guestSurname: true,
        guestEmail: true,
        createdAt: true,
        shippedAt: true,
        deliveredAt: true
      }
    });

    console.log(`📦 Kargo Bilgisi Olan Sipariş Sayısı: ${ordersWithShipping.length}`);

    // Test siparişleri (test ile başlayan veya test içeren)
    const testOrders = await prisma.order.findMany({
      where: {
        OR: [
          { trackingNumber: { contains: 'test', mode: 'insensitive' } },
          { guestName: { contains: 'test', mode: 'insensitive' } },
          { guestEmail: { contains: 'test', mode: 'insensitive' } },
          { shippingCompany: { contains: 'test', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        trackingNumber: true,
        shippingCompany: true,
        status: true,
        guestName: true,
        guestSurname: true,
        guestEmail: true,
        total: true,
        createdAt: true
      }
    });

    console.log(`🧪 Test Sipariş Sayısı: ${testOrders.length}`);

    // Gerçek siparişler (test içermeyen)
    const realOrders = await prisma.order.findMany({
      where: {
        AND: [
          { trackingNumber: { not: { contains: 'test', mode: 'insensitive' } } },
          { guestName: { not: { contains: 'test', mode: 'insensitive' } } },
          { guestEmail: { not: { contains: 'test', mode: 'insensitive' } } },
          { shippingCompany: { not: { contains: 'test', mode: 'insensitive' } } }
        ]
      },
      select: {
        id: true,
        trackingNumber: true,
        shippingCompany: true,
        status: true,
        guestName: true,
        guestSurname: true,
        guestEmail: true,
        total: true,
        createdAt: true
      }
    });

    console.log(`✅ Gerçek Sipariş Sayısı: ${realOrders.length}\n`);

    // Test siparişlerini listele
    if (testOrders.length > 0) {
      console.log('🧪 TEST SİPARİŞLERİ:');
      testOrders.forEach((order, index) => {
        const customerName = order.guestName && order.guestSurname 
          ? `${order.guestName} ${order.guestSurname}` 
          : order.guestName || 'Bilinmiyor';
        console.log(`${index + 1}. ID: ${order.id} | Takip: ${order.trackingNumber || 'Yok'} | Müşteri: ${customerName} | Kargo: ${order.shippingCompany || 'Belirtilmemiş'} | Durum: ${order.status} | Tutar: ${order.total}₺ | Tarih: ${order.createdAt.toLocaleDateString('tr-TR')}`);
      });
      console.log('');
    }

    // Gerçek siparişleri listele
    if (realOrders.length > 0) {
      console.log('✅ GERÇEK SİPARİŞLER:');
      realOrders.forEach((order, index) => {
        const customerName = order.guestName && order.guestSurname 
          ? `${order.guestName} ${order.guestSurname}` 
          : order.guestName || 'Bilinmiyor';
        console.log(`${index + 1}. ID: ${order.id} | Takip: ${order.trackingNumber || 'Yok'} | Müşteri: ${customerName} | Kargo: ${order.shippingCompany || 'Belirtilmemiş'} | Durum: ${order.status} | Tutar: ${order.total}₺ | Tarih: ${order.createdAt.toLocaleDateString('tr-TR')}`);
      });
      console.log('');
    }

    // Durum bazında dağılım
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log('📈 DURUM BAZINDA DAĞILIM:');
    statusCounts.forEach(status => {
      console.log(`   ${status.status}: ${status._count.status} sipariş`);
    });

    // Kargo firması bazında dağılım
    const shippingCompanyCounts = await prisma.order.groupBy({
      by: ['shippingCompany'],
      _count: {
        shippingCompany: true
      },
      where: {
        shippingCompany: { not: null }
      }
    });

    console.log('\n🚚 KARGO FİRMASI BAZINDA DAĞILIM:');
    shippingCompanyCounts.forEach(company => {
      console.log(`   ${company.shippingCompany}: ${company._count.shippingCompany} sipariş`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkShipments(); 