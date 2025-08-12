'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, Shield, Bell, Lock, Mail, Phone, 
  Globe, Palette, Save, ArrowLeft, User, CheckCircle, 
  XCircle, Monitor, Moon, Sun,
  Smartphone, CreditCard, Key, Database, Download
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SettingsData {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    dataCollection: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'tr' | 'en';
    currency: 'TRY' | 'USD' | 'EUR';
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'private',
      showEmail: false,
      showPhone: false,
      dataCollection: true,
    },
    preferences: {
      theme: 'light',
      language: 'tr',
      currency: 'TRY',
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    // fetchProfile();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Simulated API call - you would implement actual settings save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Ayarlarınız başarıyla kaydedildi.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ayarlar kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key: keyof SettingsData['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updatePrivacySetting = (key: keyof SettingsData['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const updatePreferenceSetting = (key: keyof SettingsData['preferences'], value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        enabled ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-white/20'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } shadow-lg`}
      />
    </button>
  );

  return (
    <div>
      <Header />
      
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzZCNzI4MCIgZmlsbC1vcGFjaXR5PSIwLjA1Ij4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPgo8L2c+CjwvZz4KPC9zdmc+')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        {/* Floating Settings Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 4 + 's',
                animationDuration: (4 + Math.random() * 3) + 's'
              }}
            >
              <Settings className="w-3 h-3 text-gray-400/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(90deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>

      <main className="relative min-h-screen pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li><a href="/" className="hover:text-white transition-colors">Ana Sayfa</a></li>
              <li>/</li>
              <li><a href="/profile" className="hover:text-white transition-colors">Profil</a></li>
              <li>/</li>
              <li className="text-white">Hesap Ayarları</li>
            </ol>
          </nav>

          {/* Back Button */}
          <div className="flex items-center space-x-4 mb-8">
            <a
              href="/profile"
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Profile Dön</span>
            </a>
          </div>

          {/* Main Content */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 p-8 border-b border-white/20">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Hesap Ayarları</h1>
                  <p className="text-white/70">Bildirimler, gizlilik ve tercihlerinizi yönetin</p>
                </div>
              </div>
            </div>

            <div className="flex">
              {/* Sidebar Tabs */}
              <div className="w-64 bg-white/5 border-r border-white/20 p-6">
                <nav className="space-y-2">
                  {[
                    { id: 'notifications', label: 'Bildirimler', icon: Bell },
                    { id: 'privacy', label: 'Gizlilik', icon: Shield },
                    { id: 'preferences', label: 'Tercihler', icon: Palette },
                    { id: 'security', label: 'Güvenlik', icon: Lock },
                    { id: 'data', label: 'Veriler', icon: Database },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-8">
                {/* Alerts */}
                {error && (
                  <div className="mb-6 backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <p className="text-red-200 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-6 backdrop-blur-sm bg-green-500/20 border border-green-500/30 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-green-200 font-medium">{success}</p>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Bildirim Ayarları</h2>
                      <p className="text-white/70">Size nasıl bildirim göndermek istediğimizi seçin</p>
                    </div>

                    <div className="space-y-4">
                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <div>
                              <h3 className="font-semibold text-white">E-posta Bildirimleri</h3>
                              <p className="text-sm text-white/60">Sipariş durumu ve önemli güncellemeler</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            enabled={settings.notifications.email}
                            onToggle={() => updateNotificationSetting('email', !settings.notifications.email)}
                          />
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-green-400" />
                            <div>
                              <h3 className="font-semibold text-white">SMS Bildirimleri</h3>
                              <p className="text-sm text-white/60">Kritik bildirimler için SMS</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            enabled={settings.notifications.sms}
                            onToggle={() => updateNotificationSetting('sms', !settings.notifications.sms)}
                          />
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="w-5 h-5 text-purple-400" />
                            <div>
                              <h3 className="font-semibold text-white">Push Bildirimleri</h3>
                              <p className="text-sm text-white/60">Mobil uygulama bildirimleri</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            enabled={settings.notifications.push}
                            onToggle={() => updateNotificationSetting('push', !settings.notifications.push)}
                          />
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-orange-400" />
                            <div>
                              <h3 className="font-semibold text-white">Pazarlama E-postaları</h3>
                              <p className="text-sm text-white/60">Kampanyalar ve özel teklifler</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            enabled={settings.notifications.marketing}
                            onToggle={() => updateNotificationSetting('marketing', !settings.notifications.marketing)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Gizlilik Ayarları</h2>
                      <p className="text-white/70">Kişisel bilgilerinizin nasıl paylaşılacağını kontrol edin</p>
                    </div>

                    <div className="space-y-4">
                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="mb-4">
                          <h3 className="font-semibold text-white mb-2">Profil Görünürlüğü</h3>
                          <p className="text-sm text-white/60">Profilinizi kimler görebilir?</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'public', label: 'Herkese Açık', icon: Globe },
                            { value: 'friends', label: 'Arkadaşlar', icon: User },
                            { value: 'private', label: 'Sadece Ben', icon: Lock },
                          ].map((option) => {
                            const IconComponent = option.icon;
                            return (
                              <button
                                key={option.value}
                                onClick={() => updatePrivacySetting('profileVisibility', option.value)}
                                className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${
                                  settings.privacy.profileVisibility === option.value
                                    ? 'bg-white/20 border-white/40 text-white'
                                    : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                                }`}
                              >
                                <IconComponent className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">{option.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <div>
                              <h3 className="font-semibold text-white">E-posta Adresini Göster</h3>
                              <p className="text-sm text-white/60">Diğer kullanıcılar e-postanızı görebilir</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            enabled={settings.privacy.showEmail}
                            onToggle={() => updatePrivacySetting('showEmail', !settings.privacy.showEmail)}
                          />
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-green-400" />
                            <div>
                              <h3 className="font-semibold text-white">Telefon Numarasını Göster</h3>
                              <p className="text-sm text-white/60">Diğer kullanıcılar telefonunuzu görebilir</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            enabled={settings.privacy.showPhone}
                            onToggle={() => updatePrivacySetting('showPhone', !settings.privacy.showPhone)}
                          />
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Database className="w-5 h-5 text-purple-400" />
                            <div>
                              <h3 className="font-semibold text-white">Veri Toplama</h3>
                              <p className="text-sm text-white/60">Deneyimi iyileştirmek için veri toplama</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            enabled={settings.privacy.dataCollection}
                            onToggle={() => updatePrivacySetting('dataCollection', !settings.privacy.dataCollection)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Tercihler</h2>
                      <p className="text-white/70">Arayüz ve bölgesel ayarlarınızı özelleştirin</p>
                    </div>

                    <div className="space-y-4">
                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="mb-4">
                          <h3 className="font-semibold text-white mb-2">Tema Seçimi</h3>
                          <p className="text-sm text-white/60">Görünüm temanızı seçin</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'light', label: 'Açık', icon: Sun },
                            { value: 'dark', label: 'Koyu', icon: Moon },
                            { value: 'auto', label: 'Otomatik', icon: Monitor },
                          ].map((option) => {
                            const IconComponent = option.icon;
                            return (
                              <button
                                key={option.value}
                                onClick={() => updatePreferenceSetting('theme', option.value)}
                                className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${
                                  settings.preferences.theme === option.value
                                    ? 'bg-white/20 border-white/40 text-white'
                                    : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                                }`}
                              >
                                <IconComponent className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">{option.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="mb-4">
                          <h3 className="font-semibold text-white mb-2">Dil</h3>
                          <p className="text-sm text-white/60">Arayüz dili</p>
                        </div>
                        <select
                          value={settings.preferences.language}
                          onChange={(e) => updatePreferenceSetting('language', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                        >
                          <option value="tr" className="bg-gray-800">Türkçe</option>
                          <option value="en" className="bg-gray-800">English</option>
                        </select>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="mb-4">
                          <h3 className="font-semibold text-white mb-2">Para Birimi</h3>
                          <p className="text-sm text-white/60">Fiyatların gösterileceği para birimi</p>
                        </div>
                        <select
                          value={settings.preferences.currency}
                          onChange={(e) => updatePreferenceSetting('currency', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                        >
                          <option value="TRY" className="bg-gray-800">Türk Lirası (₺)</option>
                          <option value="USD" className="bg-gray-800">US Dollar ($)</option>
                          <option value="EUR" className="bg-gray-800">Euro (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Güvenlik</h2>
                      <p className="text-white/70">Hesabınızın güvenliğini yönetin</p>
                    </div>

                    <div className="space-y-4">
                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Key className="w-5 h-5 text-yellow-400" />
                            <div>
                              <h3 className="font-semibold text-white">Şifre Değiştir</h3>
                              <p className="text-sm text-white/60">Hesap şifrenizi güncelleyin</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                            Değiştir
                          </button>
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-green-400" />
                            <div>
                              <h3 className="font-semibold text-white">İki Faktörlü Doğrulama</h3>
                              <p className="text-sm text-white/60">Ekstra güvenlik katmanı</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors">
                            Etkinleştir
                          </button>
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Monitor className="w-5 h-5 text-blue-400" />
                            <div>
                              <h3 className="font-semibold text-white">Aktif Oturumlar</h3>
                              <p className="text-sm text-white/60">Diğer cihazlardaki oturumları görüntüle</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                            Görüntüle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Tab */}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Veri Yönetimi</h2>
                      <p className="text-white/70">Kişisel verilerinizi yönetin</p>
                    </div>

                    <div className="space-y-4">
                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Download className="w-5 h-5 text-blue-400" />
                            <div>
                              <h3 className="font-semibold text-white">Verilerimi İndir</h3>
                              <p className="text-sm text-white/60">Tüm kişisel verilerinizi indirin</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors">
                            İndir
                          </button>
                        </div>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <div>
                              <h3 className="font-semibold text-white">Hesabı Sil</h3>
                              <p className="text-sm text-white/60">Hesabınızı kalıcı olarak silin</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors">
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-8 border-t border-white/20">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-full font-medium hover:from-gray-600 hover:to-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none min-w-[180px]"
                  >
                    {saving ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Kaydediliyor...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Ayarları Kaydet</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
