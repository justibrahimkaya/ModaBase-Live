// =======================================================
// GİB API SERVİSİ - E.ARŞİV ENTEGRASYONU
// =======================================================

import { EARSIV_CONFIG } from './constants';

export interface GibLoginResponse {
  success: boolean;
  token?: string;
  sessionId?: string;
  error?: string;
}

export interface GibInvoiceResponse {
  success: boolean;
  invoiceUuid?: string;
  invoiceId?: string;
  error?: string;
  details?: any;
}

export class GibApiService {
  private static baseUrl = EARSIV_CONFIG.TEST_BASE_URL;
  private static token: string | null = null;
  private static sessionId: string | null = null;

  // 1. GİB'e Giriş Yap
  static async login(username: string, password: string): Promise<GibLoginResponse> {
    console.log('🔐 GİB e.arşiv\'e giriş yapılıyor...');
    
    try {
      const loginData = {
        assoscmd: 'login',
        userid: username,
        sifre: password,
        rtype: 'json'
      };

      const response = await fetch(`${this.baseUrl}${EARSIV_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(loginData).toString()
      });

      const result = await response.json();
      console.log('📥 GİB login response:', result);

      if (result.userid && result.token) {
        this.token = result.token;
        this.sessionId = result.userid;
        
        console.log('✅ GİB girişi başarılı');
        return {
          success: true,
          token: result.token,
          sessionId: result.userid
        };
      } else {
        console.log('❌ GİB giriş hatası:', result.error || 'Bilinmeyen hata');
        return {
          success: false,
          error: result.error || 'Giriş başarısız'
        };
      }

    } catch (error) {
      console.error('❌ GİB API connection error:', error);
      return {
        success: false,
        error: `API bağlantı hatası: ${error}`
      };
    }
  }

  // 2. E.arşiv Faturası Oluştur (Taslak)
  static async createDraftInvoice(invoiceData?: any): Promise<GibInvoiceResponse> {
    console.log('📄 E.arşiv taslak fatura oluşturuluyor...');

    if (!this.token || !this.sessionId) {
      return {
        success: false,
        error: 'Önce GİB\'e giriş yapmalısınız'
      };
    }

    try {
      // Gerçek invoice data'sından fatura verilerini oluştur
      const order = invoiceData?.order;
      const customerName = order?.user?.name || order?.guestName || 'Test Musteri';
      const customerEmail = order?.user?.email || order?.guestEmail || '';
      
      // Ürün listesini hazırla (Dinamik KDV ile)
      const malHizmetTable = order?.items?.map((item: any) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        const itemTotal = itemPrice * itemQuantity;
        
        // Dinamik KDV oranı (ürün > kategori > varsayılan)
        const taxRate = item.taxRate || item.product?.taxRate || item.product?.category?.defaultTaxRate || 20;
        const kdvTutari = itemTotal * (taxRate / 100);
        
        return {
          malHizmet: item.product?.name || 'Urun',
          miktar: itemQuantity,
          birim: 'C62',
          birimFiyat: itemPrice.toFixed(2),
          fiyat: itemPrice.toFixed(2),
          iskontoOrani: 0,
          iskontoTutari: '0.00',
          iskontoNedeni: '',
          malHizmetTutari: itemTotal.toFixed(2),
          kdvOrani: taxRate,
          kdvTutari: kdvTutari.toFixed(2),
          vergininKdvTutari: '0.00'
        };
      }) || [{
        malHizmet: 'Test Tekstil Urun',
        miktar: 1,
        birim: 'C62',
        birimFiyat: '100.00',
        fiyat: '100.00',
        iskontoOrani: 0,
        iskontoTutari: '0.00',
        iskontoNedeni: '',
        malHizmetTutari: '100.00',
        kdvOrani: 10, // Tekstil için %10
        kdvTutari: '10.00', // %10 KDV
        vergininKdvTutari: '0.00'
      }];

      // Toplam hesapla
      const matrah = malHizmetTable.reduce((sum: number, item: any) => sum + parseFloat(item.malHizmetTutari), 0);
      const kdvToplam = malHizmetTable.reduce((sum: number, item: any) => sum + parseFloat(item.kdvTutari), 0);
      const genelToplam = matrah + kdvToplam;

      const draftData = {
        cmd: 'EARSIV_PORTAL_FATURA_OLUSTUR',
        callid: this.generateCallId(),
        pageName: 'RG_BASITFATURA',
        token: this.token,
        jp: JSON.stringify({
          faturaUuid: this.generateInvoiceUuid(),
          belgeNumarasi: '',
          faturaTarihi: new Date().toISOString().split('T')[0],
          saat: new Date().toTimeString().split(' ')[0],
          paraBirimi: 'TRY',
          dovizKuru: '1',
          faturaTipi: 'SATIS',
          vknTckn: '11111111111', // Müşteri VKN (test için sabit)
          aliciAdi: customerName,
          aliciSoyadi: '',
          binaAdi: '',
          binaNo: '',
          kapiNo: '',
          kasabaKoy: '',
          vergiDairesi: '',
          ulke: 'Türkiye',
          bulvarcaddesokak: order?.address?.address || 'Test Adres',
          mahalleSemtIlce: order?.address?.district || 'Test Mahalle',
          sehir: order?.address?.city || 'İstanbul',
          postaKodu: '',
          tel: order?.user?.phone || order?.guestPhone || '',
          fax: '',
          eposta: customerEmail,
          websitesi: '',
          iadeTable: [],
          ozelMatrahTutari: '0',
          ozelMatrahOrani: 0,
          ozelMatrahVergiTutari: '0',
          vergiCesidi: ' ',
          malHizmetTable: malHizmetTable,
          tip: 'İskonto',
          matrah: matrah.toFixed(2),
          malhizmetToplamTutari: matrah.toFixed(2),
          toplamIskonto: '0.00',
          hesaplanankdv: kdvToplam.toFixed(2),
          vergilerToplami: kdvToplam.toFixed(2),
          vergilerDahilToplamTutar: genelToplam.toFixed(2),
          odenecekTutar: genelToplam.toFixed(2),
          not: `ModaBase Tekstil E-Ticaret Faturası (%10 KDV) - Sipariş: ${order?.id || 'TEST'}`
        })
      };

      const response = await fetch(`${this.baseUrl}${EARSIV_CONFIG.ENDPOINTS.CREATE_DRAFT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(draftData).toString()
      });

      const result = await response.json();
      console.log('📥 GİB draft invoice response:', result);

      if (result.data) {
        console.log('✅ Taslak fatura oluşturuldu');
        return {
          success: true,
          invoiceUuid: result.data.faturaUuid,
          details: result.data
        };
      } else {
        console.log('❌ Taslak fatura hatası:', result.error);
        return {
          success: false,
          error: result.error || 'Taslak oluşturulamadı'
        };
      }

    } catch (error) {
      console.error('❌ Draft invoice error:', error);
      return {
        success: false,
        error: `Taslak fatura hatası: ${error}`
      };
    }
  }

