'use client'

import { useState, useEffect } from 'react'
import { 
  Search, TrendingUp, Target, BarChart3, Settings, 
  Globe, Eye, Zap, CheckCircle, AlertTriangle,
  Edit, RefreshCw
} from 'lucide-react'

interface SEOSettings {
  id: string
  pageType: string
  pageId?: string
  pageSlug?: string
  metaTitle: string
  metaDescription: string
  keywords: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  structuredData?: string
  canonicalUrl?: string
  robotsMeta?: string
  hreflang?: string
  googleAnalyticsId?: string
  googleTagManagerId?: string
  facebookPixelId?: string
  isActive: boolean
  priority: number
  lastAuditDate?: string
  seoScore?: number
  auditNotes?: string
  createdAt: string
  updatedAt: string
}

interface SEODashboardProps {
  onEditSEO?: (pageType: string, pageId?: string) => void
}

export default function SEODashboard({ onEditSEO }: SEODashboardProps) {
  const [seoSettings, setSeoSettings] = useState<SEOSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPages: 0,
    optimizedPages: 0,
    averageScore: 0,
    criticalIssues: 0,
    improvementOpportunities: 0
  })

  useEffect(() => {
    fetchSEOSettings()
  }, [])

  const fetchSEOSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/seo/settings')
      if (response.ok) {
        const data = await response.json()
        setSeoSettings(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('SEO settings fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (settings: SEOSettings[]) => {
    const totalPages = settings.length
    const optimizedPages = settings.filter(s => s.seoScore && s.seoScore >= 80).length
    const averageScore = totalPages > 0 
      ? Math.round(settings.reduce((sum, s) => sum + (s.seoScore || 0), 0) / totalPages)
      : 0
    const criticalIssues = settings.filter(s => s.seoScore && s.seoScore < 50).length
    const improvementOpportunities = settings.filter(s => s.seoScore && s.seoScore >= 50 && s.seoScore < 80).length

    setStats({
      totalPages,
      optimizedPages,
      averageScore,
      criticalIssues,
      improvementOpportunities
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getPageTypeIcon = (pageType: string) => {
    switch (pageType) {
      case 'homepage': return <Globe className="w-4 h-4" />
      case 'category': return <BarChart3 className="w-4 h-4" />
      case 'product': return <Target className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const getPageTypeName = (pageType: string) => {
    switch (pageType) {
      case 'homepage': return 'Anasayfa'
      case 'category': return 'Kategori'
      case 'product': return 'Ürün'
      default: return 'Genel'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">SEO Yönetimi</h2>
            <p className="text-sm text-gray-600">Arama motoru optimizasyonu ve performans takibi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSEOSettings}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
          <button
            onClick={() => onEditSEO?.('homepage')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Edit className="w-4 h-4" />
            SEO Düzenle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Toplam Sayfa</p>
              <p className="text-2xl font-bold">{stats.totalPages}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Optimize Edilmiş</p>
              <p className="text-2xl font-bold">{stats.optimizedPages}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Ortalama Skor</p>
              <p className="text-2xl font-bold">{stats.averageScore}/100</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Kritik Sorun</p>
              <p className="text-2xl font-bold">{stats.criticalIssues}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">İyileştirme</p>
              <p className="text-2xl font-bold">{stats.improvementOpportunities}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* SEO Pages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">SEO Sayfaları</h3>
          <p className="text-sm text-gray-600 mt-1">Tüm sayfaların SEO durumu ve performansı</p>
        </div>

        <div className="divide-y divide-gray-200">
          {seoSettings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz SEO ayarı bulunmuyor</h3>
              <p className="text-gray-600 mb-4">İlk SEO ayarlarınızı yapmak için "SEO Düzenle" butonuna tıklayın</p>
              <button
                onClick={() => onEditSEO?.('homepage')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                İlk SEO Ayarını Yap
              </button>
            </div>
          ) : (
            seoSettings.map((setting) => (
              <div key={setting.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getPageTypeIcon(setting.pageType)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getPageTypeName(setting.pageType)}
                        {setting.pageSlug && setting.pageSlug !== '/' && (
                          <span className="text-gray-500 ml-2">({setting.pageSlug})</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{setting.metaTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* SEO Score */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(setting.seoScore || 0)} ${getScoreColor(setting.seoScore || 0)}`}>
                      {setting.seoScore || 0}/100
                    </div>

                    {/* Status */}
                    <div className={`w-3 h-3 rounded-full ${
                      setting.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`} title={setting.isActive ? 'Aktif' : 'Pasif'} />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditSEO?.(setting.pageType, setting.pageId)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="SEO Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Önizle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                  <span>Son güncelleme: {new Date(setting.updatedAt).toLocaleDateString('tr-TR')}</span>
                  {setting.lastAuditDate && (
                    <span>Son denetim: {new Date(setting.lastAuditDate).toLocaleDateString('tr-TR')}</span>
                  )}
                  <span>Öncelik: {setting.priority}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onEditSEO?.('homepage')}
          className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-blue-100 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Anasayfa SEO</h4>
              <p className="text-sm text-gray-600">Ana sayfa optimizasyonu</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onEditSEO?.('category')}
          className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Kategori SEO</h4>
              <p className="text-sm text-gray-600">Kategori sayfaları</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onEditSEO?.('product')}
          className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Ürün SEO</h4>
              <p className="text-sm text-gray-600">Ürün sayfaları</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
} 