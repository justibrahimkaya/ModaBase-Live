// =======================================================
// E.ARŞİV TEST ORTAMI SABİTLERİ
// =======================================================

export const EARSIV_CONFIG = {
  // TEST VE PRODÜKSİYON ORTAMI URL'LERİ (✅ Güncellenmiş)
  TEST_BASE_URL: 'https://earsivportal.efatura.gov.tr', // Test için aynı portal
  PROD_BASE_URL: 'https://earsivportal.efatura.gov.tr', // Gerçek e.arşiv portal
  
  // TEST ENDPOINTS
  ENDPOINTS: {
    LOGIN: '/earsiv-services/assos-login',
    CREATE_DRAFT: '/earsiv-services/dispatch', 
    SEND_SIGN: '/earsiv-services/sendSignedInvoice',
    GET_INVOICE: '/earsiv-services/invoice',
    CANCEL_INVOICE: '/earsiv-services/cancelInvoice'
  },

  // TEST KULLANICI BİLGİLERİ (GİB'in resmi test hesabı)
  TEST_CREDENTIALS: {
    username: '33333333333', // Test VKN
    password: '1', // Test şifre
  },

  // GERÇEK KULLANICI BİLGİLERİ (Production)
  REAL_CREDENTIALS: {
    username: '53208908', // E.arşiv kullanıcı adı (VKN'den farklı)
    password: '147258', // Gerçek şifre
  },

  // FATURA TİPLERİ
  INVOICE_TYPES: {
    SALES: 'SATIS', // Satış faturası
    RETURN: 'IADE', // İade faturası
    CANCEL: 'IPTAL' // İptal faturası
  },

  // KDV ORANLARI (Türkiye)
  TAX_RATES: {
    STANDARD: 10,    // %10 KDV (tekstil standart) - ModaBase için
    HIGH: 20,        // %20 KDV (yüksek) - Lüks ürünler
    REDUCED_LOW: 1,   // %1 KDV (indirimli) - Temel gıda, sağlık
    ZERO: 0,         // %0 KDV (muaf) - İhracat, altın
    // Sektörel örnekler:
    FOOD_BASIC: 1,      // Temel gıda
    FOOD_PROCESSED: 20, // İşlenmiş gıda  
    TEXTILE: 10,        // Tekstil/konfeksiyon (%10 KDV) - ModaBase ana sektör
    ELECTRONICS: 20,    // Elektronik
    BOOKS: 1,           // Kitap
    HEALTH: 1,          // Sağlık ürünleri
    LUXURY: 20,         // Lüks ürünler
    EXPORT: 0           // İhracat
  },

  // PARA BİRİMİ
  CURRENCY: 'TRY',

  // ÖLÇÜ BİRİMLERİ
  UNITS: {
    PIECE: 'C62', // Adet
    KILOGRAM: 'KGM', // Kilogram
    METER: 'MTR', // Metre
    LITER: 'LTR'  // Litre
  }
};

// GERÇEK FİRMA BİLGİLERİ
export const REAL_COMPANY_INFO = {
  vkn: '5320543093', // Gerçek VKN (Düzeltilmiş)
  title: 'ModaHan ibrahim kaya',
  address: 'MALKOÇOĞLU MAH.305/1. SK. KARAKUŞ AP NO 17 A SULTANGAZİ/İSTANBUL',
  taxOffice: 'ATIŞALANI',
  phone: '05362971255',
  email: 'kavram.triko@gmail.com',
  website: 'modabase.com.tr'
};

// TEST FİRMA BİLGİLERİ (Test amaçlı)
export const TEST_COMPANY_INFO = {
  vkn: '33333333333', // Test VKN
  title: 'ModaBase Test Firması',
  address: 'Test Mahallesi Test Sokak No:1 Test/İstanbul',
  taxOffice: 'Test Vergi Dairesi',
  phone: '+90 536 297 12 55',
  email: 'test@modabase.com.tr',
  website: 'modabase.com.tr'
};

// UBL-TR STANDART KODLARI
export const UBL_CONSTANTS = {
  // Belge tipleri
  DOCUMENT_TYPE: 'INVOICE',
  PROFILE_ID: 'EARSIV',
  
  // Para birimi
  CURRENCY_CODE: 'TRY',
  CURRENCY_NAME: 'Türk Lirası',
  
  // Ülke kodu
  COUNTRY_CODE: 'TR',
  COUNTRY_NAME: 'Türkiye'
}; 