  // 3. Faturayı İmzala ve Gönder
  static async sendSignedInvoice(invoiceUuid: string): Promise<GibInvoiceResponse> {
    console.log('✍️ Fatura imzalanıp gönderiliyor...');

    if (!this.token) {
      return {
        success: false,
        error: 'Token bulunamadı'
      };
    }

    try {
      const signData = {
        cmd: 'EARSIV_PORTAL_FATURA_HSM_CIHAZI_ILE_IMZALA',
        callid: this.generateCallId(),
        pageName: 'RG_BASITFATURA',
        token: this.token,
        jp: JSON.stringify({
          faturaUuid: invoiceUuid,
          onayDurumu: 'Onaylandı'
        })
      };

      const response = await fetch(`${this.baseUrl}${EARSIV_CONFIG.ENDPOINTS.SEND_SIGN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(signData).toString()
      });

      const result = await response.json();
      console.log('📥 GİB sign response:', result);

      if (result.data) {
        console.log('✅ Fatura imzalandı ve gönderildi');
        return {
          success: true,
          invoiceId: result.data.faturaNo,
          details: result.data
        };
      } else {
        console.log('❌ İmzalama hatası:', result.error);
        return {
          success: false,
          error: result.error || 'İmzalanamadı'
        };
      }

    } catch (error) {
      console.error('❌ Sign invoice error:', error);
      return {
        success: false,
        error: `İmzalama hatası: ${error}`
      };
    }
  }

  // Yardımcı metodlar
  private static generateCallId(): string {
    return Date.now().toString();
  }

  private static generateInvoiceUuid(): string {
    return Date.now().toString() + '-' + Math.random().toString(36).substring(2);
  }

  // Test modunu etkinleştir/pasifleştir
  static setTestMode(isTest: boolean) {
    this.baseUrl = isTest ? EARSIV_CONFIG.TEST_BASE_URL : EARSIV_CONFIG.PROD_BASE_URL;
    console.log(`🔧 GİB modu: ${isTest ? 'TEST' : 'PRODUCTION'}`);
  }

  // Token'ları temizle (çıkış)
  static logout() {
    this.token = null;
    this.sessionId = null;
    console.log('🚪 GİB oturumu kapatıldı');
  }
} 