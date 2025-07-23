import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface InvoiceEmailData {
  to: string;
  customerName: string;
  orderNumber: string;
  invoiceNumber: string;
  pdfPath: string;
  totalAmount: number;
}

export class EmailService {
  private static transporter: nodemailer.Transporter;

  static initialize(config: EmailConfig) {
    this.transporter = nodemailer.createTransport(config);
  }

  static async sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `ModaBase E-Fatura - Sipariş #${data.orderNumber}`,
        html: this.generateInvoiceEmailHTML(data),
        attachments: [
          {
            filename: `fatura-${data.invoiceNumber}.pdf`,
            path: data.pdfPath
          }
        ]
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('E-posta gönderme hatası:', error);
      return false;
    }
  }

  private static generateInvoiceEmailHTML(data: InvoiceEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ModaBase E-Fatura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ModaBase</h1>
            <p>E-Fatura</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <p>Siparişiniz için e-fatura hazırlanmıştır.</p>
            
            <div style="background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              <p><strong>Fatura No:</strong> ${data.invoiceNumber}</p>
              <p><strong>Toplam Tutar:</strong> ${data.totalAmount.toFixed(2)} ₺</p>
            </div>
            
            <p>E-fatura PDF dosyası bu e-postaya eklenmiştir. Ayrıca hesabınızdan da görüntüleyebilirsiniz.</p>
            
            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" class="button">
                Siparişimi Görüntüle
              </a>
            </p>
            
            <p>Teşekkürler,<br>ModaBase Ekibi</p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase e-ticaret sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2024 ModaBase. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static async sendOrderConfirmation(to: string, customerName: string, orderNumber: string, totalAmount: number): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: to,
        subject: `Sipariş Onayı - ModaBase #${orderNumber}`,
        html: this.generateOrderConfirmationHTML(customerName, orderNumber, totalAmount)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Sipariş onay e-postası gönderme hatası:', error);
      return false;
    }
  }

  private static generateOrderConfirmationHTML(customerName: string, orderNumber: string, totalAmount: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Sipariş Onayı - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          .button { background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ModaBase</h1>
            <p>Sipariş Onayı</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${customerName},</h2>
            
            <p>Siparişiniz başarıyla alınmıştır ve işleme alınmıştır.</p>
            
            <div style="background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Sipariş No:</strong> ${orderNumber}</p>
              <p><strong>Toplam Tutar:</strong> ${totalAmount.toFixed(2)} ₺</p>
              <p><strong>Durum:</strong> İşleme Alındı</p>
            </div>
            
            <p>Siparişinizin durumunu takip etmek için aşağıdaki butona tıklayabilirsiniz.</p>
            
            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" class="button">
                Siparişimi Takip Et
              </a>
            </p>
            
            <p>Teşekkürler,<br>ModaBase Ekibi</p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase e-ticaret sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2024 ModaBase. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Stok bildirimi email gönderme
  static async sendStockNotificationEmail(
    to: string, 
    productName: string, 
    productId: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: to,
        subject: `🔔 Stok Bildirimi - ${productName} Stokta!`,
        html: this.generateStockNotificationHTML(productName, productId)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Stok bildirimi e-postası gönderme hatası:', error);
      return false;
    }
  }

  private static generateStockNotificationHTML(
    productName: string, 
    productId: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Stok Bildirimi - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .product-card { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .bell-icon { font-size: 48px; margin-bottom: 10px; }
          .stock-badge { background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="bell-icon">🔔</div>
            <h1 style="margin: 0;">Harika Haber!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">İstediğiniz ürün stokta!</p>
          </div>
          
          <div class="content">
            <h2>Merhaba,</h2>
            
            <p>Stok bildirimi için beklediğiniz ürün nihayet stokta! 🎉</p>
            
            <div class="product-card">
              <h3 style="margin: 0 0 10px 0; color: #333;">
                📦 ${productName}
              </h3>
              <p style="margin: 0; color: #666;">
                <span class="stock-badge">STOKTA</span>
              </p>
            </div>
            
            <p>Bu ürün çok popüler olduğu için stoklar hızla tükeniyor. Şimdi sipariş vererek kaçırmayın!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/product/${productId}" class="cta-button">
                🛒 Hemen Sipariş Ver
              </a>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0; font-size: 14px;">
                <strong>💡 İpucu:</strong> Stok durumu sürekli değişiyor. En iyi seçenekleri kaçırmamak için hemen göz atın!
              </p>
            </div>
            
            <p>Keyifli alışverişler,<br>
            <strong>ModaBase Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta, stok bildirimi talebiniz üzerine ModaBase tarafından gönderilmiştir.</p>
            <p>Artık bildirim almak istemiyorsanız, hesabınızdan stok bildirimlerinizi yönetebilirsiniz.</p>
            <p>© 2024 ModaBase. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Business Application Email Functions
  static async sendBusinessApplicationNotification(businessData: {
    businessName: string;
    contactName: string;
    contactSurname: string;
    email: string;
    city: string;
    businessType: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: 'info@modabase.com', // Süper admin email
        subject: `🆕 Yeni İşletme Başvurusu - ${businessData.businessName}`,
        html: this.generateNewApplicationHTML(businessData)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('İşletme başvuru bildirimi e-postası gönderme hatası:', error);
      return false;
    }
  }

  static async sendBusinessApprovalEmail(email: string, businessName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: email,
        subject: `🎉 Başvurunuz Onaylandı - ${businessName}`,
        html: this.generateApprovalEmailHTML(businessName)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Onay e-postası gönderme hatası:', error);
      return false;
    }
  }

  static async sendBusinessRejectionEmail(email: string, businessName: string, reason: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: email,
        subject: `❌ Başvuru Sonucu - ${businessName}`,
        html: this.generateRejectionEmailHTML(businessName, reason)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Red e-postası gönderme hatası:', error);
      return false;
    }
  }

  // Transfer bildirimi e-postası gönderme
  static async sendTransferNotification(data: {
    to: string;
    businessName: string;
    orderId: string;
    amount: number;
    iban: string;
    accountHolder: string;
    bankName: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `💰 Transfer Bildirimi - Sipariş #${data.orderId}`,
        html: this.generateTransferNotificationHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Transfer bildirimi e-postası gönderme hatası:', error);
      return false;
    }
  }

  // Havale talimatları e-postası gönderme
  static async sendBankTransferInstructions(data: {
    to: string;
    customerName: string;
    orderId: string;
    amount: number;
    iban: string;
    accountHolder: string;
    bankName: string;
    bankBranch: string;
    transferNote: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `🏦 Havale Talimatları - Sipariş #${data.orderId}`,
        html: this.generateBankTransferInstructionsHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Havale talimatları e-postası gönderme hatası:', error);
      return false;
    }
  }

  private static generateNewApplicationHTML(businessData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Yeni İşletme Başvurusu - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .business-card { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🆕 Yeni İşletme Başvurusu</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Onay bekleyen başvuru var</p>
          </div>
          
          <div class="content">
            <h2>Merhaba Admin,</h2>
            
            <p>Yeni bir işletme başvurusu alındı ve onayınızı bekliyor.</p>
            
            <div class="business-card">
              <h3 style="margin: 0 0 15px 0; color: #333;">${businessData.businessName}</h3>
              <p><strong>İletişim:</strong> ${businessData.contactName} ${businessData.contactSurname}</p>
              <p><strong>E-posta:</strong> ${businessData.email}</p>
              <p><strong>Şehir:</strong> ${businessData.city}</p>
              <p><strong>İşletme Türü:</strong> ${businessData.businessType}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/business-approvals" class="cta-button">
                📋 Başvuruları İncele
              </a>
            </div>
            
            <p>Bu başvuruyu incelemek ve onaylamak için admin paneline giriş yapın.</p>
            
            <p>Saygılarımızla,<br>
            <strong>ModaBase Sistemi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta otomatik olarak ModaBase sistemi tarafından gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateApprovalEmailHTML(businessName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Başvuru Onaylandı - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .success-card { background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Tebrikler!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Başvurunuz onaylandı</p>
          </div>
          
          <div class="content">
            <h2>Sevgili ${businessName} Ekibi,</h2>
            
            <div class="success-card">
              <h3 style="margin: 0 0 10px 0; color: #155724;">✅ Başvuru Durumu: ONAYLANDI</h3>
              <p style="margin: 0; color: #155724;">ModaBase platformuna hoş geldiniz!</p>
            </div>
            
            <p>İşletme başvurunuz başarıyla onaylanmıştır. Artık ModaBase admin paneline giriş yaparak:</p>
            
            <ul>
              <li>Ürünlerinizi ekleyebilir</li>
              <li>Siparişlerinizi yönetebilir</li>
              <li>Stok takibi yapabilir</li>
              <li>Satış raporlarınızı görüntüleyebilir</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login" class="cta-button">
                🚀 Admin Paneline Giriş Yap
              </a>
            </div>
            
            <p>Herhangi bir sorunuz olduğunda bizimle iletişime geçmekten çekinmeyin.</p>
            
            <p>Başarılı satışlar dileriz,<br>
            <strong>ModaBase Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>E-posta: info@modabase.com | Web: www.modabase.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateRejectionEmailHTML(businessName: string, reason: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Başvuru Sonucu - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .rejection-card { background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📋 Başvuru Sonucu</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">ModaBase İşletme Başvurusu</p>
          </div>
          
          <div class="content">
            <h2>Sevgili ${businessName} Ekibi,</h2>
            
            <p>ModaBase platformu için yapmış olduğunuz işletme başvurunuz değerlendirilmiştir.</p>
            
            <div class="rejection-card">
              <h3 style="margin: 0 0 10px 0; color: #721c24;">❌ Başvuru Durumu: REDDEDİLDİ</h3>
              <p style="margin: 0; color: #721c24;"><strong>Sebep:</strong> ${reason}</p>
            </div>
            
            <p>Başvurunuzun reddedilme sebebini yukarıda görebilirsiniz. Bu durumu düzelttikten sonra tekrar başvuru yapabilirsiniz.</p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0; font-size: 14px;">
                <strong>💡 İpucu:</strong> Tekrar başvuru yapmadan önce lütfen başvuru şartlarımızı gözden geçirin.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/register" class="cta-button">
                🔄 Tekrar Başvur
              </a>
            </div>
            
            <p>Herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz.</p>
            
            <p>Saygılarımızla,<br>
            <strong>ModaBase Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>E-posta: info@modabase.com | Web: www.modabase.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateTransferNotificationHTML(data: {
    businessName: string;
    orderId: string;
    amount: number;
    iban: string;
    accountHolder: string;
    bankName: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Transfer Bildirimi - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .transfer-box { background: #f8fff9; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #27ae60; }
          .amount { font-size: 24px; font-weight: bold; color: #27ae60; text-align: center; margin: 20px 0; }
          .bank-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">💰 Transfer Bildirimi</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Yeni bir ödeme transferi gerçekleşti</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.businessName},</h2>
            
            <p>Yeni bir sipariş ödemesi hesabınıza transfer edildi.</p>
            
            <div class="transfer-box">
              <h3 style="margin: 0 0 15px 0; color: #27ae60;">Transfer Detayları:</h3>
              
              <div class="amount">
                ${data.amount.toLocaleString('tr-TR')} ₺
              </div>
              
              <div class="bank-info">
                <p><strong>Sipariş No:</strong> #${data.orderId}</p>
                <p><strong>Banka:</strong> ${data.bankName}</p>
                <p><strong>Hesap Sahibi:</strong> ${data.accountHolder}</p>
                <p><strong>IBAN:</strong> ${data.iban}</p>
                <p><strong>Transfer Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
            
            <p><strong>Not:</strong> Transfer işlemi 1-3 iş günü içinde hesabınıza yansıyacaktır.</p>
            
            <p>Transfer durumunu kontrol etmek için bankanızla iletişime geçebilirsiniz.</p>
            
            <p>Saygılarımızla,<br>
            <strong>ModaBase Finans Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta otomatik olarak ModaBase sistemi tarafından gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateBankTransferInstructionsHTML(data: {
    customerName: string;
    orderId: string;
    amount: number;
    iban: string;
    accountHolder: string;
    bankName: string;
    bankBranch: string;
    transferNote: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Havale Talimatları - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .bank-box { background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #1e40af; }
          .amount { font-size: 24px; font-weight: bold; color: #1e40af; text-align: center; margin: 20px 0; }
          .bank-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .steps { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🏦 Havale Talimatları</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Siparişiniz için havale bilgileri</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <p>Siparişiniz için havale yapmanız gereken banka bilgileri aşağıdadır.</p>
            
            <div class="bank-box">
              <h3 style="margin: 0 0 15px 0; color: #1e40af;">Havale Bilgileri:</h3>
              
              <div class="amount">
                ${data.amount.toLocaleString('tr-TR')} ₺
              </div>
              
              <div class="bank-info">
                <p><strong>Sipariş No:</strong> #${data.orderId}</p>
                <p><strong>Banka:</strong> ${data.bankName}</p>
                <p><strong>Şube:</strong> ${data.bankBranch}</p>
                <p><strong>Hesap Sahibi:</strong> ${data.accountHolder}</p>
                <p><strong>IBAN:</strong> ${data.iban}</p>
                <p><strong>Açıklama:</strong> ${data.transferNote || 'Sipariş #' + data.orderId}</p>
              </div>
            </div>
            
            <div class="steps">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">Havale Adımları:</h4>
              <ol style="margin: 0; padding-left: 20px;">
                <li>Banka uygulamanızı açın</li>
                <li>Havale/EFT menüsüne gidin</li>
                <li>IBAN numarasını girin: <strong>${data.iban}</strong></li>
                <li>Tutarı girin: <strong>${data.amount.toLocaleString('tr-TR')} ₺</strong></li>
                <li>Açıklama kısmına: <strong>${data.transferNote || 'Sipariş #' + data.orderId}</strong> yazın</li>
                <li>Havaleyi gerçekleştirin</li>
              </ol>
            </div>
            
            <p><strong>Önemli:</strong> Havale yaptıktan sonra siparişiniz 1-2 iş günü içinde onaylanacaktır.</p>
            
            <p>Herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz.</p>
            
            <p>Saygılarımızla,<br>
            <strong>ModaBase Finans Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta otomatik olarak ModaBase sistemi tarafından gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Şifre sıfırlama e-postası gönderme
  static async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Kavram Triko <kavram.triko@gmail.com>',
        to: to,
        subject: '🔐 Şifre Sıfırlama - Kavram Triko',
        html: this.generatePasswordResetHTML(resetUrl)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Şifre sıfırlama e-postası gönderme hatası:', error);
      return false;
    }
  }

  private static generatePasswordResetHTML(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Şifre Sıfırlama - Kavram Triko</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .reset-card { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 Şifre Sıfırlama</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Kavram Triko Hesabınız</p>
          </div>
          
          <div class="content">
            <h2>Merhaba,</h2>
            
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            
            <div class="reset-card">
              <h3 style="margin: 0 0 15px 0; color: #333;">Şifrenizi Sıfırlamak İçin:</h3>
              <p style="margin: 0; color: #666;">Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="cta-button">
                🔑 Şifremi Sıfırla
              </a>
            </div>
            
            <div class="warning">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Güvenlik Uyarısı:</strong><br>
                • Bu link 30 dakika geçerlidir<br>
                • Linki kimseyle paylaşmayın<br>
                • Eğer şifrenizi hatırladıysanız, bu e-postayı silin
              </p>
            </div>
            
            <p>Eğer buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayabilirsiniz:</p>
            <p style="word-break: break-all; color: #667eea; font-size: 12px;">
              ${resetUrl}
            </p>
            
            <p>Teşekkürler,<br>
            <strong>Kavram Triko Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta Kavram Triko e-ticaret sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>E-posta: kavram.triko@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Sipariş reddetme e-postası gönderme
  static async sendOrderRejection(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    reason: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `ModaBase - Sipariş Reddedildi #${data.orderNumber}`,
        html: this.generateOrderRejectionHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Sipariş reddetme e-postası gönderme hatası:', error);
      return false;
    }
  }

  // Sipariş onaylama e-postası gönderme
  static async sendOrderApproval(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `ModaBase - Sipariş Onaylandı #${data.orderNumber}`,
        html: this.generateOrderApprovalHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Sipariş onaylama e-postası gönderme hatası:', error);
      return false;
    }
  }

  private static generateOrderRejectionHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    reason: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): string {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} ₺</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Sipariş Reddedildi - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">❌ Sipariş Reddedildi</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <p>Maalesef siparişiniz reddedilmiştir. Aşağıda sipariş detayları ve reddetme sebebi bulunmaktadır.</p>
            
            <div class="order-info">
              <h3 style="margin: 0 0 15px 0; color: #dc3545;">Sipariş Bilgileri</h3>
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              <p><strong>Toplam Tutar:</strong> ${data.totalAmount.toFixed(2)} ₺</p>
              <p><strong>Reddetme Sebebi:</strong> ${data.reason}</p>
            </div>
            
            <h3>Sipariş İçeriği:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Adet</th>
                  <th>Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <p>Eğer bu karar hakkında sorularınız varsa, lütfen bizimle iletişime geçin.</p>
            
            <p>Teşekkürler,<br>
            <strong>ModaBase Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase e-ticaret sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2024 ModaBase. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Yeni sipariş bildirimi e-postası gönderme (işletme sahibine)
  static async sendNewOrderNotification(data: {
    to: string;
    businessName: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `🆕 Yeni Sipariş #${data.orderNumber} - ${data.businessName}`,
        html: this.generateNewOrderNotificationHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Yeni sipariş bildirimi e-postası gönderme hatası:', error);
      return false;
    }
  }

  // Ödeme başarılı bildirimi e-postası gönderme (işletme sahibine)
  static async sendPaymentSuccessNotification(data: {
    to: string;
    businessName: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `💰 Ödeme Başarılı #${data.orderNumber} - ${data.businessName}`,
        html: this.generatePaymentSuccessNotificationHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Ödeme başarılı bildirimi e-postası gönderme hatası:', error);
      return false;
    }
  }

  // Ödeme talimatları e-postası gönderme (müşteriye)
  static async sendPaymentInstructions(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `💳 Ödeme Talimatları - Sipariş #${data.orderNumber}`,
        html: this.generatePaymentInstructionsHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Ödeme talimatları e-postası gönderme hatası:', error);
      return false;
    }
  }

  private static generateOrderApprovalHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): string {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} ₺</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Sipariş Onaylandı - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Sipariş Onaylandı</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <p>Siparişiniz başarıyla onaylanmıştır! Siparişiniz hazırlanmaya başlanacak ve en kısa sürede kargoya verilecektir.</p>
            
            <div class="order-info">
              <h3 style="margin: 0 0 15px 0; color: #28a745;">Sipariş Bilgileri</h3>
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              <p><strong>Toplam Tutar:</strong> ${data.totalAmount.toFixed(2)} ₺</p>
              <p><strong>Durum:</strong> Onaylandı</p>
            </div>
            
            <h3>Sipariş İçeriği:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Adet</th>
                  <th>Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <p>Siparişinizin durumunu takip etmek için hesabınızdan siparişler sayfasını ziyaret edebilirsiniz.</p>
            
            <p>Teşekkürler,<br>
            <strong>ModaBase Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase e-ticaret sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2024 ModaBase. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateNewOrderNotificationHTML(data: {
    businessName: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): string {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} ₺</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Yeni Sipariş - ${data.businessName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #007bff; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🆕 Yeni Sipariş</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.businessName}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba,</h2>
            
            <p>Yeni bir sipariş alındı! Aşağıda sipariş detayları bulunmaktadır.</p>
            
            <div class="order-info">
              <h3 style="margin: 0 0 15px 0; color: #007bff;">Sipariş Bilgileri</h3>
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              <p><strong>Müşteri:</strong> ${data.customerName}</p>
              <p><strong>E-posta:</strong> ${data.customerEmail}</p>
              <p><strong>Toplam Tutar:</strong> ${data.totalAmount.toFixed(2)} ₺</p>
              <p><strong>Ödeme Yöntemi:</strong> ${data.paymentMethod}</p>
            </div>
            
            <h3>Sipariş İçeriği:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Adet</th>
                  <th>Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.modabase.com.tr'}/admin/orders/${data.orderId}" class="cta-button">
                📋 Siparişi Görüntüle
              </a>
            </div>
            
            <p>Bu siparişi inceleyip onaylayabilir veya reddedebilirsiniz.</p>
            
            <p>Teşekkürler,<br>
            <strong>ModaBase Sistemi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase e-ticaret sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2024 ModaBase. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generatePaymentSuccessNotificationHTML(data: {
    businessName: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): string {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} ₺</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ödeme Başarılı - ${data.businessName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">💰 Ödeme Başarılı</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.businessName}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba,</h2>
            
            <p>Bir sipariş için ödeme başarıyla alındı! Aşağıda sipariş detayları bulunmaktadır.</p>
            
            <div class="order-info">
              <h3 style="margin: 0 0 15px 0; color: #28a745;">Sipariş Bilgileri</h3>
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              <p><strong>Müşteri:</strong> ${data.customerName}</p>
              <p><strong>E-posta:</strong> ${data.customerEmail}</p>
              <p><strong>Toplam Tutar:</strong> ${data.totalAmount.toFixed(2)} ₺</p>
              <p><strong>Ödeme Yöntemi:</strong> ${data.paymentMethod}</p>
              <p><strong>Durum:</strong> ✅ Ödendi</p>
            </div>
            
            <h3>Sipariş İçeriği:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Adet</th>
                  <th>Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.modabase.com.tr'}/admin/orders/${data.orderId}" class="cta-button">
                📋 Siparişi Görüntüle
              </a>
            </div>
            
            <p>Bu sipariş artık hazırlanmaya başlanabilir ve kargoya verilebilir.</p>
            
            <p>Teşekkürler,<br>
            <strong>ModaBase Sistemi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase e-ticaret sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2024 ModaBase. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generatePaymentInstructionsHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): string {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} ₺</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ödeme Talimatları - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .payment-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">💳 Ödeme Talimatları</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <p>Siparişiniz onaylanmıştır! Ödeme yapmak için aşağıdaki talimatları takip edin.</p>
            
            <div class="order-info">
              <h3 style="margin: 0 0 15px 0; color: #333;">Sipariş Bilgileri</h3>
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              <p><strong>Toplam Tutar:</strong> ${data.totalAmount.toFixed(2)} ₺</p>
              <p><strong>Ödeme Yöntemi:</strong> ${data.paymentMethod}</p>
            </div>
            
            <div class="payment-info">
              <h3 style="margin: 0 0 15px 0; color: #856404;">Ödeme Talimatları</h3>
              ${data.paymentMethod === 'BANK_TRANSFER' ? `
                <p><strong>Banka Transferi:</strong></p>
                <p>• IBAN: TR12 3456 7890 1234 5678 9012 34</p>
                <p>• Hesap Sahibi: ModaBase</p>
                <p>• Açıklama: Sipariş #${data.orderNumber}</p>
                <p>• Transfer sonrası dekontu info@modabase.com.tr adresine gönderin.</p>
              ` : `
                <p><strong>Kredi Kartı ile Ödeme:</strong></p>
                <p>Aşağıdaki butona tıklayarak güvenli ödeme sayfasına yönlendirileceksiniz.</p>
              `}
            </div>
            
            <h3>Sipariş İçeriği:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Adet</th>
                  <th>Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.modabase.com.tr'}/order/${data.orderId}" class="cta-button">
                💳 Ödeme Yap
              </a>
            </div>
            
            <p><strong>Önemli:</strong> Ödeme yapılmadan siparişiniz hazırlanmayacaktır.</p>
            
            <p>Teşekkürler,<br>
            <strong>ModaBase Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase e-ticaret sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2024 ModaBase. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
