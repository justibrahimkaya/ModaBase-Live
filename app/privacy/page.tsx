'use client'

import { Shield, Eye, Cookie, Database, Lock, Users, AlertTriangle, FileText, CheckCircle, Info } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-60 right-20 w-32 h-32 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full blur-xl opacity-15 animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li><a href="/" className="hover:text-emerald-600 transition-colors">Ana Sayfa</a></li>
                <li>/</li>
                <li className="text-gray-900 font-medium">Gizlilik Politikası</li>
              </ol>
            </nav>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                Gizlilik Politikası
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında detaylı bilgi
              </p>
              <div className="flex items-center justify-center space-x-4 mt-4">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>KVKK Uyumlu</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Son güncelleme: 15 Ocak 2025</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-12">
              {/* Quick Navigation */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-emerald-500" />
                  <span>Hızlı Erişim</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: Database, title: "Veri Toplama", href: "#collection" },
                    { icon: Eye, title: "Veri Kullanımı", href: "#usage" },
                    { icon: Lock, title: "Veri Güvenliği", href: "#security" },
                    { icon: Cookie, title: "Çerez Politikası", href: "#cookies" },
                    { icon: Users, title: "Kullanıcı Hakları", href: "#rights" },
                    { icon: AlertTriangle, title: "Üçüncü Taraflar", href: "#third-party" }
                  ].map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 group"
                    >
                      <item.icon className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">{item.title}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Privacy Content */}
              <div className="prose prose-lg max-w-none">
                {/* KVKK Uyumluluk Bildirimi */}
                <section className="mb-12">
                  <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-200">
                    <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center space-x-2">
                      <Shield className="w-6 h-6 text-emerald-600" />
                      <span>KVKK Uyumluluk Bildirimi</span>
                    </h2>
                    <p className="text-emerald-800 leading-relaxed">
                      ModaBase olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında kişisel verilerinizi korumayı ve bu konuda şeffaf olmayı taahhüt ederiz. Bu gizlilik politikası, kişisel verilerinizin nasıl işlendiğini açıklar.
                    </p>
                  </div>
                </section>

                {/* 1. Kişisel Veri Toplama */}
                <section id="collection" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Database className="w-8 h-8 text-blue-500" />
                    <span>1. Kişisel Veri Toplama</span>
                  </h2>
                  <div className="bg-blue-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Hangi Verileri Topluyoruz?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      ModaBase hizmetlerini kullanırken aşağıdaki kişisel verilerinizi toplayabiliriz:
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Kimlik Bilgileri</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Ad ve Soyad</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>E-posta Adresi</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Telefon Numarası</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Doğum Tarihi</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Teknik Bilgiler</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span>IP Adresi</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span>Tarayıcı Bilgisi</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span>Cihaz Bilgisi</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span>Çerez Verileri</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 2. Veri Kullanım Amaçları */}
                <section id="usage" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Eye className="w-8 h-8 text-purple-500" />
                    <span>2. Veri Kullanım Amaçları</span>
                  </h2>
                  <div className="bg-purple-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Verilerinizi Neden Kullanırız?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Topladığımız kişisel verilerinizi sadece yasal çerçevede ve belirli amaçlarla kullanırız.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Hizmet Sunumu</h4>
                          <p className="text-gray-600 text-sm">Sipariş işleme, teslimat, müşteri desteği</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Güvenlik</h4>
                          <p className="text-gray-600 text-sm">Hesap güvenliği, dolandırıcılık önleme</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">İletişim</h4>
                          <p className="text-gray-600 text-sm">Sipariş durumu, kampanya bilgileri</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold">4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Kişiselleştirme</h4>
                          <p className="text-gray-600 text-sm">Öneriler, deneyim iyileştirme</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold">5</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Analitik</h4>
                          <p className="text-gray-600 text-sm">Performans analizi, raporlama</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold">6</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Yasal Yükümlülük</h4>
                          <p className="text-gray-600 text-sm">Mevzuat gereği saklama</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Veri Güvenliği */}
                <section id="security" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Lock className="w-8 h-8 text-red-500" />
                    <span>3. Veri Güvenliği</span>
                  </h2>
                  <div className="bg-red-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Güvenlik Önlemleri</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Kişisel verilerinizi korumak için teknik ve idari güvenlik önlemleri alırız.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                        <Lock className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Şifreleme</h3>
                      <p className="text-gray-600 text-sm">SSL sertifikası ile veri iletimi şifrelenir</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                        <Shield className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Güvenlik Duvarı</h3>
                      <p className="text-gray-600 text-sm">Yetkisiz erişimlere karşı koruma</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                        <Database className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Yedekleme</h3>
                      <p className="text-gray-600 text-sm">Düzenli veri yedekleme sistemi</p>
                    </div>
                  </div>
                </section>

                {/* 4. Çerez Politikası */}
                <section id="cookies" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Cookie className="w-8 h-8 text-orange-500" />
                    <span>4. Çerez Politikası</span>
                  </h2>
                  <div className="bg-orange-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Çerezler Nedir?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Çerezler, web sitesini ziyaret ettiğinizde cihazınızda saklanan küçük metin dosyalarıdır. Daha iyi bir kullanıcı deneyimi sunmak için çerezleri kullanırız.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Çerez Türleri</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <span className="font-medium">Zorunlu Çerezler:</span>
                            <span className="text-sm block text-gray-600">Site işlevselliği için gerekli</span>
                          </div>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <span className="font-medium">Analitik Çerezler:</span>
                            <span className="text-sm block text-gray-600">Site kullanım istatistikleri</span>
                          </div>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <span className="font-medium">Pazarlama Çerezleri:</span>
                            <span className="text-sm block text-gray-600">Kişiselleştirilmiş reklamlar</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Çerez Yönetimi</h3>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border border-orange-200">
                          <p className="text-sm text-gray-700 mb-2">Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Çerezleri kabul/reddet</li>
                            <li>• Mevcut çerezleri sil</li>
                            <li>• Çerez tercihlerini ayarla</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5. Kullanıcı Hakları */}
                <section id="rights" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Users className="w-8 h-8 text-green-500" />
                    <span>5. Kullanıcı Hakları (KVKK)</span>
                  </h2>
                  <div className="bg-green-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Haklarınız</h3>
                    <p className="text-gray-700 leading-relaxed">
                      KVKK kapsamında kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Bilgi Talep Etme</h4>
                          <p className="text-gray-600 text-sm">Hangi verilerinizin işlendiğini öğrenme</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Düzeltme</h4>
                          <p className="text-gray-600 text-sm">Yanlış verilerin düzeltilmesini isteme</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Silme</h4>
                          <p className="text-gray-600 text-sm">Verilerinizin silinmesini talep etme</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Aktarım</h4>
                          <p className="text-gray-600 text-sm">Verilerinizin başka yere aktarılmasını isteme</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">İtiraz</h4>
                          <p className="text-gray-600 text-sm">Veri işlenmesine itiraz etme</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Şikayet</h4>
                          <p className="text-gray-600 text-sm">Veri Koruma Kurulu'na şikayet etme</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 6. Üçüncü Taraflar */}
                <section id="third-party" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    <span>6. Üçüncü Taraf Paylaşımı</span>
                  </h2>
                  <div className="bg-yellow-50/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Veri Paylaşımı</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Kişisel verilerinizi yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşırız:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Kargo firmaları (teslimat için)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Ödeme işlem kuruluşları</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Yasal yükümlülük durumları</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Açık rızanız ile</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 7. İletişim */}
                <section id="contact" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">7. İletişim Bilgileri</h2>
                  <div className="bg-blue-50/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Veri Sorumlusu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Modahan İbrahim Kaya - ModaBase E-Ticaret</h4>
                        <p className="text-gray-700 text-sm">Malkoçoğlu Mah. 305/1 Sok. No: 17/A</p>
                        <p className="text-gray-700 text-sm">Sultangazi/İstanbul/Türkiye</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">İletişim</h4>
                        <p className="text-gray-700 text-sm">E-posta: info@modabase.com.tr</p>
                                                  <p className="text-gray-700 text-sm">Telefon: 0536 297 12 55</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
                Gizlilik Politikasını Kabul Ediyorum
              </button>
              <a 
                href="/terms" 
                className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-105 text-center"
              >
                Kullanım Koşullarını İncele
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
