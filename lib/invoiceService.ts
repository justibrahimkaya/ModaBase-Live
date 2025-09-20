import jsPDF from 'jspdf';
import fs from 'fs';
import path from 'path';

export interface InvoiceData {
  order: any; // Order with items and user
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxNumber: string;
    taxOffice: string;
  };
}

export class InvoiceService {
  private static generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  }

  static async generateInvoicePDF(invoiceData: InvoiceData): Promise<{ filePath: string; fileName: string }> {
    console.log('📄 PDF fatura oluşturuluyor (jsPDF ile)...');
    console.log('📋 Invoice data:', {
      orderId: invoiceData.order.id,
      customerName: invoiceData.order.user?.name || invoiceData.order.guestName,
      total: invoiceData.order.total
    });

    // jsPDF ile yeni PDF oluştur (font sorunu yok!)
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    });

    const invoiceNumber = this.generateInvoiceNumber();
    const fileName = `invoice-${invoiceNumber}.pdf`;
    const filePath = path.join(process.cwd(), 'public', 'invoices', fileName);

    console.log('📁 Dosya yolu:', filePath);

    // Ensure invoices directory exists
    const invoicesDir = path.dirname(filePath);
    console.log('📂 Klasör yolu:', invoicesDir);
    
    if (!fs.existsSync(invoicesDir)) {
      console.log('📂 Klasör oluşturuluyor:', invoicesDir);
      fs.mkdirSync(invoicesDir, { recursive: true });
    } else {
      console.log('✅ Klasör zaten mevcut');
    }

    // PDF İçeriği Oluştur (jsPDF style)
    this.drawjsPDFContent(doc, invoiceData, invoiceNumber);

    // PDF'i dosya olarak kaydet
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(filePath, pdfBuffer);

    console.log('✅ PDF başarıyla kaydedildi:', fileName);
    console.log('📂 Dosya konumu:', filePath);
    
    return { filePath, fileName };
  }

  private static drawjsPDFContent(doc: jsPDF, invoiceData: InvoiceData, invoiceNumber: string) {
    const { order, companyInfo } = invoiceData;
    
    // ====================
    // PROFESYONEL HEADER
    // ====================
    
    // Mavi header background
    doc.setFillColor(41, 128, 185); // Mavi renk
    doc.rect(0, 0, 210, 40, 'F'); // Header kutusu
    
    // Beyaz logo/başlık metni
    doc.setTextColor(255, 255, 255); // Beyaz renk
    doc.setFontSize(24);
    doc.text('ModaBase', 15, 20);
    doc.setFontSize(14);
    doc.text('E-FATURA', 15, 30);
    
    // Fatura numarası sağda (beyaz)
    doc.setFontSize(12);
    doc.text(`FATURA NO: ${invoiceNumber}`, 120, 20);
    doc.text(`TARIH: ${new Date().toLocaleDateString('tr-TR')}`, 120, 30);
    
    // Siyah renge dön
    doc.setTextColor(0, 0, 0);
    
    // ====================
    // SIRKET BILGILERI (SOL)
    // ====================
    
    doc.setFontSize(11);
    doc.text('FIRMA BILGILERI', 15, 55);
    
    // Gri kutu
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, 60, 85, 40); // Yüksekliği artırdık
    
    doc.setFontSize(8); // Font boyutunu küçülttük
    doc.text(companyInfo.name, 18, 68);
    
    // Adres uzunsa böl
    const address = companyInfo.address;
    if (address.length > 35) {
      const firstLine = address.substring(0, 35);
      const secondLine = address.substring(35);
      doc.text(firstLine, 18, 75);
      doc.text(secondLine, 18, 82);
      doc.text(`Tel: ${companyInfo.phone}`, 18, 89);
      doc.text(`E-posta: ${companyInfo.email}`, 18, 96);
    } else {
      doc.text(address, 18, 75);
      doc.text(`Tel: ${companyInfo.phone}`, 18, 82);
      doc.text(`E-posta: ${companyInfo.email}`, 18, 89);
    }
    
    // ====================
    // SIPARIS BILGILERI (SAG)
    // ====================
    
    doc.setFontSize(11);
    doc.text('SIPARIS BILGILERI', 110, 55);
    
    // Gri kutu
    doc.rect(110, 60, 85, 40); // Yüksekliği artırdık
    
    doc.setFontSize(8);
    doc.text(`Siparis No: ${order.id.slice(-8)}`, 113, 68);
    doc.text(`Durum: ${order.status}`, 113, 75);
    doc.text(`Odeme: ${order.paymentMethod || 'Havale/EFT'}`, 113, 82);
    doc.text(`Vergi No: ${companyInfo.taxNumber}`, 113, 89);
    
    // ====================
    // MUSTERI BILGILERI
    // ====================
    
    const customerName = order.user?.name || order.guestName || 'Misafir Musteri';
    const customerEmail = order.user?.email || order.guestEmail || '';
    const customerPhone = order.user?.phone || order.guestPhone || '';
    
    doc.setFontSize(11);
    doc.text('MUSTERI BILGILERI', 15, 115); // Pozisyonu aşağı aldık
    
    // Açık mavi kutu
    doc.setFillColor(236, 245, 255);
    doc.rect(15, 120, 180, 30, 'F'); // Yüksekliği artırdık
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, 120, 180, 30);
    
    doc.setFontSize(9);
    doc.text(`Ad Soyad: ${customerName}`, 18, 128);
    doc.text(`E-posta: ${customerEmail}`, 18, 135);
    if (customerPhone) doc.text(`Telefon: ${customerPhone}`, 18, 142);
    
    // Adres bilgisi
    if (order.address) {
      const addressText = `${order.address.address || ''}, ${order.address.district || ''}, ${order.address.city || ''}`.replace(/^,\s*|,\s*$/g, '');
      if (addressText.length > 50) {
        const firstLine = addressText.substring(0, 50);
        const secondLine = addressText.substring(50, 100);
        doc.text(`Adres: ${firstLine}`, 120, 128);
        doc.text(secondLine, 120, 135);
      } else {
        doc.text(`Adres: ${addressText}`, 120, 128);
      }
    }
    
    // ====================
    // URUN TABLOSU
    // ====================
    
    doc.setFontSize(12);
    doc.text('URUN DETAYLARI', 15, 165); // Pozisyonu aşağı aldık
    
    // Tablo header (koyu mavi)
    doc.setFillColor(52, 73, 94);
    doc.rect(15, 170, 180, 12, 'F'); // Yüksekliği artırdık
    
    // Header metinleri (beyaz)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('URUN ADI', 18, 178);
    doc.text('ADET', 110, 178);
    doc.text('BIRIM FIYAT', 135, 178);
    doc.text('TOPLAM', 165, 178);
    
    // Siyah renge dön
    doc.setTextColor(0, 0, 0);
    
    // Tablo çizgileri
    doc.setDrawColor(200, 200, 200);
    
    let yPos = 190; // Başlangıç pozisyonunu aşağı aldık
    order.items.forEach((item: any, index: number) => {
      const productName = item.product?.name || 'Urun';
      const quantity = item.quantity || 0;
      const price = item.price || 0;
      const total = price * quantity;
      
      // Alternatif satır rengi
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(15, yPos - 6, 180, 12, 'F'); // Yüksekliği artırdık
      }
      
      doc.setFontSize(8); // Font boyutunu küçülttük
      doc.text(productName.substring(0, 30), 18, yPos);
      doc.text(quantity.toString(), 113, yPos);
      doc.text(`${price.toFixed(2)} TL`, 138, yPos); // ₺ yerine TL
      doc.text(`${total.toFixed(2)} TL`, 168, yPos); // ₺ yerine TL
      
      // Alt çizgi
      doc.line(15, yPos + 3, 195, yPos + 3);
      
      yPos += 14; // Satır aralığını artırdık
    });
    
    // ====================
    // TOPLAM HESAPLAMA
    // ====================
    
    const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shipping = order.shippingCost || 0;
    const finalTotal = order.total || (subtotal + shipping);
    
    // Toplam kutusu (sağda)
    yPos += 15; // Daha fazla boşluk
    doc.setFillColor(236, 245, 255);
    doc.rect(120, yPos, 75, 35, 'F'); // Yüksekliği artırdık
    doc.setDrawColor(41, 128, 185);
    doc.rect(120, yPos, 75, 35);
    
    doc.setFontSize(9);
    doc.text(`Ara Toplam:`, 125, yPos + 10);
    doc.text(`${subtotal.toFixed(2)} TL`, 165, yPos + 10); // ₺ yerine TL
    
    doc.text(`Kargo:`, 125, yPos + 18);
    doc.text(`${shipping.toFixed(2)} TL`, 165, yPos + 18); // ₺ yerine TL
    
    // Genel toplam (kalın)
    doc.setFontSize(11);
    doc.text(`GENEL TOPLAM:`, 125, yPos + 28);
    doc.text(`${finalTotal.toFixed(2)} TL`, 160, yPos + 28); // ₺ yerine TL
    
    // ====================
    // ALT BILGI
    // ====================
    
    yPos += 55; // Daha fazla boşluk
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Bu belge elektronik ortamda olusturulmus olup yasal gecerliligi sahiptir.', 15, yPos);
    doc.text('ModaBase E-Ticaret Sistemi | modabase.com.tr | info@modabase.com.tr', 15, yPos + 8);
    
    // QR kod placeholder (opsiyonel)
    doc.setDrawColor(200, 200, 200);
    doc.rect(170, yPos - 20, 20, 20);
    doc.setFontSize(6);
    doc.text('QR', 178, yPos - 10);
  }
}
