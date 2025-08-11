'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  RefreshCw, 
  Globe, 
  BarChart3, 
  Target,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'

interface SEOEditModalProps {
  isOpen: boolean
  onClose: () => void
  pageType: string
  pageId?: string | undefined
  initialData?: any
}

export default function SEOEditModal({ 
  isOpen, 
  onClose, 
  pageType, 
  pageId, 
  initialData 
}: SEOEditModalProps) {
  const [form, setForm] = useState({
    pageType,
    pageId,
    pageSlug: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: 'website',
    twitterCard: 'summary',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    structuredData: '',
    canonicalUrl: '',
    robotsMeta: 'index,follow',
    hreflang: 'tr-TR',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    isActive: true,
    priority: 0
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [seoScore, setSeoScore] = useState(0)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData)
        setSeoScore(initialData.seoScore || 0)
      } else {
        // Yeni SEO ayarı için varsayılan değerler
        setForm({
          ...form,
          pageType,
          pageId,
          pageSlug: pageType === 'homepage' ? '/' : '',
          metaTitle: getDefaultTitle(pageType),
          metaDescription: getDefaultDescription(pageType),
          keywords: getDefaultKeywords(pageType),
          ogTitle: getDefaultTitle(pageType),
          ogDescription: getDefaultDescription(pageType),
          ogType: pageType === 'product' ? 'product' : 'website'
        })
      }
    }
  }, [isOpen, initialData, pageType, pageId])

  const getDefaultTitle = (type: string) => {
    switch (type) {
      case 'homepage': return 'ModaBase - Modern E-Ticaret Platformu'
      case 'category': return 'Kategori - ModaBase'
      case 'product': return 'Ürün - ModaBase'
      default: return 'ModaBase'
    }
  }

  const getDefaultDescription = (type: string) => {
    switch (type) {
      case 'homepage': return 'ModaBase ile en yeni moda ürünlerini keşfedin. Hızlı kargo, güvenli ödeme ve kaliteli ürünler.'
      case 'category': return 'Kategori sayfası - ModaBase'
      case 'product': return 'Ürün detayları - ModaBase'
      default: return 'ModaBase - Modern E-Ticaret Platformu'
    }
  }

  const getDefaultKeywords = (type: string) => {
    switch (type) {
      case 'homepage': return 'moda, e-ticaret, alışveriş, giyim, ayakkabı, çanta, takı'
      case 'category': return 'kategori, moda, ürünler'
      case 'product': return 'ürün, moda, alışveriş'
      default: return 'moda, e-ticaret'
    }
  }

  const calculateSEOScore = () => {
    let score = 0
    if (form.metaTitle) score += 25
    if (form.metaDescription) score += 20
    if (form.keywords) score += 15
    if (form.ogTitle) score += 5
    if (form.ogDescription) score += 5
    if (form.ogImage) score += 5
    if (form.ogType) score += 5
    if (form.structuredData) score += 20
    setSeoScore(Math.min(100, score))
  }

  useEffect(() => {
    calculateSEOScore()
  }, [form])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = initialData 
        ? `/api/admin/seo/settings/${initialData.id}`
        : '/api/admin/seo/settings'
      
      const method = initialData ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        setSuccess(initialData ? 'SEO ayarları güncellendi!' : 'SEO ayarları oluşturuldu!')
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1500)
      } else {
        const data = await response.json()
        setError(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      setError('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const generateSEO = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.metaTitle,
          category: pageType,
          description: form.metaDescription
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setForm({
            ...form,
            metaTitle: data.data.metaTitle,
            metaDescription: data.data.metaDescription,
            keywords: data.data.keywords.join(', '),
            ogTitle: data.data.metaTitle,
            ogDescription: data.data.metaDescription
          })
          setSuccess('SEO otomatik oluşturuldu!')
        }
      }
    } catch (error) {
      setError('SEO oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              {pageType === 'homepage' && <Globe className="w-5 h-5 text-white" />}
              {pageType === 'category' && <BarChart3 className="w-5 h-5 text-white" />}
              {pageType === 'product' && <Target className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {getPageTypeName(pageType)} SEO Düzenle
              </h2>
              <p className="text-sm text-gray-600">SEO ayarlarını yapılandırın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SEO Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">SEO Skoru</h3>
                  <p className="text-sm text-gray-600">Mevcut optimizasyon seviyesi</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  seoScore >= 80 ? 'text-green-600' : 
                  seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {seoScore}/100
                </div>
                <div className="text-sm text-gray-600">
                  {seoScore >= 80 ? 'Mükemmel' : 
                   seoScore >= 60 ? 'İyi' : 'Geliştirilmeli'}
                </div>
              </div>
            </div>
          </div>

          {/* Auto Generate Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={generateSEO}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              SEO Otomatik Oluştur
            </button>
          </div>

          {/* Basic SEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title *
              </label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => setForm({...form, metaTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sayfa başlığı (60 karakter)"
                maxLength={60}
              />
              <div className="text-xs text-gray-500 mt-1">
                {form.metaTitle ? form.metaTitle.length : 0}/60 karakter
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description *
              </label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm({...form, metaDescription: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sayfa açıklaması (160 karakter)"
                rows={3}
                maxLength={160}
              />
              <div className="text-xs text-gray-500 mt-1">
                {form.metaDescription ? form.metaDescription.length : 0}/160 karakter
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords *
              </label>
              <input
                type="text"
                value={form.keywords}
                onChange={(e) => setForm({...form, keywords: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Anahtar kelimeler (virgülle ayırın)"
              />
            </div>
          </div>

          {/* Open Graph */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Graph</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Title
                </label>
                <input
                  type="text"
                  value={form.ogTitle}
                  onChange={(e) => setForm({...form, ogTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sosyal medya başlığı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Description
                </label>
                <textarea
                  value={form.ogDescription}
                  onChange={(e) => setForm({...form, ogDescription: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sosyal medya açıklaması"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Image URL
                </label>
                <input
                  type="url"
                  value={form.ogImage}
                  onChange={(e) => setForm({...form, ogImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Type
                </label>
                <select
                  value={form.ogType}
                  onChange={(e) => setForm({...form, ogType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="website">Website</option>
                  <option value="product">Product</option>
                  <option value="article">Article</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gelişmiş Ayarlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={form.canonicalUrl}
                  onChange={(e) => setForm({...form, canonicalUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robots Meta
                </label>
                <select
                  value={form.robotsMeta}
                  onChange={(e) => setForm({...form, robotsMeta: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="index,follow">index, follow</option>
                  <option value="noindex,nofollow">noindex, nofollow</option>
                  <option value="index,nofollow">index, nofollow</option>
                  <option value="noindex,follow">noindex, follow</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hreflang
                </label>
                <input
                  type="text"
                  value={form.hreflang}
                  onChange={(e) => setForm({...form, hreflang: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tr-TR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({...form, priority: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {initialData ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getPageTypeName(pageType: string) {
  switch (pageType) {
    case 'homepage': return 'Anasayfa'
    case 'category': return 'Kategori'
    case 'product': return 'Ürün'
    default: return 'Sayfa'
  }
} 