'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  TrendingUp, 
  Globe, 
  Hash, 
  BarChart3,
  CheckCircle,
  Sparkles,
  Zap,
  RefreshCw
} from 'lucide-react';

interface AdvancedSEOData {
  // Temel SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  urlSlug: string;
  altText: string;
  
  // Gelişmiş SEO
  brand: string;
  model: string;
  sku: string;
  gtin: string;
  mpn: string;
  condition: 'new' | 'used' | 'refurbished';
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  
  // Ürün Detayları
  material: string;
  color: string;
  size: string;
  weight: string;
  dimensions: string;
  warranty: string;
  countryOfOrigin: string;
  
  // Sosyal Medya
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  
  // Yapılandırılmış Veri
  structuredData: string;
  canonicalUrl: string;
  hreflang: string;
  
  // Performans
  pageSpeed: number;
  mobileFriendly: boolean;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  
  // Analitik
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  
  // İçerik Kalitesi
  contentScore: number;
  readabilityScore: number;
  keywordDensity: number;
  
  // E-ticaret Özel
  categoryPath: string;
  subcategory: string;
  tags: string[];
  relatedProducts: string[];
  crossSellProducts: string[];
  upSellProducts: string[];
  
  // Arama Motoru
  robotsMeta: string;
  sitemapPriority: number;
  changeFrequency: string;
  lastModified: string;

  // Yapılandırılmış Veri Özel Alanları
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
  review?: {
    "@type": "Review";
    reviewRating: {
      "@type": "Rating";
      ratingValue: number;
    };
    author: {
      "@type": "Person";
      name: string;
    };
    reviewBody: string;
    datePublished: string;
  };
}

interface AdvancedSEOGeneratorProps {
  productName: string;
  category: string;
  brand?: string;
  price?: number;
  description?: string;
  images?: string[];
  onSEOGenerated: (seoData: AdvancedSEOData) => void;
}

