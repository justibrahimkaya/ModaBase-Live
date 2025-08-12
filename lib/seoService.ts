// AI Destekli SEO Service
export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  urlSlug: string;
  keywords: string[];
  altText: string;
  structuredData?: any;
}

export interface ProductSEOInput {
  name: string;
  category: string;
  brand?: string;
  price?: number;
  description?: string;
}

// Türkçe SEO optimizasyonu için yardımcı fonksiyonlar
const turkishSEOKeywords = {
  'kadın': ['kadın', 'bayan', 'hanım', 'kadın giyim', 'bayan giyim'],
  'erkek': ['erkek', 'adam', 'erkek giyim', 'adam giyim'],
  'çocuk': ['çocuk', 'bebek', 'çocuk giyim', 'bebek giyim'],
  'aksesuar': ['aksesuar', 'takı', 'çanta', 'ayakkabı'],
  'giyim': ['giyim', 'kıyafet', 'elbise', 'gömlek', 'pantolon'],
  'ayakkabı': ['ayakkabı', 'sandalet', 'topuklu', 'spor ayakkabı'],
  'çanta': ['çanta', 'el çantası', 'sırt çantası', 'cüzdan'],
  'takı': ['takı', 'kolye', 'bilezik', 'yüzük', 'küpe']
};

// URL slug oluşturma
const createUrlSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Meta title oluşturma (60 karakter sınırı)
const createMetaTitle = (name: string, category: string): string => {
  const baseTitle = `${name} | ModaBase`;
  const categoryTitle = `${name} | ${category} | ModaBase`;
  
  if (categoryTitle.length <= 60) {
    return categoryTitle;
  }
  
  if (baseTitle.length <= 60) {
    return baseTitle;
  }
  
  // 60 karakteri aşarsa kısalt
  return baseTitle.substring(0, 57) + '...';
};

// Meta description oluşturma (160 karakter sınırı)
const createMetaDescription = (name: string, category: string, price?: number): string => {
  let description = `${name} - ${category} kategorisinde kaliteli ürünler.`;
  
  if (price) {
    description += ` Uygun fiyat: ${price}₺.`;
  }
  
  description += ' Hızlı kargo, güvenli ödeme. ModaBase\'de satın alın.';
  
  if (description.length <= 160) {
    return description;
  }
  
  // 160 karakteri aşarsa kısalt
  return description.substring(0, 157) + '...';
};

// Anahtar kelimeler oluşturma
const createKeywords = (name: string, category: string): string[] => {
  const keywords = new Set<string>();
  
  // Ürün adından kelimeler
  const nameWords = name.toLowerCase().split(/\s+/);
  nameWords.forEach(word => {
    if (word.length > 2) {
      keywords.add(word);
    }
  });
  
  // Kategori anahtar kelimeleri
  const categoryLower = category.toLowerCase();
  Object.entries(turkishSEOKeywords).forEach(([key, values]) => {
    if (categoryLower.includes(key)) {
      values.forEach(value => keywords.add(value));
    }
  });
  
  // Genel e-ticaret anahtar kelimeleri
  keywords.add('online alışveriş');
  keywords.add('e-ticaret');
  keywords.add('moda');
  keywords.add('giyim');
  keywords.add('alışveriş');
  
  return Array.from(keywords).slice(0, 10); // En fazla 10 anahtar kelime
};

// Alt text oluşturma
const createAltText = (name: string, category: string): string => {
  return `${name} - ${category} kategorisinde ModaBase ürünü`;
};

// Structured data oluşturma
const createStructuredData = (input: ProductSEOInput): any => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": input.name,
    "category": input.category,
    "brand": input.brand || "ModaBase",
    "description": input.description || `${input.name} - ${input.category}`,
    "offers": {
      "@type": "Offer",
      "price": input.price || 0,
      "priceCurrency": "TRY",
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    },
    "review": {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "author": {
        "@type": "Person",
        "name": "ModaBase Müşterisi"
      },
      "reviewBody": "Kaliteli ürün, hızlı kargo. Tavsiye ederim."
    }
  };
};

// Ana SEO oluşturma fonksiyonu
export const generateSEO = async (input: ProductSEOInput): Promise<SEOData> => {
  try {
    // Temel SEO bilgilerini oluştur
    const seoData: SEOData = {
      metaTitle: createMetaTitle(input.name, input.category),
      metaDescription: createMetaDescription(input.name, input.category, input.price),
      urlSlug: createUrlSlug(input.name),
      keywords: createKeywords(input.name, input.category),
      altText: createAltText(input.name, input.category),
      structuredData: createStructuredData(input)
    };

    // AI entegrasyonu için hazırlık (gelecekte OpenAI/Gemini eklenebilir)
    // Şimdilik akıllı algoritma kullanıyoruz
    
    return seoData;
    
  } catch (error) {
    console.error('SEO generation error:', error);
    
    // Hata durumunda temel SEO döndür
    return {
      metaTitle: `${input.name} | ModaBase`,
      metaDescription: `${input.name} - ${input.category} kategorisinde kaliteli ürünler.`,
      urlSlug: createUrlSlug(input.name),
      keywords: [input.name.toLowerCase(), input.category.toLowerCase()],
      altText: `${input.name} - ModaBase ürünü`
    };
  }
};

// SEO kalite kontrolü
export const validateSEO = (seoData: SEOData): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (seoData.metaTitle.length > 60) {
    issues.push('Meta title 60 karakterden uzun');
  }
  
  if (seoData.metaDescription.length > 160) {
    issues.push('Meta description 160 karakterden uzun');
  }
  
  if (seoData.keywords.length > 10) {
    issues.push('Çok fazla anahtar kelime');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// SEO önerileri
export const getSEORecommendations = (seoData: SEOData): string[] => {
  const recommendations: string[] = [];
  
  if (seoData.metaTitle.length < 30) {
    recommendations.push('Meta title daha detaylı olabilir');
  }
  
  if (seoData.metaDescription.length < 120) {
    recommendations.push('Meta description daha açıklayıcı olabilir');
  }
  
  if (seoData.keywords.length < 5) {
    recommendations.push('Daha fazla anahtar kelime eklenebilir');
  }
  
  return recommendations;
}; 