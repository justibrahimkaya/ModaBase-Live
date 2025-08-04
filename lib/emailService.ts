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
    console.log('📧 EmailService initialize ediliyor...');
    console.log('📧 Config:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass ? '***SET***' : 'MISSING'
      }
    });
    
    try {
      this.transporter = nodemailer.createTransport(config);
      console.log('✅ EmailService başarıyla initialize edildi');
    } catch (error) {
      console.error('❌ EmailService initialize hatası:', error);
      throw error;
    }
  }

  // Otomatik initialize kontrolü
  private static ensureInitialized() {
    if (!this.transporter) {
      console.log('📧 EmailService otomatik initialize ediliyor...');
      console.log('📧 SMTP Ayarları:', {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || '587',
        user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
        pass: process.env.SMTP_PASS ? '***SET***' : 'MISSING',
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr'
      });
      
      this.initialize({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'kavram.triko@gmail.com',
          pass: process.env.SMTP_PASS || 'yqarfkyevahfnenq'
        }
      });
    }
  }

  static async sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
    try {
      this.ensureInitialized();
      
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
      console.log('✅ E-fatura e-postası gönderildi:', data.to);
      return true;
    } catch (error) {
      console.error('❌ E-posta gönderme hatası:', error);
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
      this.ensureInitialized();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: to,
        subject: `Sipariş Onayı - ModaBase #${orderNumber}`,
        html: this.generateOrderConfirmationHTML(customerName, orderNumber, totalAmount)
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Sipariş onay e-postası gönderildi:', to);
      return true;
    } catch (error) {
      console.error('❌ Sipariş onay e-postası gönderme hatası:', error);
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
        to: 'info@modabase.com.tr', // Süper admin email
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
      console.log('📧 sendBankTransferInstructions başlatılıyor...');
      this.ensureInitialized();
      
      console.log('📧 Mail options hazırlanıyor...');
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `🏦 Havale Talimatları - Sipariş #${data.orderId}`,
        html: this.generateBankTransferInstructionsHTML(data)
      };

      console.log('📧 Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        htmlLength: mailOptions.html.length
      });

      console.log('📧 Email gönderiliyor...');
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Havale talimatları e-postası gönderildi:', data.to);
      console.log('✅ Email sonucu:', result);
      return true;
    } catch (error) {
      console.error('❌ Havale talimatları e-postası gönderme hatası:', error);
      console.error('❌ Hata detayları:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any).code,
        command: (error as any).command
      });
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
            <p>E-posta: info@modabase.com.tr | Web: modabase.com.tr</p>
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
            <p>E-posta: info@modabase.com.tr | Web: modabase.com.tr</p>
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
      console.log('📧 sendPasswordResetEmail başlatılıyor...');
      this.ensureInitialized();
      
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Kavram Triko <kavram.triko@gmail.com>',
        to: to,
        subject: '🔐 Şifre Sıfırlama - Kavram Triko',
        html: this.generatePasswordResetHTML(resetUrl)
      };

      console.log('📧 Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        resetUrl: resetUrl
      });

      console.log('📧 Email gönderiliyor...');
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Şifre sıfırlama e-postası gönderildi:', to);
      console.log('✅ Email sonucu:', result);
      return true;
    } catch (error) {
      console.error('❌ Şifre sıfırlama e-postası gönderme hatası:', error);
      console.error('❌ Hata detayları:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any).code,
        command: (error as any).command
      });
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
        subject: `❌ Sipariş İptal Edildi - ModaBase #${data.orderNumber}`,
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
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
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
            <div style="font-size: 60px; margin-bottom: 15px;">❌</div>
            <h1 style="margin: 0;">Sipariş İptal Edildi</h1>
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
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="mailto:info@modabase.com.tr" 
                 style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                📞 Müşteri Hizmetleri
              </a>
            </p>
            
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

  // ✅ YENİ: Sipariş onayı + ödeme talimatları (tek mail)
  static async sendOrderApprovalWithPaymentInstructions(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    invoicePdfPath?: string | undefined;
  }): Promise<boolean> {
    try {
      const mailOptions: any = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `✅ Siparişiniz Onaylandı! Ödeme Bilgileri - #${data.orderNumber}`,
        html: this.generateOrderApprovalWithPaymentHTML(data)
      };

      // E-fatura PDF'i varsa attach et
      if (data.invoicePdfPath) {
        mailOptions.attachments = [
          {
            filename: `e-fatura-${data.orderNumber}.pdf`,
            path: data.invoicePdfPath
          }
        ];
      }

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Sipariş onayı + ödeme talimatları gönderildi:', data.to);
      return true;
    } catch (error) {
      console.error('❌ Sipariş onayı + ödeme talimatları gönderme hatası:', error);
      return false;
    }
  }

  // Ödeme talimatları e-postası gönderme (müşteriye) - ESKİ VERSİYON
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

  // ✅ YENİ: Sipariş onayı + ödeme talimatları HTML template
  private static generateOrderApprovalWithPaymentHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): string {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${item.price.toFixed(2)} ₺</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Siparişiniz Onaylandı - ModaBase</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 650px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .approval-banner { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
          .order-info { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #28a745; }
          .payment-section { background: #fff3cd; border: 1px solid #ffeaa7; padding: 25px; border-radius: 8px; margin: 25px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 25px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .items-table th { background: #28a745; color: white; padding: 15px; text-align: left; font-weight: bold; }
          .items-table tr:nth-child(even) { background: #f8f9fa; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #666; }
          .success-icon { font-size: 60px; margin-bottom: 15px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .bank-info { background: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .total-amount { font-size: 24px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">🎉</div>
            <h1 style="margin: 0; font-size: 28px;">Siparişiniz Onaylandı!</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <div class="approval-banner">
              <h3 style="margin: 0 0 10px 0; color: #155724;">✅ Sipariş Başarıyla Onaylandı!</h3>
              <p style="margin: 0; color: #155724;">Siparişiniz hazırlanmaya başlanacak ve en kısa sürede kargoya verilecektir.</p>
            </div>
            
            <div class="order-info">
              <h3 style="margin: 0 0 20px 0; color: #28a745;">📋 Sipariş Detayları</h3>
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              <p><strong>Toplam Tutar:</strong> <span class="total-amount">${data.totalAmount.toFixed(2)} ₺</span></p>
              <p><strong>Ödeme Yöntemi:</strong> ${data.paymentMethod}</p>
              <p><strong>Durum:</strong> <span style="color: #28a745; font-weight: bold;">Onaylandı</span></p>
            </div>
            
            <h3 style="color: #333;">🛍️ Sipariş İçeriği:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th style="text-align: center;">Adet</th>
                  <th style="text-align: right;">Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr style="background: #28a745; color: white; font-weight: bold;">
                  <td style="padding: 15px;">Toplam</td>
                  <td style="padding: 15px; text-align: center;">-</td>
                  <td style="padding: 15px; text-align: right;">${data.totalAmount.toFixed(2)} ₺</td>
                </tr>
              </tbody>
            </table>
            
            <div class="payment-section">
              <h3 style="margin: 0 0 20px 0; color: #856404;">💳 Ödeme Bilgileri</h3>
              <p style="margin-bottom: 20px; color: #856404;"><strong>Ödeme yapmak için aşağıdaki bilgileri kullanabilirsiniz:</strong></p>
              
              <div class="bank-info">
                <h4 style="margin: 0 0 15px 0; color: #1976d2;">🏦 Havale/EFT Bilgileri</h4>
                <p><strong>Banka:</strong> Garanti BBVA</p>
                <p><strong>Hesap Sahibi:</strong> Modahan İbrahim Kaya</p>
                <p><strong>IBAN:</strong> TR64 0006 2000 4560 0006 2986 57</p>
                <p><strong>Açıklama:</strong> ModaBase Sipariş #${data.orderNumber}</p>
              </div>
              
              <p style="margin-top: 20px; color: #856404;"><strong>⚠️ Önemli:</strong> Havale/EFT açıklama kısmına mutlaka sipariş numaranızı yazınız.</p>
            </div>
            
            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/order/${data.orderId}" class="cta-button">
                📱 Siparişimi Takip Et
              </a>
            </p>
            
            <p style="margin-top: 30px;">Ödemeniz onaylandıktan sonra siparişiniz hazırlanmaya başlanacak ve kargo bilgileri size e-posta ile gönderilecektir.</p>
            
            <p>Herhangi bir sorunuz varsa bizimle iletişime geçmekten çekinmeyin.</p>
            
            <p style="margin-top: 30px;">Teşekkürler,<br>
            <strong>ModaBase Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>📧 Bu e-posta ModaBase e-ticaret sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>📞 İletişim: info@modabase.com.tr | +90 536 297 12 55</p>
            <p>© 2024 ModaBase. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
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
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/admin/orders/${data.orderId}" class="cta-button">
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
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/admin/orders/${data.orderId}" class="cta-button">
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
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/order/${data.orderId}" class="cta-button">
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

  // İade onay bildirimi e-postası
  static async sendReturnApprovalNotification(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    refundAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `✅ İade Onaylandı - Sipariş #${data.orderNumber}`,
        html: this.generateReturnApprovalHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('İade onay e-postası gönderme hatası:', error);
      return false;
    }
  }

  // İade red bildirimi e-postası
  static async sendReturnRejectionNotification(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    reason: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `❌ İade Reddedildi - Sipariş #${data.orderNumber}`,
        html: this.generateReturnRejectionHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('İade red e-postası gönderme hatası:', error);
      return false;
    }
  }

  // Değişim onay bildirimi e-postası
  static async sendExchangeApprovalNotification(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    newProductId?: string;
    newSize?: string;
    newColor?: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `✅ Değişim Onaylandı - Sipariş #${data.orderNumber}`,
        html: this.generateExchangeApprovalHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Değişim onay e-postası gönderme hatası:', error);
      return false;
    }
  }

  // Değişim red bildirimi e-postası
  static async sendExchangeRejectionNotification(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    reason: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `❌ Değişim Reddedildi - Sipariş #${data.orderNumber}`,
        html: this.generateExchangeRejectionHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Değişim red e-postası gönderme hatası:', error);
      return false;
    }
  }

  // İade onay HTML template
  private static generateReturnApprovalHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    refundAmount: number;
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
        <title>İade Onaylandı - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .success-card { background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745; }
          .refund-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .check-icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="check-icon">✅</div>
            <h1 style="margin: 0;">İade Onaylandı!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <div class="success-card">
              <h3 style="margin: 0 0 15px 0; color: #155724;">İade Talebiniz Onaylandı</h3>
              <p style="margin: 0; color: #155724;">
                İade talebiniz başarıyla onaylandı. Ürünleriniz kontrol edildikten sonra iade işlemi tamamlanacak.
              </p>
            </div>
            
            <div class="refund-info">
              <h3 style="margin: 0 0 15px 0; color: #333;">İade Bilgileri</h3>
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              <p><strong>İade Tutarı:</strong> <span style="color: #28a745; font-weight: bold;">${data.refundAmount.toFixed(2)} ₺</span></p>
              <p><strong>İade Süreci:</strong> 3-5 iş günü içinde tamamlanacak</p>
            </div>
            
            <h3>İade Edilen Ürünler:</h3>
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
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #004085;">📋 İade Süreci</h4>
              <ol style="margin: 0; padding-left: 20px; color: #004085;">
                <li>Ürünleriniz kontrol edilecek</li>
                <li>İade tutarı hesabınıza iade edilecek</li>
                <li>İşlem tamamlandığında size bilgi verilecek</li>
              </ol>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/profile/orders" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Siparişlerimi Görüntüle
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase tarafından gönderilmiştir.</p>
            <p>Herhangi bir sorunuz için <a href="mailto:info@modabase.com.tr">info@modabase.com.tr</a> adresinden bize ulaşabilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // İade red HTML template
  private static generateReturnRejectionHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    reason: string;
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
        <title>İade Reddedildi - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .rejection-card { background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .reason-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .x-icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="x-icon">❌</div>
            <h1 style="margin: 0;">İade Reddedildi</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <div class="rejection-card">
              <h3 style="margin: 0 0 15px 0; color: #721c24;">İade Talebiniz Reddedildi</h3>
              <p style="margin: 0; color: #721c24;">
                Maalesef iade talebiniz onaylanamadı. Detaylar aşağıda belirtilmiştir.
              </p>
            </div>
            
            <div class="reason-box">
              <h3 style="margin: 0 0 15px 0; color: #333;">Red Nedeni</h3>
              <p style="margin: 0; color: #721c24; font-style: italic;">"${data.reason}"</p>
            </div>
            
            <h3>Sipariş Detayları:</h3>
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
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">💡 Öneriler</h4>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li>İade koşullarını tekrar gözden geçirin</li>
                <li>Ürünün orijinal ambalajında olduğundan emin olun</li>
                <li>Kullanım izi olmadığından emin olun</li>
                <li>Farklı bir sorunuz varsa müşteri hizmetleri ile iletişime geçin</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/contact" 
                 style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Müşteri Hizmetleri
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase tarafından gönderilmiştir.</p>
            <p>Herhangi bir sorunuz için <a href="mailto:info@modabase.com.tr">info@modabase.com.tr</a> adresinden bize ulaşabilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Değişim onay HTML template
  private static generateExchangeApprovalHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    newProductId?: string;
    newSize?: string;
    newColor?: string;
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
        <title>Değişim Onaylandı - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .success-card { background: #d1ecf1; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #6f42c1; }
          .exchange-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .exchange-icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="exchange-icon">🔄</div>
            <h1 style="margin: 0;">Değişim Onaylandı!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <div class="success-card">
              <h3 style="margin: 0 0 15px 0; color: #0c5460;">Değişim Talebiniz Onaylandı</h3>
              <p style="margin: 0; color: #0c5460;">
                Değişim talebiniz başarıyla onaylandı. Yeni ürününüz hazırlanıp kargoya verilecek.
              </p>
            </div>
            
            <div class="exchange-info">
              <h3 style="margin: 0 0 15px 0; color: #333;">Değişim Bilgileri</h3>
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              ${data.newSize ? `<p><strong>Yeni Beden:</strong> ${data.newSize}</p>` : ''}
              ${data.newColor ? `<p><strong>Yeni Renk:</strong> ${data.newColor}</p>` : ''}
              <p><strong>Değişim Süreci:</strong> 2-3 iş günü içinde tamamlanacak</p>
            </div>
            
            <h3>Değiştirilen Ürünler:</h3>
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
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #004085;">📋 Değişim Süreci</h4>
              <ol style="margin: 0; padding-left: 20px; color: #004085;">
                <li>Eski ürününüz kargoya verilecek</li>
                <li>Yeni ürününüz hazırlanacak</li>
                <li>Yeni ürün kargoya verilecek</li>
                <li>Kargo takip bilgileri size iletilecek</li>
              </ol>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/profile/orders" 
                 style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Siparişlerimi Görüntüle
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase tarafından gönderilmiştir.</p>
            <p>Herhangi bir sorunuz için <a href="mailto:info@modabase.com.tr">info@modabase.com.tr</a> adresinden bize ulaşabilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Değişim red HTML template
  private static generateExchangeRejectionHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    reason: string;
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
        <title>Değişim Reddedildi - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .rejection-card { background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .reason-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .x-icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="x-icon">❌</div>
            <h1 style="margin: 0;">Değişim Reddedildi</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <div class="rejection-card">
              <h3 style="margin: 0 0 15px 0; color: #721c24;">Değişim Talebiniz Reddedildi</h3>
              <p style="margin: 0; color: #721c24;">
                Maalesef değişim talebiniz onaylanamadı. Detaylar aşağıda belirtilmiştir.
              </p>
            </div>
            
            <div class="reason-box">
              <h3 style="margin: 0 0 15px 0; color: #333;">Red Nedeni</h3>
              <p style="margin: 0; color: #721c24; font-style: italic;">"${data.reason}"</p>
            </div>
            
            <h3>Sipariş Detayları:</h3>
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
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">💡 Alternatif Seçenekler</h4>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li>İade talebinde bulunabilirsiniz</li>
                <li>Farklı bir ürün seçebilirsiniz</li>
                <li>Müşteri hizmetleri ile iletişime geçebilirsiniz</li>
                <li>Ürünü kullanmaya devam edebilirsiniz</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/contact" 
                 style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Müşteri Hizmetleri
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase tarafından gönderilmiştir.</p>
            <p>Herhangi bir sorunuz için <a href="mailto:info@modabase.com.tr">info@modabase.com.tr</a> adresinden bize ulaşabilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Admin düşük stok uyarısı
  static async sendLowStockAlertToAdmin(data: {
    to: string;
    lowStockProducts: Array<{ name: string; stock: number; minStockLevel: number; category: string; price: number }>;
    outOfStockProducts: Array<{ name: string; category: string; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `🚨 Stok Uyarısı - ${data.lowStockProducts.length + data.outOfStockProducts.length} Ürün`,
        html: this.generateLowStockAlertHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Admin düşük stok uyarısı gönderme hatası:', error);
      return false;
    }
  }

  // Günlük stok raporu
  static async sendDailyStockReport(data: {
    to: string;
    date: string;
    movements: Array<{ type: string; quantity: number; productName: string; category: string; orderId?: string; description: string; createdAt: Date }>;
    lowStockProducts: Array<{ name: string; stock: number; minStockLevel: number; category: string }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `📊 Günlük Stok Raporu - ${data.date}`,
        html: this.generateDailyStockReportHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Günlük stok raporu gönderme hatası:', error);
      return false;
    }
  }

  // Düşük stok uyarısı HTML template
  private static generateLowStockAlertHTML(data: {
    lowStockProducts: Array<{ name: string; stock: number; minStockLevel: number; category: string; price: number }>;
    outOfStockProducts: Array<{ name: string; category: string; price: number }>;
  }): string {
    const lowStockHTML = data.lowStockProducts.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #ff6b35;">${product.stock}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${product.minStockLevel}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${product.price.toFixed(2)} ₺</td>
      </tr>
    `).join('');

    const outOfStockHTML = data.outOfStockProducts.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #dc3545; font-weight: bold;">0</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">-</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${product.price.toFixed(2)} ₺</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Stok Uyarısı - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .alert-card { background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .stat-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
          .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .alert-icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="alert-icon">🚨</div>
            <h1 style="margin: 0;">Stok Uyarısı!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Acil müdahale gerekiyor</p>
          </div>
          
          <div class="content">
            <div class="alert-card">
              <h3 style="margin: 0 0 15px 0; color: #721c24;">Stok Durumu Kritik</h3>
              <p style="margin: 0; color: #721c24;">
                Bazı ürünlerin stok seviyeleri kritik seviyede. Lütfen en kısa sürede stok güncellemesi yapın.
              </p>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number" style="color: #ff6b35;">${data.lowStockProducts.length}</div>
                <div>Düşük Stok</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" style="color: #dc3545;">${data.outOfStockProducts.length}</div>
                <div>Stoksuz</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" style="color: #007bff;">${data.lowStockProducts.length + data.outOfStockProducts.length}</div>
                <div>Toplam Uyarı</div>
              </div>
            </div>
            
            ${data.lowStockProducts.length > 0 ? `
              <h3>🟠 Düşük Stok Ürünleri:</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Mevcut Stok</th>
                    <th>Min. Stok</th>
                    <th>Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  ${lowStockHTML}
                </tbody>
              </table>
            ` : ''}
            
            ${data.outOfStockProducts.length > 0 ? `
              <h3>🔴 Stoksuz Ürünler:</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Mevcut Stok</th>
                    <th>Min. Stok</th>
                    <th>Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  ${outOfStockHTML}
                </tbody>
              </table>
            ` : ''}
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #004085;">📋 Önerilen Aksiyonlar</h4>
              <ul style="margin: 0; padding-left: 20px; color: #004085;">
                <li>Düşük stok ürünleri için sipariş verin</li>
                <li>Stoksuz ürünleri geçici olarak devre dışı bırakın</li>
                <li>Müşteri taleplerini kontrol edin</li>
                <li>Stok seviyelerini güncelleyin</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/admin/stock-alerts" 
                 style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Stok Yönetimi
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase stok yönetim sistemi tarafından gönderilmiştir.</p>
            <p>Otomatik bildirimler için ayarları değiştirmek istiyorsanız admin panelinden yapabilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Günlük stok raporu HTML template
  private static generateDailyStockReportHTML(data: {
    date: string;
    movements: Array<{ type: string; quantity: number; productName: string; category: string; orderId?: string; description: string; createdAt: Date }>;
    lowStockProducts: Array<{ name: string; stock: number; minStockLevel: number; category: string }>;
  }): string {
    const movementsHTML = data.movements.map(movement => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${movement.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${movement.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          <span style="color: ${movement.type === 'IN' ? '#28a745' : '#dc3545'}; font-weight: bold;">
            ${movement.type === 'IN' ? '+' : '-'}${movement.quantity}
          </span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${movement.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(movement.createdAt).toLocaleTimeString('tr-TR')}</td>
      </tr>
    `).join('');

    const lowStockHTML = data.lowStockProducts.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #ff6b35;">${product.stock}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${product.minStockLevel}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Günlük Stok Raporu - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .summary-card { background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #007bff; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .stat-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
          .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .report-icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="report-icon">📊</div>
            <h1 style="margin: 0;">Günlük Stok Raporu</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.date}</p>
          </div>
          
          <div class="content">
            <div class="summary-card">
              <h3 style="margin: 0 0 15px 0; color: #004085;">Günlük Özet</h3>
              <p style="margin: 0; color: #004085;">
                Bu rapor ${data.date} tarihindeki stok hareketlerini ve düşük stok durumlarını göstermektedir.
              </p>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number" style="color: #007bff;">${data.movements.length}</div>
                <div>Toplam Hareket</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" style="color: #28a745;">${data.movements.filter(m => m.type === 'IN').length}</div>
                <div>Stok Girişi</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" style="color: #dc3545;">${data.movements.filter(m => m.type === 'OUT').length}</div>
                <div>Stok Çıkışı</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" style="color: #ff6b35;">${data.lowStockProducts.length}</div>
                <div>Düşük Stok</div>
              </div>
            </div>
            
            ${data.movements.length > 0 ? `
              <h3>📈 Stok Hareketleri:</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Miktar</th>
                    <th>Açıklama</th>
                    <th>Saat</th>
                  </tr>
                </thead>
                <tbody>
                  ${movementsHTML}
                </tbody>
              </table>
            ` : '<p style="text-align: center; color: #6c757d; font-style: italic;">Bu gün stok hareketi bulunmuyor.</p>'}
            
            ${data.lowStockProducts.length > 0 ? `
              <h3>⚠️ Düşük Stok Ürünleri:</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Mevcut Stok</th>
                    <th>Min. Stok</th>
                  </tr>
                </thead>
                <tbody>
                  ${lowStockHTML}
                </tbody>
              </table>
            ` : ''}
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #495057;">📋 Rapor Bilgileri</h4>
              <ul style="margin: 0; padding-left: 20px; color: #495057;">
                <li>Bu rapor otomatik olarak oluşturulmuştur</li>
                <li>Stok hareketleri gerçek zamanlı olarak kaydedilir</li>
                <li>Düşük stok uyarıları anında gönderilir</li>
                <li>Detaylı analiz için admin panelini kullanın</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/admin/stock-alerts" 
                 style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Detaylı Rapor
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase stok yönetim sistemi tarafından gönderilmiştir.</p>
            <p>Rapor sıklığını değiştirmek için admin panelinden ayarları güncelleyebilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Kargo bildirimi e-postası
  static async sendShippingNotification(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    trackingNumber: string;
    shippingCompany: string;
    shippingTrackingUrl?: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `🚚 Kargo Yolda! Takip No: ${data.trackingNumber} - #${data.orderNumber}`,
        html: this.generateShippingNotificationHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Kargo bildirimi e-postası gönderme hatası:', error);
      return false;
    }
  }

  // Teslim bildirimi e-postası
  static async sendDeliveryNotification(data: {
    to: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    trackingNumber: string;
    shippingCompany: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'info@modabase.com.tr',
        to: data.to,
        subject: `🎉 Teslim Edildi! Teşekkürler - ModaBase #${data.orderNumber}`,
        html: this.generateDeliveryNotificationHTML(data)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Teslim bildirimi e-postası gönderme hatası:', error);
      return false;
    }
  }

  // Kargo bildirimi HTML template
  private static generateShippingNotificationHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    trackingNumber: string;
    shippingCompany: string;
    shippingTrackingUrl?: string;
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
        <title>Sipariş Kargoya Verildi - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .shipping-card { background: #d1ecf1; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #17a2b8; }
          .tracking-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .truck-icon { font-size: 48px; margin-bottom: 10px; }
          .tracking-button { display: inline-block; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="truck-icon">🚚</div>
            <h1 style="margin: 0;">Siparişiniz Kargoya Verildi!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <div class="shipping-card">
              <h3 style="margin: 0 0 15px 0; color: #0c5460;">Siparişiniz Yola Çıktı</h3>
              <p style="margin: 0; color: #0c5460;">
                Siparişiniz başarıyla kargoya verildi ve yola çıktı. Aşağıdaki bilgilerle takip edebilirsiniz.
              </p>
            </div>
            
            <div class="tracking-info">
              <h3 style="margin: 0 0 15px 0; color: #333;">Kargo Bilgileri</h3>
              <p><strong>Kargo Firması:</strong> ${data.shippingCompany}</p>
              <p><strong>Takip Numarası:</strong> <span style="font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px;">${data.trackingNumber}</span></p>
              <p><strong>Tahmini Teslimat:</strong> 1-3 iş günü</p>
              
              ${data.shippingTrackingUrl ? `
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${data.shippingTrackingUrl}" class="tracking-button" target="_blank">
                    📦 Kargo Takip Et
                  </a>
                </div>
              ` : ''}
            </div>
            
            <h3>Sipariş Detayları:</h3>
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
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #004085;">📋 Teslimat Süreci</h4>
              <ol style="margin: 0; padding-left: 20px; color: #004085;">
                <li>Siparişiniz kargoya verildi ✅</li>
                <li>Kargo firması tarafından işleniyor</li>
                <li>Dağıtım merkezine ulaşacak</li>
                <li>Adresinize teslim edilecek</li>
              </ol>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/profile/orders" 
                 style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Siparişlerimi Görüntüle
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase tarafından gönderilmiştir.</p>
            <p>Herhangi bir sorunuz için <a href="mailto:info@modabase.com.tr">info@modabase.com.tr</a> adresinden bize ulaşabilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Teslim bildirimi HTML template
  private static generateDeliveryNotificationHTML(data: {
    customerName: string;
    orderId: string;
    orderNumber: string;
    trackingNumber: string;
    shippingCompany: string;
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
        <title>Sipariş Teslim Edildi - ModaBase</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: white; }
          .delivery-card { background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745; }
          .delivery-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          .check-icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="check-icon">✅</div>
            <h1 style="margin: 0;">Siparişiniz Teslim Edildi!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sipariş #${data.orderNumber}</p>
          </div>
          
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            
            <div class="delivery-card">
              <h3 style="margin: 0 0 15px 0; color: #155724;">Siparişiniz Başarıyla Teslim Edildi</h3>
              <p style="margin: 0; color: #155724;">
                Siparişiniz adresinize başarıyla teslim edildi. Keyifli alışverişler dileriz!
              </p>
            </div>
            
            <div class="delivery-info">
              <h3 style="margin: 0 0 15px 0; color: #333;">Teslimat Bilgileri</h3>
              <p><strong>Kargo Firması:</strong> ${data.shippingCompany}</p>
              <p><strong>Takip Numarası:</strong> <span style="font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px;">${data.trackingNumber}</span></p>
              <p><strong>Teslim Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>
            
            <h3>Teslim Edilen Ürünler:</h3>
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
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">💡 Önemli Bilgiler</h4>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li>Ürünlerinizi kontrol edin</li>
                <li>Herhangi bir sorun varsa 14 gün içinde iade edebilirsiniz</li>
                <li>Deneyiminizi değerlendirmek için yorum yapabilirsiniz</li>
                <li>Yeni ürünler için bizi takip edin</li>
              </ul>
            </div>
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #004085;">🎉 Teşekkürler!</h4>
              <p style="margin: 0; color: #004085;">
                ModaBase'i tercih ettiğiniz için teşekkür ederiz. Umarız ürünlerimizden memnun kalırsınız!
              </p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/profile/orders" 
                 style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); color: #212529; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 0 10px;">
                ⭐ Değerlendir
              </a>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://modabase.com.tr'}/products" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 0 10px;">
                🛍️ Tekrar Alışveriş
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta ModaBase tarafından gönderilmiştir.</p>
            <p>Herhangi bir sorunuz için <a href="mailto:info@modabase.com.tr">info@modabase.com.tr</a> adresinden bize ulaşabilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