export default function AdvancedSEOGenerator({
  productName,
  category,
  brand = 'ModaBase',
  price,
  description,
  images = [],
  onSEOGenerated
}: AdvancedSEOGeneratorProps) {
  const [seoData, setSeoData] = useState<AdvancedSEOData>({
    // Temel SEO
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    urlSlug: '',
    altText: '',
    
    // Gelişmiş SEO
    brand: brand,
    model: '',
    sku: '',
    gtin: '',
    mpn: '',
    condition: 'new',
    availability: 'in_stock',
    
    // Ürün Detayları
    material: '',
    color: '',
    size: '',
    weight: '',
    dimensions: '',
    warranty: '',
    countryOfOrigin: 'Türkiye',
    
    // Sosyal Medya
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: 'product',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    
    // Yapılandırılmış Veri
    structuredData: '',
    canonicalUrl: '',
    hreflang: 'tr-TR',
    
    // Performans
    pageSpeed: 0,
    mobileFriendly: true,
    coreWebVitals: {
      lcp: 0,
      fid: 0,
      cls: 0
    },
    
    // Analitik
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    
    // İçerik Kalitesi
    contentScore: 0,
    readabilityScore: 0,
    keywordDensity: 0,
    
    // E-ticaret Özel
    categoryPath: category,
    subcategory: '',
    tags: [],
    relatedProducts: [],
    crossSellProducts: [],
    upSellProducts: [],
    
    // Arama Motoru
    robotsMeta: 'index,follow',
    sitemapPriority: 0.8,
    changeFrequency: 'weekly',
    lastModified: new Date().toISOString()
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [seoScore, setSeoScore] = useState(0);

  useEffect(() => {
    if (productName && category) {
      generateBasicSEO();
    }
  }, [productName, category, price]);

  const generateBasicSEO = () => {
    // Güvenli kontroller
    const safeProductName = productName || '';
    const safeCategory = category || '';
    const safeBrand = brand || 'ModaBase';
    const safeDescription = description || '';
    const safeImages = images && Array.isArray(images) ? images : [];

    const slug = safeProductName.toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const metaTitle = `${safeProductName} - ${safeCategory} | ${safeBrand}`;
    const metaDescription = safeDescription && safeDescription.length > 0
      ? `${safeDescription.substring(0, 150)}...` 
      : `${safeProductName} - ${safeCategory} kategorisinde en uygun fiyatlarla. Hızlı kargo ve güvenli ödeme.`;

    const keywords = [
      safeProductName,
      safeCategory,
      safeBrand,
      'online alışveriş',
      'e-ticaret',
      'moda',
      'giyim'
    ].filter(Boolean);

    setSeoData(prev => ({
      ...prev,
      metaTitle,
      metaDescription,
      keywords,
      urlSlug: slug,
      altText: `${safeProductName} - ${safeCategory}`,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
      twitterTitle: metaTitle,
      twitterDescription: metaDescription,
      ogImage: safeImages.length > 0 ? (safeImages[0] || '') : '',
      twitterImage: safeImages.length > 0 ? (safeImages[0] || '') : ''
    }));

    calculateSEOScore();
  };

  const calculateSEOScore = () => {
    let score = 0;
    const checks = [];

    // Meta Title kontrolü - Güvenli kontrol
    if (seoData.metaTitle && seoData.metaTitle.length > 0 && seoData.metaTitle.length <= 60) {
      score += 15;
      checks.push({ name: 'Meta Title', status: 'success' });
    } else {
      checks.push({ name: 'Meta Title', status: 'error' });
    }

    // Meta Description kontrolü - Güvenli kontrol
    if (seoData.metaDescription && seoData.metaDescription.length > 0 && seoData.metaDescription.length <= 160) {
      score += 15;
      checks.push({ name: 'Meta Description', status: 'success' });
    } else {
      checks.push({ name: 'Meta Description', status: 'error' });
    }

    // Keywords kontrolü - Güvenli kontrol
    if (seoData.keywords && Array.isArray(seoData.keywords) && seoData.keywords.length > 0 && seoData.keywords.length <= 10) {
      score += 10;
      checks.push({ name: 'Keywords', status: 'success' });
    } else {
      checks.push({ name: 'Keywords', status: 'error' });
    }

    // URL Slug kontrolü - Güvenli kontrol
    if (seoData.urlSlug && seoData.urlSlug.length > 0) {
      score += 10;
      checks.push({ name: 'URL Slug', status: 'success' });
    } else {
      checks.push({ name: 'URL Slug', status: 'error' });
    }

    // Alt Text kontrolü - Güvenli kontrol
    if (seoData.altText && seoData.altText.length > 0) {
      score += 5;
      checks.push({ name: 'Alt Text', status: 'success' });
    } else {
      checks.push({ name: 'Alt Text', status: 'error' });
    }

    // Brand kontrolü - Güvenli kontrol
    if (seoData.brand && seoData.brand.length > 0) {
      score += 5;
      checks.push({ name: 'Brand', status: 'success' });
    } else {
      checks.push({ name: 'Brand', status: 'error' });
    }

    // SKU kontrolü - Güvenli kontrol
    if (seoData.sku && seoData.sku.length > 0) {
      score += 5;
      checks.push({ name: 'SKU', status: 'success' });
    } else {
      checks.push({ name: 'SKU', status: 'warning' });
    }

    // Structured Data kontrolü - Güvenli kontrol
    if (seoData.structuredData && seoData.structuredData.length > 0) {
      score += 10;
      checks.push({ name: 'Structured Data', status: 'success' });
    } else {
      checks.push({ name: 'Structured Data', status: 'warning' });
    }

    // Images kontrolü - Güvenli kontrol
    if (images && Array.isArray(images) && images.length > 0) {
      score += 10;
      checks.push({ name: 'Product Images', status: 'success' });
    } else {
      checks.push({ name: 'Product Images', status: 'error' });
    }

    // Description kontrolü - Güvenli kontrol
    if (description && typeof description === 'string' && description.length > 100) {
      score += 15;
      checks.push({ name: 'Product Description', status: 'success' });
    } else {
      checks.push({ name: 'Product Description', status: 'warning' });
    }

    setSeoScore(score);
  };

  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": productName,
      "description": seoData.metaDescription,
      "brand": {
        "@type": "Brand",
        "name": seoData.brand
      },
      "category": category,
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": "TRY",
        "availability": `https://schema.org/${seoData.availability}`,
        "condition": `https://schema.org/${seoData.condition}`,
        "seller": {
          "@type": "Organization",
          "name": brand
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0",
            "currency": "TRY"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "TR"
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "TR",
          "returnPolicyCategory": "https://schema.org/Refundable"
        }
      },
      "sku": seoData.sku,
      "mpn": seoData.mpn,
      "gtin": seoData.gtin,
      "weight": seoData.weight,
      "dimensions": seoData.dimensions,
      "material": seoData.material,
      "color": seoData.color,
      "size": seoData.size,
      "warranty": seoData.warranty,
      "countryOfOrigin": seoData.countryOfOrigin,
      ...(seoData.aggregateRating ? { "aggregateRating": seoData.aggregateRating } : {}),
      ...(seoData.review ? { "review": seoData.review } : {})
    };

    setSeoData(prev => ({
      ...prev,
      structuredData: JSON.stringify(structuredData, null, 2)
    }));
  };

  const handleSave = () => {
    onSEOGenerated(seoData);
  };

  const tabs = [
    { id: 'basic', name: 'Temel SEO', icon: Search },
    { id: 'advanced', name: 'Gelişmiş SEO', icon: TrendingUp },
    { id: 'social', name: 'Sosyal Medya', icon: Globe },
    { id: 'structured', name: 'Yapılandırılmış Veri', icon: Hash },
    { id: 'analytics', name: 'Analitik', icon: BarChart3 },
    { id: 'performance', name: 'Performans', icon: Zap }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gelişmiş SEO Yöneticisi</h3>
              <p className="text-sm text-gray-600">Trendyol benzeri profesyonel SEO optimizasyonu</p>
            </div>
          </div>
          
          {/* SEO Score */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{seoScore}</div>
              <div className="text-xs text-gray-500">SEO Puanı</div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={seoScore >= 80 ? "#10b981" : seoScore >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${seoScore}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold">{seoScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meta Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Title *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={seoData.metaTitle}
                    onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ürün meta başlığı"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      (seoData.metaTitle && seoData.metaTitle.length <= 60)
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {seoData.metaTitle ? seoData.metaTitle.length : 0}/60
                    </span>
                  </div>
                </div>
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={seoData.urlSlug}
                  onChange={(e) => setSeoData({ ...seoData, urlSlug: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="url-slug-format"
                />
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Description *
              </label>
              <div className="relative">
                <textarea
                  value={seoData.metaDescription}
                  onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ürün açıklaması (arama sonuçlarında görünür)"
                />
                <div className="absolute right-3 bottom-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    (seoData.metaDescription && seoData.metaDescription.length <= 160)
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {seoData.metaDescription ? seoData.metaDescription.length : 0}/160
                  </span>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Anahtar Kelimeler
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {seoData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2"
                  >
                    {keyword}
                    <button
                      onClick={() => setSeoData({
                        ...seoData,
                        keywords: seoData.keywords.filter((_, i) => i !== index)
                      })}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Yeni anahtar kelime ekle ve Enter'a bas"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const keyword = input.value.trim();
                    if (keyword && !seoData.keywords.includes(keyword)) {
                      setSeoData({
                        ...seoData,
                        keywords: [...seoData.keywords, keyword]
                      });
                      input.value = '';
                    }
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Alt Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alt Text (Görsel Açıklaması)
              </label>
              <input
                type="text"
                value={seoData.altText}
                onChange={(e) => setSeoData({ ...seoData, altText: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ürün görseli için açıklayıcı metin"
              />
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marka *
                </label>
                <input
                  type="text"
                  value={seoData.brand}
                  onChange={(e) => setSeoData({ ...seoData, brand: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ürün markası"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={seoData.model}
                  onChange={(e) => setSeoData({ ...seoData, model: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ürün modeli"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SKU (Stok Kodu)
                </label>
                <input
                  type="text"
                  value={seoData.sku}
                  onChange={(e) => setSeoData({ ...seoData, sku: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ürün stok kodu"
                />
              </div>

              {/* GTIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GTIN (Barkod)
                </label>
                <input
                  type="text"
                  value={seoData.gtin}
                  onChange={(e) => setSeoData({ ...seoData, gtin: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Global Trade Item Number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Condition */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ürün Durumu
                </label>
                <select
                  value={seoData.condition}
                  onChange={(e) => setSeoData({ ...seoData, condition: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="new">Yeni</option>
                  <option value="used">Kullanılmış</option>
                  <option value="refurbished">Yenilenmiş</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stok Durumu
                </label>
                <select
                  value={seoData.availability}
                  onChange={(e) => setSeoData({ ...seoData, availability: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="in_stock">Stokta</option>
                  <option value="out_of_stock">Stokta Yok</option>
                  <option value="preorder">Ön Sipariş</option>
                </select>
              </div>

              {/* Country of Origin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Menşei Ülke
                </label>
                <input
                  type="text"
                  value={seoData.countryOfOrigin}
                  onChange={(e) => setSeoData({ ...seoData, countryOfOrigin: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Türkiye"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Material */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Malzeme
                </label>
                <input
                  type="text"
                  value={seoData.material}
                  onChange={(e) => setSeoData({ ...seoData, material: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Pamuk, Polyester, vb."
                />
              </div>

              {/* Warranty */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Garanti
                </label>
                <input
                  type="text"
                  value={seoData.warranty}
                  onChange={(e) => setSeoData({ ...seoData, warranty: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2 yıl garanti"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OG Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Facebook/OG Başlık
                </label>
                <input
                  type="text"
                  value={seoData.ogTitle}
                  onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sosyal medya paylaşım başlığı"
                />
              </div>

              {/* OG Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Facebook/OG Açıklama
                </label>
                <textarea
                  value={seoData.ogDescription}
                  onChange={(e) => setSeoData({ ...seoData, ogDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sosyal medya paylaşım açıklaması"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Twitter Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Twitter Başlık
                </label>
                <input
                  type="text"
                  value={seoData.twitterTitle}
                  onChange={(e) => setSeoData({ ...seoData, twitterTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Twitter paylaşım başlığı"
                />
              </div>

              {/* Twitter Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Twitter Açıklama
                </label>
                <textarea
                  value={seoData.twitterDescription}
                  onChange={(e) => setSeoData({ ...seoData, twitterDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Twitter paylaşım açıklaması"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OG Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sosyal Medya Görseli
                </label>
                <input
                  type="text"
                  value={seoData.ogImage}
                  onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Twitter Card Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Twitter Kart Tipi
                </label>
                <select
                  value={seoData.twitterCard}
                  onChange={(e) => setSeoData({ ...seoData, twitterCard: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="summary">Özet</option>
                  <option value="summary_large_image">Büyük Görsel</option>
                  <option value="app">Uygulama</option>
                  <option value="player">Oynatıcı</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'structured' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Yapılandırılmış Veri (Schema.org)</h4>
              <button
                onClick={generateStructuredData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Otomatik Oluştur
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                JSON-LD Structured Data
              </label>
              <textarea
                value={seoData.structuredData}
                onChange={(e) => setSeoData({ ...seoData, structuredData: e.target.value })}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder='{"@context": "https://schema.org/", "@type": "Product", ...}'
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Canonical URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={seoData.canonicalUrl}
                  onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/product"
                />
              </div>

              {/* Hreflang */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dil ve Bölge
                </label>
                <input
                  type="text"
                  value={seoData.hreflang}
                  onChange={(e) => setSeoData({ ...seoData, hreflang: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tr-TR"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Google Analytics */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={seoData.googleAnalyticsId}
                  onChange={(e) => setSeoData({ ...seoData, googleAnalyticsId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              {/* Google Tag Manager */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Google Tag Manager ID
                </label>
                <input
                  type="text"
                  value={seoData.googleTagManagerId}
                  onChange={(e) => setSeoData({ ...seoData, googleTagManagerId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="GTM-XXXXXXX"
                />
              </div>

              {/* Facebook Pixel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  value={seoData.facebookPixelId}
                  onChange={(e) => setSeoData({ ...seoData, facebookPixelId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Robots Meta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Robots Meta
                </label>
                <select
                  value={seoData.robotsMeta}
                  onChange={(e) => setSeoData({ ...seoData, robotsMeta: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="index,follow">İndeksle ve Takip Et</option>
                  <option value="noindex,nofollow">İndeksleme ve Takip Etme</option>
                  <option value="index,nofollow">İndeksle, Takip Etme</option>
                  <option value="noindex,follow">İndeksleme, Takip Et</option>
                </select>
              </div>

              {/* Sitemap Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sitemap Önceliği
                </label>
                <select
                  value={seoData.sitemapPriority}
                  onChange={(e) => setSeoData({ ...seoData, sitemapPriority: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1.0}>1.0 - En Yüksek</option>
                  <option value={0.9}>0.9 - Çok Yüksek</option>
                  <option value={0.8}>0.8 - Yüksek</option>
                  <option value={0.7}>0.7 - Orta-Yüksek</option>
                  <option value={0.6}>0.6 - Orta</option>
                  <option value={0.5}>0.5 - Düşük-Orta</option>
                  <option value={0.4}>0.4 - Düşük</option>
                  <option value={0.3}>0.3 - Çok Düşük</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Performans Metrikleri</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Page Speed */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{seoData.pageSpeed}</div>
                  <div className="text-sm text-gray-600">Sayfa Hızı (ms)</div>
                </div>

                {/* Mobile Friendly */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {seoData.mobileFriendly ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-gray-600">Mobil Uyumlu</div>
                </div>

                {/* Core Web Vitals */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {seoData.coreWebVitals.lcp + seoData.coreWebVitals.fid + seoData.coreWebVitals.cls}
                  </div>
                  <div className="text-sm text-gray-600">Core Web Vitals</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LCP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  LCP (Largest Contentful Paint)
                </label>
                <input
                  type="number"
                  value={seoData.coreWebVitals.lcp}
                  onChange={(e) => setSeoData({
                    ...seoData,
                    coreWebVitals: { ...seoData.coreWebVitals, lcp: parseFloat(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2.5"
                />
              </div>

              {/* FID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  FID (First Input Delay)
                </label>
                <input
                  type="number"
                  value={seoData.coreWebVitals.fid}
                  onChange={(e) => setSeoData({
                    ...seoData,
                    coreWebVitals: { ...seoData.coreWebVitals, fid: parseFloat(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
              </div>

              {/* CLS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CLS (Cumulative Layout Shift)
                </label>
                <input
                  type="number"
                  value={seoData.coreWebVitals.cls}
                  onChange={(e) => setSeoData({
                    ...seoData,
                    coreWebVitals: { ...seoData.coreWebVitals, cls: parseFloat(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              SEO Ayarlarını Kaydet
            </button>
            <button
              onClick={generateBasicSEO}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Yeniden Oluştur
            </button>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">SEO Puanı</div>
            <div className="text-2xl font-bold text-gray-900">{seoScore}/100</div>
          </div>
        </div>
      </div>
    </div>
  );
} 