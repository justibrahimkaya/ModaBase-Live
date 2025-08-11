// Kargo firmaları için tip tanımları
export interface CargoCompany {
  id: string;
  name: string;
  logo: string;
  apiEndpoint: string;
  apiKey: string;
  isActive: boolean;
  pricing: PricingTier[];
  kdvRate: number; // KDV oranı
}

export interface PricingTier {
  minDesi: number;
  maxDesi: number;
  price: number;
  additionalPrice?: number; // Ek desi başına fiyat
}

export interface ShippingQuote {
  companyId: string;
  companyName: string;
  price: number;
  estimatedDays: number;
  isAvailable: boolean;
  error?: string;
}

export interface PackageInfo {
  weight: number; // kg
  length: number; // cm
  width: number; // cm
  height: number; // cm
  desi: number; // Desi hesaplaması
}

// Desi hesaplama fonksiyonu
export const calculateDesi = (length: number, width: number, height: number, weight: number): number => {
  const volume = (length * width * height) / 1000000; // m³
  const desi = Math.max(volume, weight);
  return Math.ceil(desi * 10) / 10; // 1 ondalık basamağa yuvarla
};

// KDV hesaplama - Tekstil sektörü %10 KDV
export const calculateWithKDV = (price: number, kdvRate: number = 10): number => {
  return price * (1 + kdvRate / 100);
};

// Fiyat hesaplama fonksiyonu
const calculatePrice = (desi: number, pricing: PricingTier[]): number => {
  for (const tier of pricing) {
    if (desi >= tier.minDesi && desi <= tier.maxDesi) {
      return tier.price;
    }
  }
  
  // Eğer desi, tanımlı aralıkların dışındaysa
  const lastTier = pricing[pricing.length - 1];
  if (lastTier && lastTier.additionalPrice && desi > lastTier.maxDesi) {
    const extraDesi = desi - lastTier.maxDesi;
    return lastTier.price + (extraDesi * lastTier.additionalPrice);
  }
  
  return lastTier?.price || 0;
};

// Kargo firmaları konfigürasyonu - KARGONOMİ GERÇEK FİYATLAR
export const cargoCompanies: CargoCompany[] = [
  {
    id: 'aras',
    name: 'Aras Kargo',
    logo: '/cargo-logos/aras.png',
    apiEndpoint: process.env.ARAS_API_ENDPOINT || '',
    apiKey: process.env.ARAS_API_KEY || '',
    isActive: true,
    kdvRate: 10,
    pricing: [
      { minDesi: 0, maxDesi: 1, price: 96.47 }, // Şehir dışı fiyatı
      { minDesi: 2, maxDesi: 2, price: 109.34 },
      { minDesi: 3, maxDesi: 5, price: 156.40 },
      { minDesi: 6, maxDesi: 10, price: 211.92 },
      { minDesi: 11, maxDesi: 15, price: 265.46 },
      { minDesi: 16, maxDesi: 20, price: 337.34 },
      { minDesi: 21, maxDesi: 25, price: 418.35 },
      { minDesi: 26, maxDesi: 30, price: 485.64 },
      { minDesi: 31, maxDesi: 999, price: 485.64, additionalPrice: 13.37 }
    ]
  },
  {
    id: 'surat',
    name: 'Sürat Kargo',
    logo: '/cargo-logos/surat.png',
    apiEndpoint: process.env.SURAT_API_ENDPOINT || '',
    apiKey: process.env.SURAT_API_KEY || '',
    isActive: true,
    kdvRate: 10,
    pricing: [
      { minDesi: 0, maxDesi: 2, price: 79.16 },
      { minDesi: 3, maxDesi: 5, price: 93.74 },
      { minDesi: 6, maxDesi: 10, price: 119.94 },
      { minDesi: 11, maxDesi: 15, price: 149.42 },
      { minDesi: 16, maxDesi: 20, price: 199.23 },
      { minDesi: 21, maxDesi: 25, price: 259.42 },
      { minDesi: 26, maxDesi: 30, price: 311.31 },
      { minDesi: 31, maxDesi: 999, price: 311.31, additionalPrice: 10.72 }
    ]
  },
  {
    id: 'ptt',
    name: 'PTT Kargo',
    logo: '/cargo-logos/ptt.png',
    apiEndpoint: process.env.PTT_API_ENDPOINT || '',
    apiKey: process.env.PTT_API_KEY || '',
    isActive: true,
    kdvRate: 10,
    pricing: [
      { minDesi: 0, maxDesi: 0.5, price: 69.90 }, // 500gr'a kadar şehir dışı
      { minDesi: 0.5, maxDesi: 2, price: 81.25 },
      { minDesi: 3, maxDesi: 5, price: 107.00 },
      { minDesi: 6, maxDesi: 10, price: 149.00 },
      { minDesi: 11, maxDesi: 15, price: 210.00 },
      { minDesi: 16, maxDesi: 20, price: 255.00 },
      { minDesi: 21, maxDesi: 25, price: 313.00 },
      { minDesi: 26, maxDesi: 30, price: 370.00 }
    ]
  },
  {
    id: 'hepsijet',
    name: 'Hepsijet',
    logo: '/cargo-logos/hepsijet.png',
    apiEndpoint: process.env.HEPSIJET_API_ENDPOINT || '',
    apiKey: process.env.HEPSIJET_API_KEY || '',
    isActive: true,
    kdvRate: 10,
    pricing: [
      { minDesi: 0, maxDesi: 2, price: 69.90 },
      { minDesi: 3, maxDesi: 5, price: 89.90 },
      { minDesi: 6, maxDesi: 10, price: 118.00 },
      { minDesi: 11, maxDesi: 20, price: 170.00 },
      { minDesi: 21, maxDesi: 30, price: 260.00 }
    ]
  },
  {
    id: 'ups',
    name: 'UPS Kargo',
    logo: '/cargo-logos/ups.png',
    apiEndpoint: process.env.UPS_API_ENDPOINT || '',
    apiKey: process.env.UPS_API_KEY || '',
    isActive: true,
    kdvRate: 10,
    pricing: [
      { minDesi: 0, maxDesi: 2, price: 85.50 },
      { minDesi: 3, maxDesi: 5, price: 89.90 },
      { minDesi: 6, maxDesi: 10, price: 111.00 },
      { minDesi: 11, maxDesi: 15, price: 135.00 },
      { minDesi: 16, maxDesi: 20, price: 151.00 },
      { minDesi: 21, maxDesi: 25, price: 175.00 },
      { minDesi: 26, maxDesi: 30, price: 214.00 },
      { minDesi: 31, maxDesi: 40, price: 271.00 },
      { minDesi: 41, maxDesi: 50, price: 341.00 },
      { minDesi: 51, maxDesi: 999, price: 341.00, additionalPrice: 8.00 }
    ]
  }
];

