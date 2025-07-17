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
}
