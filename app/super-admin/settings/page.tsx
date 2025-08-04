'use client'

import { useState } from 'react'
import { 
  Settings, 
  Save,
  RefreshCw,
  Database,
  Mail,
  Shield,
  Globe,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Server,
  CreditCard,
  Users,
} from 'lucide-react'

interface SystemSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  adminEmail: string
  supportEmail: string
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPassword: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxFileSize: number
  allowedFileTypes: string[]
  currency: string
  taxRate: number
  shippingFee: number
  minimumOrderAmount: number
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'ModaBase',
    siteDescription: 'Türkiye\'nin En Büyük Moda Platformu',
    siteUrl: 'https://modabase.com.tr',
    adminEmail: 'admin@modabase.com.tr',
    supportEmail: 'support@modabase.com.tr',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileSize: 5,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    currency: 'TRY',
    taxRate: 18,
    shippingFee: 15,
    minimumOrderAmount: 100
  })
  
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const handleSave = async () => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1500)
  }

  const handleReset = () => {
    // Reset to default values
    setSettings({
      siteName: 'ModaBase',
      siteDescription: 'Türkiye\'nin En Büyük Moda Platformu',
      siteUrl: 'https://modabase.com.tr',
      adminEmail: 'admin@modabase.com.tr',
      supportEmail: 'support@modabase.com.tr',
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      maxFileSize: 5,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      currency: 'TRY',
      taxRate: 18,
      shippingFee: 15,
      minimumOrderAmount: 100
    })
  }

  const tabs = [
    { id: 'general', name: 'Genel', icon: Globe },
    { id: 'email', name: 'E-posta', icon: Mail },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'system', name: 'Sistem', icon: Settings },
    { id: 'commerce', name: 'E-Ticaret', icon: CreditCard },
    { id: 'maintenance', name: 'Bakım', icon: AlertTriangle }
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Site Adı</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Site URL</label>
          <input
            type="url"
            value={settings.siteUrl}
            onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Site Açıklaması</label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
          rows={3}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Admin E-posta</label>
          <input
            type="email"
            value={settings.adminEmail}
            onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Destek E-posta</label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-center mb-3">
          <Info className="h-5 w-5 text-yellow-400 mr-2" />
          <h3 className="text-lg font-semibold text-yellow-400">SMTP Ayarları</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
            <input
              type="text"
              value={settings.smtpPort}
              onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Kullanıcı Adı</label>
            <input
              type="text"
              value={settings.smtpUser}
              onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Şifre</label>
            <input
              type="password"
              value={settings.smtpPassword}
              onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-white">Kullanıcı Kaydı</h3>
              <p className="text-sm text-gray-400">Yeni kullanıcıların kayıt olmasına izin ver</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.registrationEnabled}
              onChange={(e) => setSettings({...settings, registrationEnabled: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-green-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-white">E-posta Doğrulama</h3>
              <p className="text-sm text-gray-400">Kayıt sonrası e-posta doğrulaması zorunlu</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailVerificationRequired}
              onChange={(e) => setSettings({...settings, emailVerificationRequired: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center mb-3">
          <Upload className="h-5 w-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-blue-400">Dosya Yükleme Ayarları</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Maksimum Dosya Boyutu (MB)</label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">İzin Verilen Dosya Türleri</label>
            <input
              type="text"
              value={settings.allowedFileTypes.join(', ')}
              onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value.split(', ')})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
          <Server className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Sunucu Durumu</h3>
          <div className="flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            <span className="text-green-400">Online</span>
          </div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
          <Database className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Veritabanı</h3>
          <div className="flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-blue-400 mr-2" />
            <span className="text-blue-400">Bağlı</span>
          </div>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
          <Mail className="h-12 w-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">E-posta Servisi</h3>
          <div className="flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
            <span className="text-purple-400">Aktif</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sistem Bilgileri</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Platform:</span>
            <span className="text-white">Next.js 14</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Node.js Versiyonu:</span>
            <span className="text-white">v18.17.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Veritabanı:</span>
            <span className="text-white">PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Uptime:</span>
            <span className="text-white">7 gün 14 saat</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCommerceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Para Birimi</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({...settings, currency: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TRY">Türk Lirası (₺)</option>
            <option value="USD">Amerikan Doları ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">KDV Oranı (%)</label>
          <input
            type="number"
            value={settings.taxRate}
            onChange={(e) => setSettings({...settings, taxRate: parseInt(e.target.value)})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Kargo Ücreti (₺)</label>
          <input
            type="number"
            value={settings.shippingFee}
            onChange={(e) => setSettings({...settings, shippingFee: parseInt(e.target.value)})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Sipariş Tutarı (₺)</label>
          <input
            type="number"
            value={settings.minimumOrderAmount}
            onChange={(e) => setSettings({...settings, minimumOrderAmount: parseInt(e.target.value)})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )

  const renderMaintenanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mr-4" />
            <div>
              <h3 className="text-xl font-semibold text-white">Bakım Modu</h3>
              <p className="text-gray-400">Site geçici olarak kapatılır, sadece adminler erişebilir</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Veritabanı Yedekleme</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Yedek İndir
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-200">
              <Upload className="h-4 w-4 mr-2" />
              Yedek Yükle
            </button>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sistem Temizliği</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-all duration-200">
              <RefreshCw className="h-4 w-4 mr-2" />
              Cache Temizle
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200">
              <Trash2 className="h-4 w-4 mr-2" />
              Log Temizle
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Sistem Ayarları
              </h1>
              <p className="text-gray-400 mt-1">Site ve sistem yapılandırmasını yönetin</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sıfırla
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-600/20 text-white border border-orange-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'email' && renderEmailSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'system' && renderSystemSettings()}
          {activeTab === 'commerce' && renderCommerceSettings()}
          {activeTab === 'maintenance' && renderMaintenanceSettings()}
        </div>
      </div>
    </div>
  )
}
