'use client';

import { useState } from 'react';
import { SEOData } from '@/lib/seoService';

interface SEOGeneratorProps {
  productName: string;
  category: string;
  brand?: string;
  price?: number;
  description?: string;
  onSEOGenerated: (seoData: SEOData) => void;
}

export default function SEOGenerator({
  productName,
  category,
  brand,
  price,
  description,
  onSEOGenerated
}: SEOGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const generateSEO = async () => {
    if (!productName || !category) {
      setError('Ürün adı ve kategori zorunludur');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/seo/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productName,
          category,
          brand,
          price,
          description
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSeoData(result.data);
        onSEOGenerated(result.data);
        setShowPreview(true);
      } else {
        setError(result.error || 'SEO oluşturulurken hata oluştu');
      }
    } catch (error) {
      setError('SEO oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          SEO Otomatik Oluşturucu
        </h3>
        <button
          onClick={generateSEO}
          disabled={isLoading || !productName || !category}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Oluşturuluyor...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              SEO Oluştur
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {seoData && showPreview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Oluşturulan SEO Bilgileri</h4>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title ({seoData.metaTitle ? seoData.metaTitle.length : 0}/60)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={seoData.metaTitle}
                onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => copyToClipboard(seoData.metaTitle)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Kopyala
              </button>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description ({seoData.metaDescription ? seoData.metaDescription.length : 0}/160)
            </label>
            <div className="flex gap-2">
              <textarea
                value={seoData.metaDescription}
                onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => copyToClipboard(seoData.metaDescription)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Kopyala
              </button>
            </div>
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={seoData.urlSlug}
                onChange={(e) => setSeoData({ ...seoData, urlSlug: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => copyToClipboard(seoData.urlSlug)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Kopyala
              </button>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anahtar Kelimeler ({seoData.keywords && Array.isArray(seoData.keywords) ? seoData.keywords.length : 0}/10)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {seoData.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-md"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <input
              type="text"
              value={seoData.keywords.join(', ')}
              onChange={(e) => setSeoData({ 
                ...seoData, 
                keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
              })}
              placeholder="Anahtar kelimeleri virgülle ayırın"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={seoData.altText}
                onChange={(e) => setSeoData({ ...seoData, altText: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => copyToClipboard(seoData.altText)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Kopyala
              </button>
            </div>
          </div>

          {/* SEO Kalite Göstergesi */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h5 className="font-medium text-gray-900 mb-2">SEO Kalite Kontrolü</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${(seoData.metaTitle && seoData.metaTitle.length <= 60) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Meta Title: {seoData.metaTitle ? seoData.metaTitle.length : 0}/60 karakter</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${(seoData.metaDescription && seoData.metaDescription.length <= 160) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Meta Description: {seoData.metaDescription ? seoData.metaDescription.length : 0}/160 karakter</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${(seoData.keywords && Array.isArray(seoData.keywords) && seoData.keywords.length <= 10) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Anahtar Kelimeler: {seoData.keywords && Array.isArray(seoData.keywords) ? seoData.keywords.length : 0}/10</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 