// Kargo fiyat hesaplama - GERÇEK FİYATLARLA
export const getShippingQuotes = async (
  packageInfo: PackageInfo,
  _fromAddress: string,
  _toAddress: string
): Promise<ShippingQuote[]> => {
  const quotes: ShippingQuote[] = [];
  
  for (const company of cargoCompanies) {
    if (!company.isActive) continue;
    
    try {
      // Gerçek fiyat hesaplama
      const basePrice = calculatePrice(packageInfo.desi, company.pricing);
      const priceWithKDV = calculateWithKDV(basePrice, company.kdvRate);
      
      quotes.push({
        companyId: company.id,
        companyName: company.name,
        price: priceWithKDV,
        estimatedDays: Math.floor(Math.random() * 3) + 1, // 1-3 gün
        isAvailable: true
      });
    } catch (error) {
      quotes.push({
        companyId: company.id,
        companyName: company.name,
        price: 0,
        estimatedDays: 0,
        isAvailable: false,
        error: 'Kargo firması şu anda hizmet veremiyor'
      });
    }
  }
  
  return quotes.sort((a, b) => a.price - b.price); // Fiyata göre sırala
};

// Kargo takip numarası oluşturma
export const generateTrackingNumber = (companyId: string): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${companyId.toUpperCase()}${timestamp}${random}`;
};

// Kargo firması API entegrasyonları (şimdilik mock)
export const createShipment = async (
  companyId: string,
  shipmentData: {
    sender: any;
    receiver: any;
    package: PackageInfo;
    trackingNumber: string;
  }
) => {
  const company = cargoCompanies.find(c => c.id === companyId);
  if (!company) {
    throw new Error('Kargo firması bulunamadı');
  }
  
  // Gerçek fiyat hesaplama
  const basePrice = calculatePrice(shipmentData.package.desi, company.pricing);
  const priceWithKDV = calculateWithKDV(basePrice, company.kdvRate);
  
  // Şimdilik mock response, gerçek API'lerle değiştirilecek
  return {
    success: true,
    trackingNumber: shipmentData.trackingNumber,
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün sonra
    price: priceWithKDV
  };
}; 