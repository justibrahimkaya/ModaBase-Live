// =======================================================
// ANA E.ARŞİV SERVİSİ - HİBRİT SISTEM
// =======================================================

import { GibApiService } from './gibApi';
import { EarsivInvoiceData } from './xmlBuilder';
import { EARSIV_CONFIG, TEST_COMPANY_INFO, REAL_COMPANY_INFO } from './constants';

export interface EarsivResult {
  success: boolean;
  invoiceId?: string | undefined;
  invoiceUuid?: string | undefined;
  pdfPath?: string | undefined;
  error?: string | undefined;
  isTest?: boolean;
}

export class EarsivService {
  private static isTestMode = true; // Başlangıçta test modu
  private static isLoggedIn = false;

  // 1. E.arşiv Test Modunu Başlat
  static async initializeTestMode(): Promise<boolean> {
    console.log('🧪 E.arşiv test modu başlatılıyor...');
    
    try {
      // Test modunu etkinleştir
      GibApiService.setTestMode(true);
      this.isTestMode = true;

      // Test hesabı ile giriş yap
      const loginResult = await GibApiService.login(
        EARSIV_CONFIG.TEST_CREDENTIALS.username,
        EARSIV_CONFIG.TEST_CREDENTIALS.password
      );

      if (loginResult.success) {
        this.isLoggedIn = true;
        console.log('✅ E.arşiv test modu hazır');
        return true;
      } else {
        console.log('❌ Test modu başlatılamadı:', loginResult.error);
        return false;
      }

    } catch (error) {
      console.error('❌ Test modu hatası:', error);
      return false;
    }
  }

  // 2. Hibrit Fatura Oluştur (PDF + E.arşiv)
  static async createHybridInvoice(invoiceData: EarsivInvoiceData): Promise<EarsivResult> {
    console.log('🔄 Hibrit fatura oluşturuluyor (PDF + E.arşiv)...');
    
    try {
      // Test modunda çalışıyoruz
      invoiceData.isTest = this.isTestMode;

      // Kargo ve toplam tutar uyumlu hesaplama
      const taxCalculation = this.calculateInvoiceTax(
        invoiceData.order.items, 
        invoiceData.order.total, 
        invoiceData.order.shippingCost
      );
      console.log('📊 Fatura hesaplama:', {
        subtotal: taxCalculation.subtotal.toFixed(2),
        totalTax: taxCalculation.totalTaxAmount.toFixed(2),
        grandTotal: taxCalculation.total.toFixed(2),
        originalOrderTotal: invoiceData.order.total.toFixed(2)
      });

      // 1. Önce PDF faturayı oluştur (mevcut sistem)
      console.log('📄 PDF fatura oluşturuluyor...');
      // PDF oluşturma mevcut InvoiceService tarafından yapılacak

      // 2. E.arşiv için hazırla
      if (!this.isLoggedIn && this.isTestMode) {
        console.log('🔐 Test hesabına giriş yapılıyor...');
        const initialized = await this.initializeTestMode();
        if (!initialized) {
          return {
            success: false,
            error: 'E.arşiv test moduna giriş yapılamadı',
            isTest: true
          };
        }
      }

      // 3. GİB JSON formatında fatura hazırla
      console.log('📄 GİB JSON formatında fatura hazırlanıyor...');
      
      // 4. GİB'e taslak fatura gönder
      console.log('📤 GİB\'e taslak fatura gönderiliyor...');
      const draftResult = await GibApiService.createDraftInvoice(invoiceData);
      
      if (!draftResult.success) {
        console.log('⚠️ E.arşiv taslak oluşturulamadı, sadece PDF devam ediyor');
        return {
          success: true, // PDF var, e.arşiv olmasa da başarılı sayıyoruz
          error: `E.arşiv hatası: ${draftResult.error}`,
          isTest: this.isTestMode
        };
      }

      // 5. Faturayı imzala ve gönder
      console.log('✍️ Fatura imzalanıyor...');
      const signResult = await GibApiService.sendSignedInvoice(draftResult.invoiceUuid!);
      
      if (signResult.success) {
        console.log('🎉 Hibrit fatura başarıyla oluşturuldu!');
        return {
          success: true,
          invoiceId: signResult.invoiceId,
          invoiceUuid: draftResult.invoiceUuid,
          isTest: this.isTestMode
        };
      } else {
        console.log('⚠️ İmzalama başarısız, taslak oluşturuldu');
        return {
          success: true, // Taslak var
          invoiceUuid: draftResult.invoiceUuid,
          error: `İmzalama hatası: ${signResult.error}`,
          isTest: this.isTestMode
        };
      }

    } catch (error) {
      console.error('❌ Hibrit fatura hatası:', error);
      return {
        success: false,
        error: `Hibrit fatura hatası: ${error}`,
        isTest: this.isTestMode
      };
    }
  }

