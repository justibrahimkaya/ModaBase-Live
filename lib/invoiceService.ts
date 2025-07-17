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
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const invoiceNumber = this.generateInvoiceNumber();
    const fileName = `invoice-${invoiceNumber}.pdf`;
    const filePath = path.join(process.cwd(), 'public', 'invoices', fileName);

    // Ensure invoices directory exists
    const invoicesDir = path.dirname(filePath);
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    this.drawHeader(doc, invoiceData.companyInfo, invoiceNumber, invoiceData.order.createdAt);
    
    // Customer Information
    this.drawCustomerInfo(doc, invoiceData.order);
    
    // Items Table
    this.drawItemsTable(doc, invoiceData.order.items);
    
    // Totals
    this.drawTotals(doc, invoiceData.order);
    
    // Footer
    this.drawFooter(doc);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve({ filePath, fileName });
      });
      stream.on('error', reject);
    });
  }

  private static drawHeader(doc: PDFKit.PDFDocument, companyInfo: any, invoiceNumber: string, orderDate: Date) {
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
       .text(`Sipariş No: ${orderDate}`, 400, 110);
  }

  private static drawCustomerInfo(doc: PDFKit.PDFDocument, order: any) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('MÜŞTERİ BİLGİLERİ', 50, 200)
       .fontSize(12)
       .font('Helvetica');

    const customerName = order.user?.name || order.guestName || 'Misafir Müşteri';
    const customerEmail = order.user?.email || order.guestEmail;
    const customerPhone = order.user?.phone || order.guestPhone;

    doc.text(`Ad Soyad: ${customerName}`, 50, 225)
       .text(`E-posta: ${customerEmail}`, 50, 240)
       .text(`Telefon: ${customerPhone}`, 50, 255);

    if (order.shippingAddress) {
      doc.text('Teslimat Adresi:', 50, 270)
         .text(order.shippingAddress, 50, 285);
    }
  }

  private static drawItemsTable(doc: PDFKit.PDFDocument, items: any[]) {
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

      doc.text(item.productName || 'Ürün', 50, currentY)
         .text(item.quantity.toString(), 300, currentY)
         .text(`${item.price.toFixed(2)} ₺`, 350, currentY)
         .text(`${(item.price * item.quantity).toFixed(2)} ₺`, 450, currentY);

      currentY += 15;
    });
  }

  private static drawTotals(doc: PDFKit.PDFDocument, order: any) {
    const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shipping = order.shippingCost || 0;
    const total = subtotal + shipping;

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
