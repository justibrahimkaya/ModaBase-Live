'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Mail, 
  Shield, 
  Bell, 
  Database, 
  Palette, 
  Key,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  Server,
  HardDrive
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [settings, setSettings] = useState({
    siteName: 'ModaBase',
    siteDescription: 'Modern E-Ticaret Platformu',
    siteEmail: 'info@modabase.com.tr',
    maintenanceMode: false,
    emailNotifications: true,
    orderNotifications: true,
    lowStockNotifications: true,
    apiKey: '••••••••••••••••••••••••••••••••',
    maxFileSize: '10',
    allowedFileTypes: 'jpg,jpeg,png,gif,webp',
    dbBackupEnabled: true,
    backupFrequency: 'daily',
    themeColor: '#f97316',
    currency: 'TRY',
    timezone: 'Europe/Istanbul'
  })

  useEffect(() => {
    setMounted(true)
    fetchSettings()
    if (activeTab === 'system') {
      fetchSystemStatus()
    }
  }, [activeTab])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Settings fetch error:', error)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/settings/system-status', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      }
    } catch (error) {
      console.error('System status fetch error:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        const data = await response.json()
        alert('✅ ' + data.message)
      } else {
        const error = await response.json()
        alert('❌ ' + error.error)
      }
    } catch (error) {
      console.error('Settings save error:', error)
      alert('❌ Ayarlar kaydedilirken bir hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateNewApiKey = async () => {
    if (!confirm('Yeni API anahtarı oluşturulsun mu? Mevcut anahtar geçersiz olacak!')) {
      return
    }

    try {
      const response = await fetch('/api/admin/settings/generate-api-key', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          apiKey: data.apiKey
        }))
        alert('✅ ' + data.message)
      } else {
        const error = await response.json()
        alert('❌ ' + error.error)
      }
    } catch (error) {
      console.error('API key generation error:', error)
      alert('❌ API anahtarı oluşturulamadı!')
    }
  }

  const tabs = [
    { id: 'general', name: 'Genel', icon: Settings },
    { id: 'notifications', name: 'Bildirimler', icon: Bell },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'system', name: 'Sistem', icon: Server },
    { id: 'appearance', name: 'Görünüm', icon: Palette }
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-600 to-purple-700 bg-clip-text text-transparent mb-2">
            Sistem Ayarları
          </h1>
          <p className="text-lg text-gray-600 font-medium">Uygulama ayarlarını yapılandırın</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-gray-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <Settings className="h-6 w-6 text-orange-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">Genel Ayarlar</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Site Adı
                          </label>
                          <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Site E-posta
                          </label>
                          <input
                            type="email"
                            value={settings.siteEmail}
                            onChange={(e) => handleInputChange('siteEmail', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Site Açıklaması
                          </label>
                          <textarea
                            value={settings.siteDescription}
                            onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Para Birimi
                          </label>
                          <select
                            value={settings.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="TRY">Türk Lirası (₺)</option>
                            <option value="USD">Amerikan Doları ($)</option>
                            <option value="EUR">Euro (€)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Zaman Dilimi
                          </label>
                          <select
                            value={settings.timezone}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">New York (UTC-5)</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">Bakım Modu</span>
                            </label>
                          </div>
                          <div className="ml-4 flex items-center">
                            <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                            <span className="text-sm text-orange-700">Site ziyaretçilere kapalı olacak</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <Bell className="h-6 w-6 text-orange-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">Bildirim Ayarları</h2>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-center">
                            <Mail className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">E-posta Bildirimleri</p>
                              <p className="text-sm text-gray-500">Genel e-posta bildirimlerini al</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.emailNotifications}
                              onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Sipariş Bildirimleri</p>
                              <p className="text-sm text-gray-500">Yeni sipariş geldiğinde bildirim al</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.orderNotifications}
                              onChange={(e) => handleInputChange('orderNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Stok Bildirimleri</p>
                              <p className="text-sm text-gray-500">Stok azaldığında bildirim al</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.lowStockNotifications}
                              onChange={(e) => handleInputChange('lowStockNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <Shield className="h-6 w-6 text-orange-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">Güvenlik Ayarları</h2>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                          <div className="flex items-center mb-3">
                            <Key className="h-5 w-5 text-purple-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">API Anahtarı</h3>
                          </div>
                          <div className="relative">
                            <input
                              type={showApiKey ? 'text' : 'password'}
                              value={settings.apiKey}
                              readOnly
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            />
                            <button
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showApiKey ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                          <button 
                            onClick={generateNewApiKey}
                            className="mt-3 flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Yeni Anahtar Oluştur
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Maksimum Dosya Boyutu (MB)
                            </label>
                            <input
                              type="number"
                              value={settings.maxFileSize}
                              onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              İzin Verilen Dosya Türleri
                            </label>
                            <input
                              type="text"
                              value={settings.allowedFileTypes}
                              onChange={(e) => handleInputChange('allowedFileTypes', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'system' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <Server className="h-6 w-6 text-orange-600 mr-3" />
                          <h2 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h2>
                        </div>
                        <button
                          onClick={fetchSystemStatus}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Yenile
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-center mb-3">
                            <Database className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Veritabanı Yedekleme</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.dbBackupEnabled}
                                  onChange={(e) => handleInputChange('dbBackupEnabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">Otomatik Yedekleme</span>
                              </label>
                            </div>
                            <select
                              value={settings.backupFrequency}
                              onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="daily">Günlük</option>
                              <option value="weekly">Haftalık</option>
                              <option value="monthly">Aylık</option>
                            </select>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center mb-3">
                            <HardDrive className="h-5 w-5 text-green-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Sistem Durumu</h3>
                          </div>
                          <div className="space-y-2">
                            {systemStatus ? (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Disk Kullanımı</span>
                                  <span className={`text-sm font-medium ${systemStatus.disk.usage > 80 ? 'text-red-600' : systemStatus.disk.usage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {systemStatus.disk.usage}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${systemStatus.disk.usage > 80 ? 'bg-red-600' : systemStatus.disk.usage > 60 ? 'bg-yellow-600' : 'bg-green-600'}`}
                                    style={{ width: `${systemStatus.disk.usage}%` }}
                                  ></div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Bellek Kullanımı</span>
                                  <span className={`text-sm font-medium ${systemStatus.memory.usage > 80 ? 'text-red-600' : systemStatus.memory.usage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {systemStatus.memory.usage}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${systemStatus.memory.usage > 80 ? 'bg-red-600' : systemStatus.memory.usage > 60 ? 'bg-yellow-600' : 'bg-green-600'}`}
                                    style={{ width: `${systemStatus.memory.usage}%` }}
                                  ></div>
                                </div>
                                <div className="mt-4 text-xs text-gray-500 space-y-1">
                                  <div>Platform: {systemStatus.platform}</div>
                                  <div>Node.js: {systemStatus.nodeVersion}</div>
                                  <div>Uptime: {systemStatus.uptime.days}d {systemStatus.uptime.hours}h {systemStatus.uptime.minutes}m</div>
                                  <div>Bellek: {systemStatus.memory.used} / {systemStatus.memory.total}</div>
                                  <div className={`inline-flex items-center gap-1 ${systemStatus.database.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                                    <div className={`w-2 h-2 rounded-full ${systemStatus.database.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    Veritabanı: {systemStatus.database.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-2 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-2 bg-gray-200 rounded"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <Palette className="h-6 w-6 text-orange-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">Görünüm Ayarları</h2>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tema Rengi
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="color"
                              value={settings.themeColor}
                              onChange={(e) => handleInputChange('themeColor', e.target.value)}
                              className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                            />
                            <span className="text-sm text-gray-600">{settings.themeColor}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                          <div className="flex items-center mb-3">
                            <Info className="h-5 w-5 text-orange-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Tema Önizleme</h3>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-lg p-3 shadow-sm border">
                              <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
                              <div className="w-3/4 h-2 bg-gray-100 rounded"></div>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border">
                              <div className="w-full h-2 rounded mb-2" style={{ backgroundColor: settings.themeColor }}></div>
                              <div className="w-3/4 h-2 bg-gray-100 rounded"></div>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border">
                              <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
                              <div className="w-3/4 h-2 rounded" style={{ backgroundColor: settings.themeColor }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Info className="h-4 w-4 mr-2" />
                      Değişiklikler otomatik olarak kaydedilecek
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl hover:from-orange-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {loading ? (
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5 mr-2" />
                      )}
                      {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