  // 3. Gerçek Hesap ile Bağlan (Production için)
  static async connectWithRealCredentials(username: string, password: string): Promise<boolean> {
    console.log('🔐 Gerçek hesap ile bağlanılıyor...');
    
    try {
      // Production moduna geç
      GibApiService.setTestMode(false);
      this.isTestMode = false;

      // Gerçek hesap ile giriş
      const loginResult = await GibApiService.login(username, password);
      
      if (loginResult.success) {
        this.isLoggedIn = true;
        console.log('✅ Gerçek hesap bağlantısı başarılı');
        return true;
      } else {
        console.log('❌ Gerçek hesap bağlantı hatası:', loginResult.error);
        // Hata durumunda test moduna geri dön
        this.isTestMode = true;
        GibApiService.setTestMode(true);
        return false;
      }

    } catch (error) {
      console.error('❌ Real credentials error:', error);
      // Hata durumunda test moduna geri dön
      this.isTestMode = true;
      GibApiService.setTestMode(true);
      return false;
    }
  }

  // 4. Dinamik KDV Hesaplama Yardımcısı (Kargo ve fark düzeltmesi dahil)
  static calculateInvoiceTax(items: any[], orderTotal?: number, shippingCost?: number) {
    let subtotal = 0;
    let totalTaxAmount = 0;
    const taxBreakdown: { [key: number]: { amount: number; tax: number } } = {};

    // Önce ürün kalemlerini hesapla
    items.forEach(item => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      subtotal += itemTotal;
      
      // Dinamik KDV oranı (ürün > kategori > varsayılan)
      const taxRate = item.taxRate || item.product?.taxRate || item.product?.category?.defaultTaxRate || EARSIV_CONFIG.TAX_RATES.STANDARD;
      const taxAmount = itemTotal * (taxRate / 100);
      totalTaxAmount += taxAmount;
      
      // KDV oranına göre grupla
      if (!taxBreakdown[taxRate]) {
        taxBreakdown[taxRate] = { amount: 0, tax: 0 };
      }
      taxBreakdown[taxRate].amount += itemTotal;
      taxBreakdown[taxRate].tax += taxAmount;
    });

    // Kargo ücretini ekle (varsa)
    if (shippingCost && shippingCost > 0) {
      const shippingTaxRate = EARSIV_CONFIG.TAX_RATES.STANDARD; // %10
      const shippingTaxAmount = shippingCost * (shippingTaxRate / 100);
      
      subtotal += shippingCost;
      totalTaxAmount += shippingTaxAmount;
      
      if (!taxBreakdown[shippingTaxRate]) {
        taxBreakdown[shippingTaxRate] = { amount: 0, tax: 0 };
      }
      taxBreakdown[shippingTaxRate].amount += shippingCost;
      taxBreakdown[shippingTaxRate].tax += shippingTaxAmount;
    }

    // Toplam tutar kontrolü ve otomatik düzeltme
    if (orderTotal) {
      const calculatedTotalWithTax = subtotal + totalTaxAmount;
      const difference = orderTotal - calculatedTotalWithTax;
      
      if (Math.abs(difference) > 0.01) { // 1 kuruştan fazla fark varsa
        const adjustmentTaxRate = EARSIV_CONFIG.TAX_RATES.STANDARD;
        const adjustmentNet = difference / (1 + adjustmentTaxRate / 100);
        const adjustmentTax = adjustmentNet * (adjustmentTaxRate / 100);
        
        subtotal += adjustmentNet;
        totalTaxAmount += adjustmentTax;
        
        if (!taxBreakdown[adjustmentTaxRate]) {
          taxBreakdown[adjustmentTaxRate] = { amount: 0, tax: 0 };
        }
        taxBreakdown[adjustmentTaxRate].amount += adjustmentNet;
        taxBreakdown[adjustmentTaxRate].tax += adjustmentTax;
        
        console.log(`⚖️ E-arşiv fark düzeltmesi: ${difference.toFixed(2)} TL`);
      }
    }

