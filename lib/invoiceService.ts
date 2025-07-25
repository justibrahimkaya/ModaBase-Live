import PDFDocument from 'pdfkit';
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
    console.log('📄 PDF fatura oluşturuluyor...');
    console.log('📋 Invoice data:', {
      orderId: invoiceData.order.id,
      customerName: invoiceData.order.user?.name || invoiceData.order.guestName,
      total: invoiceData.order.total
    });

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
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

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    this.drawHeader(doc, invoiceData.companyInfo, invoiceNumber, invoiceData.order.createdAt, invoiceData.order.id);
    
    // Customer Information
    this.drawCustomerInfo(doc, invoiceData.order);
    
    // Items Table
    this.drawItemsTable(doc, invoiceData.order.items);
    
    // Totals
    this.drawTotals(doc, invoiceData.order);
    
    // Footer
    this.drawFooter(doc);

    doc.end();
    console.log('📝 PDF yazımı tamamlandı, dosya kaydediliyor...');

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log('✅ PDF başarıyla kaydedildi:', fileName);
        console.log('📂 Dosya konumu:', filePath);
        resolve({ filePath, fileName });
      });
      stream.on('error', (error) => {
        console.error('❌ PDF kaydetme hatası:', error);
        reject(error);
      });
    });
  }

  private static drawHeader(doc: PDFKit.PDFDocument, companyInfo: any, invoiceNumber: string, orderDate: Date, orderId?: string) {
    // Company Logo/Name
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('ModaBase', 50, 50)
       .fontSize(12)
       .font('Helvetica')
       .text(companyInfo.name, 50, 80)
       .text(companyInfo.address, 50, 95)
       .text(`Tel: ${companyInfo.phone}`, 50, 110)
       .text(`E-posta: ${companyInfo.email}`, 50, 125)
       .text(`Vergi No: ${companyInfo.taxNumber}`, 50, 140)
       .text(`Vergi Dairesi: ${companyInfo.taxOffice}`, 50, 145);

    // Invoice Info
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('E-FATURA', 400, 50)
       .fontSize(12)
       .font('Helvetica')
       .text(`Fatura No: ${invoiceNumber}`, 400, 80)
       .text(`Tarih: ${orderDate.toLocaleDateString('tr-TR')}`, 400, 95)
       .text(`Sipariş No: ${orderId?.slice(-8) || 'N/A'}`, 400, 110); // ✅ Düzeltildi
  }

  private static drawCustomerInfo(doc: PDFKit.PDFDocument, order: any) {
    console.log('👤 Müşteri bilgileri yazılıyor:', {
      user: order.user,
      guestName: order.guestName,
      guestEmail: order.guestEmail,
      address: order.address
    });

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('MÜŞTERİ BİLGİLERİ', 50, 200)
       .fontSize(12)
       .font('Helvetica');

    // ✅ İyileştirilmiş müşteri bilgisi alma
    const customerName = order.user ? 
      `${order.user.name || ''} ${order.user.surname || ''}`.trim() : 
      (order.guestName && order.guestSurname ? 
        `${order.guestName} ${order.guestSurname}` : 
        (order.guestName || 'Misafir Müşteri'));
    
    const customerEmail = order.user?.email || order.guestEmail || '';
    const customerPhone = order.user?.phone || order.guestPhone || '';

    doc.text(`Ad Soyad: ${customerName}`, 50, 225)
       .text(`E-posta: ${customerEmail}`, 50, 240)
       .text(`Telefon: ${customerPhone}`, 50, 255);

    // ✅ Address bilgisini düzgün al
    if (order.address) {
      const addressText = `${order.address.address || ''}, ${order.address.district || ''}, ${order.address.city || ''}`.replace(/^,\s*|,\s*$/g, '');
      doc.text('Teslimat Adresi:', 50, 270)
         .text(addressText, 50, 285);
    } else if (order.shippingAddress) {
      doc.text('Teslimat Adresi:', 50, 270)
         .text(order.shippingAddress, 50, 285);
    }
  }

  private static drawItemsTable(doc: PDFKit.PDFDocument, items: any[]) {
    console.log('📋 Ürün tablosu oluşturuluyor:', items.length, 'ürün');
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('ÜRÜN DETAYLARI', 50, 350)
       .fontSize(10)
       .font('Helvetica');

    // Table Headers
    const startY = 375;
    doc.text('Ürün', 50, startY)
       .text('Adet', 300, startY)
       .text('Birim Fiyat', 350, startY)
       .text('Toplam', 450, startY);

    // Table Content
    let currentY = startY + 20;
    items.forEach((item) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      // ✅ İyileştirilmiş item name alma
      const productName = item.product?.name || item.productName || 'Ürün';
      const quantity = item.quantity || 0;
      const price = item.price || 0;
      const total = price * quantity;

      console.log('📦 Ürün:', {
        name: productName,
        quantity,
        price,
        total
      });

      doc.text(productName, 50, currentY)
         .text(quantity.toString(), 300, currentY)
         .text(`${price.toFixed(2)} ₺`, 350, currentY)
         .text(`${total.toFixed(2)} ₺`, 450, currentY);

      currentY += 15;
    });
  }

  private static drawTotals(doc: PDFKit.PDFDocument, order: any) {
    // ✅ İyileştirilmiş total hesaplaması
    const subtotal = order.items.reduce((sum: number, item: any) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
    
    const shipping = order.shippingCost || order.shipping || 0;
    const total = order.total || (subtotal + shipping); // Önce order.total'ı kullan
    
    console.log('💰 Toplam hesaplama:', {
      subtotal,
      shipping,
      calculatedTotal: subtotal + shipping,
      orderTotal: order.total,
      finalTotal: total
    });

    const startY = 600;
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('TOPLAM', 350, startY)
       .font('Helvetica')
       .text(`Ara Toplam: ${subtotal.toFixed(2)} ₺`, 350, startY + 20)
       .text(`Kargo: ${shipping.toFixed(2)} ₺`, 350, startY + 35)
       .font('Helvetica-Bold')
       .text(`Genel Toplam: ${total.toFixed(2)} ₺`, 350, startY + 55);
  }

  private static drawFooter(doc: PDFKit.PDFDocument) {
    doc.fontSize(10)
       .font('Helvetica')
       .text('Bu belge elektronik ortamda oluşturulmuştur.', 50, 750)
       .text('ModaBase E-Ticaret Sistemi', 50, 765);
  }
}
