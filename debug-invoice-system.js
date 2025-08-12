// =====================================================
// FATURA SİSTEMİ TANI SCRIPTI - CANLI VERİ GÜVENLİ
// =====================================================

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function diagnoseFaturaSystem() {
  console.log('🔍 Fatura sistemi tanı başlatılıyor...\n');

  // 1. Dosya Sistemi Kontrolleri
  console.log('📂 1. DOSYA SİSTEMİ KONTROL:');
  const publicDir = path.join(process.cwd(), 'public');
  const invoicesDir = path.join(publicDir, 'invoices');
  
  console.log('   public klasörü:', fs.existsSync(publicDir) ? '✅ Var' : '❌ Yok');
  console.log('   invoices klasörü:', fs.existsSync(invoicesDir) ? '✅ Var' : '❌ Yok');
  
  // Yazma izinlerini test et (güvenli dosya)
  try {
    const testFile = path.join(invoicesDir, 'test-permission.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('   Yazma izni:', '✅ Var');
  } catch (error) {
    console.log('   Yazma izni:', '❌ Yok -', error.message);
  }

  // 2. Dependencies Kontrol
  console.log('\n📦 2. DEPENDENCIES KONTROL:');
  try {
    const PDFDocument = require('pdfkit');
    console.log('   pdfkit:', '✅ Yüklü');
  } catch (error) {
    console.log('   pdfkit:', '❌ Hatalı -', error.message);
  }

  // 3. Environment Variables
  console.log('\n🔧 3. ENVIRONMENT VARIABLES:');
  const envVars = [
    'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 
    'EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'
  ];
  envVars.forEach(envVar => {
    console.log(`   ${envVar}:`, process.env[envVar] ? '✅ Var' : '❌ Yok');
  });

  // 4. Veritabanı Bağlantısı (Salt Okuma)
  console.log('\n💽 4. VERİTABANI BAĞLANTI:');
  try {
    const orderCount = await prisma.order.count();
    console.log('   Bağlantı:', '✅ Başarılı');
    console.log('   Toplam sipariş sayısı:', orderCount);
  } catch (error) {
    console.log('   Bağlantı:', '❌ Hatalı -', error.message);
  }

  // 5. Test Siparişi Kontrol (Veri değiştirmez)
  console.log('\n📋 5. TEST SİPARİŞİ KONTROL:');
  try {
    const sampleOrder = await prisma.order.findFirst({
      include: {
        items: {
          include: { product: true }
        },
        user: true,
        address: true
      },
      where: {
        NOT: {
          einvoiceStatus: 'SUCCESS'
        }
      }
    });

    if (sampleOrder) {
      console.log('   Test edilebilir sipariş:', '✅ Bulundu');
      console.log('   Sipariş ID:', sampleOrder.id.slice(-8));
      console.log('   Müşteri:', sampleOrder.user?.name || sampleOrder.guestName || 'Belirtilmemiş');
      console.log('   Ürün sayısı:', sampleOrder.items.length);
      console.log('   E-fatura durumu:', sampleOrder.einvoiceStatus || 'Yok');
    } else {
      console.log('   Test edilebilir sipariş:', '❌ Bulunamadı');
    }
  } catch (error) {
    console.log('   Test sipariş kontrol:', '❌ Hatalı -', error.message);
  }

  // 6. Disk Alanı Kontrol
  console.log('\n💾 6. DİSK ALANI:');
  try {
    const stats = fs.statSync(process.cwd());
    console.log('   Disk erişimi:', '✅ Başarılı');
  } catch (error) {
    console.log('   Disk erişimi:', '❌ Hatalı -', error.message);
  }

  console.log('\n🎯 TANI TAMAMLANDI');
  console.log('   Bu script verilerde değişiklik yapmadı.');
  console.log('   Sorun tespit edilirse çözüm önerileri sunulacak.\n');

  await prisma.$disconnect();
}

// Script'i çalıştır
diagnoseFaturaSystem().catch(console.error); 