    return {
      subtotal: subtotal,
      totalTaxAmount: totalTaxAmount,
      total: subtotal + totalTaxAmount,
      taxBreakdown: taxBreakdown // KDV oranlarına göre dağılım
    };
  }

  // 5. Sistem Durumu Kontrol
  static getStatus() {
    return {
      isTestMode: this.isTestMode,
      isLoggedIn: this.isLoggedIn,
      mode: this.isTestMode ? 'TEST' : 'PRODUCTION'
    };
  }

  // 6. Oturumu Kapat
  static logout() {
    GibApiService.logout();
    this.isLoggedIn = false;
    console.log('🚪 E.arşiv oturumu kapatıldı');
  }

  // 7. Test Faturası Oluştur (Sistem testi için)
  static async createTestInvoice() {
    console.log('🧪 Test faturası oluşturuluyor...');

    const testInvoiceData: EarsivInvoiceData = {
      order: {
        id: 'test-order-' + Date.now(),
        total: 110.00, // %10 KDV ile (100 + 10)
        items: [
          {
            product: { name: 'Test Tekstil Ürünü', taxRate: 10 },
            quantity: 1,
            price: 100.00,
            taxRate: 10
          }
        ],
        user: null,
        guestName: 'Test Müşteri',
        guestEmail: 'test@test.com',
        address: {
          address: 'Test Adresi',
          city: 'İstanbul'
        },
        paymentMethod: 'Test'
      },
      companyInfo: TEST_COMPANY_INFO,
      invoiceNumber: 'TST' + Date.now(),
      invoiceDate: new Date(),
      isTest: true
    };

    return await this.createHybridInvoice(testInvoiceData);
  }

  // 8. Gerçek Bilgilerle Test Faturası (Production hesap + Test mod)
  static async createRealTestInvoice() {
    console.log('🎯 Gerçek bilgilerle TEST faturası oluşturuluyor...');

    try {
      // Gerçek hesapla test modunda bağlan
      GibApiService.setTestMode(true); // Test ortamı
      this.isTestMode = true;

      // Gerçek hesap bilgileriyle giriş yap
      const loginResult = await GibApiService.login(
        EARSIV_CONFIG.REAL_CREDENTIALS.username,
        EARSIV_CONFIG.REAL_CREDENTIALS.password
      );

      if (loginResult.success) {
        this.isLoggedIn = true;
        console.log('✅ Gerçek hesapla test ortamına giriş başarılı');

        const testInvoiceData: EarsivInvoiceData = {
          order: {
            id: 'real-test-' + Date.now(),
                    total: 110.00, // %10 KDV ile (100 + 10)
        items: [
          {
            product: { name: 'ModaBase Test Tekstil Ürünü', taxRate: 10 },
            quantity: 1,
            price: 100.00,
            taxRate: 10
          }
        ],
            user: null,
            guestName: 'Test Müşteri',
            guestEmail: 'test@modabase.com',
            address: {
              address: 'Test Adresi Sultangazi',
              city: 'İstanbul'
            },
            paymentMethod: 'Test Havale'
          },
          companyInfo: REAL_COMPANY_INFO, // Gerçek firma bilgileri
          invoiceNumber: 'RTS' + Date.now(),
          invoiceDate: new Date(),
          isTest: true
        };

        return await this.createHybridInvoice(testInvoiceData);
      } else {
        console.log('❌ Gerçek hesap giriş hatası:', loginResult.error);
        return {
          success: false,
          error: `Gerçek hesap giriş hatası: ${loginResult.error}`,
          isTest: true
        };
      }

    } catch (error) {
      console.error('❌ Gerçek test faturası hatası:', error);
      return {
        success: false,
        error: `Gerçek test faturası hatası: ${error}`,
        isTest: true
      };
    }
  }
} 