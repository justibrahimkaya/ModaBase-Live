const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  console.log('📊 SİPARİŞ DURUMU ANALİZİ:');
  
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      total: true,
      einvoiceStatus: true,
      einvoicePdfUrl: true,
      status: true,
      createdAt: true,
      user: { select: { name: true } },
      guestName: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('\n📋 SON 10 SİPARİŞ:');
  orders.forEach((order, index) => {
    const customerName = order.user?.name || order.guestName || 'Misafir';
    const invoiceStatus = order.einvoiceStatus || 'YOK';
    const hasPdf = order.einvoicePdfUrl ? '✅' : '❌';
    
    console.log(`${index + 1}. ${order.id.slice(-8)} - ${customerName} - ${order.total}₺ - Fatura: ${invoiceStatus} ${hasPdf}`);
  });

  // İstatistikler
  const allOrders = await prisma.order.findMany({
    select: { einvoiceStatus: true }
  });

  const stats = {};
  allOrders.forEach(order => {
    const status = order.einvoiceStatus || 'Fatura Yok';
    stats[status] = (stats[status] || 0) + 1;
  });

  console.log('\n📈 FATURA DURUMU İSTATİSTİKLERİ:');
  Object.entries(stats).forEach(([status, count]) => {
    console.log(`   ${status}: ${count} adet`);
  });

  // Faturasız sipariş var mı kontrol et
  const unpaidOrders = await prisma.order.findMany({
    where: {
      OR: [
        { einvoiceStatus: null },
        { einvoiceStatus: { not: 'SUCCESS' } }
      ]
    },
    select: {
      id: true,
      status: true,
      total: true,
      einvoiceStatus: true
    },
    take: 5
  });

  if (unpaidOrders.length > 0) {
    console.log('\n💡 FATURA OLUŞTURULABİLECEK SİPARİŞLER:');
    unpaidOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.id.slice(-8)} - Status: ${order.status} - ${order.total}₺`);
    });
  } else {
    console.log('\n⚠️  TÜM SİPARİŞLERİN FATURASI OLUŞTURULMUŞ');
  }

  await prisma.$disconnect();
}

checkOrders().catch(console.error); 