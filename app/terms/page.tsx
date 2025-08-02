'use client'

import { Shield, CheckCircle, AlertTriangle, Scale, FileText, Users, CreditCard, Truck, RefreshCw } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-60 right-20 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-xl opacity-15 animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-full blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li><a href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</a></li>
                <li>/</li>
                <li className="text-gray-900 font-medium">Kullanım Koşulları</li>
              </ol>
            </nav>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Scale className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                Kullanım Koşulları
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                ModaBase hizmetlerimizi kullanırken uymanız gereken kurallar ve koşullar
              </p>
              <div className="flex items-center justify-center space-x-4 mt-4">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Son güncelleme: 15 Ocak 2025</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Yasal olarak bağlayıcı</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-12">
              {/* Quick Navigation */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <span>Hızlı Erişim</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: Users, title: "Genel Koşullar", href: "#general" },
                    { icon: CreditCard, title: "Ödeme Koşulları", href: "#payment" },
                    { icon: Truck, title: "Teslimat", href: "#shipping" },
                    { icon: RefreshCw, title: "İade & Değişim", href: "#returns" },
                    { icon: Shield, title: "Gizlilik", href: "#privacy" },
                    { icon: AlertTriangle, title: "Sorumluluk", href: "#liability" }
                  ].map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group"
                    >
                      <item.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{item.title}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Terms Content */}
              <div className="prose prose-lg max-w-none">
                {/* 1. Genel Koşullar */}
                <section id="general" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Users className="w-8 h-8 text-blue-500" />
                    <span>1. Genel Koşullar</span>
                  </h2>
                  <div className="bg-blue-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Kabul ve Onay</h3>
                    <p className="text-gray-700 leading-relaxed">
                      ModaBase web sitesini kullanarak, aşağıdaki kullanım koşullarını tamamen okuduğunuzu, anladığınuzu ve kabul ettiğinizi beyan edersiniz. Bu koşullar yasal olarak bağlayıcıdır.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700"><strong>Şirket Bilgileri:</strong> ModaBase, Türkiye'de faaliyet gösteren bir e-ticaret platformudur.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700"><strong>Hizmet Kapsamı:</strong> Moda, giyim, aksesuar ve lifestyle ürünlerinin online satışı.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700"><strong>Yaş Sınırı:</strong> 18 yaş altı kullanıcılar ebeveyn onayı ile hizmetlerimizi kullanabilir.</p>
                    </div>
                  </div>
                </section>

                {/* 2. Kullanıcı Hesabı */}
                <section id="account" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Kullanıcı Hesabı ve Sorumluluklar</h2>
                  <div className="bg-yellow-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Hesap Güvenliği</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Hesabınızın güvenliğinden tamamen siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın ve güvenli bir şifre kullanın.
                    </p>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Doğru ve güncel bilgiler vermelisiniz</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Hesabınızı başkalarıyla paylaşmamalısınız</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Şüpheli aktiviteleri derhal bildirmelisiniz</span>
                    </li>
                  </ul>
                </section>

                {/* 3. Ödeme Koşulları */}
                <section id="payment" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <CreditCard className="w-8 h-8 text-green-500" />
                    <span>3. Ödeme Koşulları</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50/50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Kabul Edilen Ödeme Yöntemleri</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Kredi/Banka Kartı</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Havale/EFT</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Kapıda Ödeme</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Taksitli Ödeme</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-50/50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Ödeme Güvenliği</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>SSL Sertifikası</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>PCI DSS Uyumluluğu</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>3D Secure</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>Güvenli Ödeme Altyapısı</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 4. Teslimat ve Kargo */}
                <section id="shipping" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Truck className="w-8 h-8 text-purple-500" />
                    <span>4. Teslimat ve Kargo</span>
                  </h2>
                  <div className="bg-purple-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Teslimat Süreleri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600 mb-2">1-2 Gün</div>
                        <div className="text-sm text-gray-600">Hızlı Teslimat</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600 mb-2">2-4 Gün</div>
                        <div className="text-sm text-gray-600">Standart Teslimat</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600 mb-2">5-7 Gün</div>
                        <div className="text-sm text-gray-600">Özel Ürünler</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Teslimat süreleri, stok durumu ve kargo firmasının performansına göre değişiklik gösterebilir. Özel günlerde (bayram, indirim dönemleri) teslimat süreleri uzayabilir.
                  </p>
                </section>

                {/* 5. İade ve Değişim */}
                <section id="returns" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <RefreshCw className="w-8 h-8 text-orange-500" />
                    <span>5. İade ve Değişim Koşulları</span>
                  </h2>
                  <div className="bg-orange-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">14 Gün İade Hakkı</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Tüketiciler, ürünü teslim aldıkları tarihten itibaren 14 gün içinde herhangi bir sebep göstermeden iade edebilirler.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">İade Edilebilir Ürünler</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Giyim ve aksesuar</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Ayakkabı ve çanta</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Kozmetik (açılmamış)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">İade Edilemez Ürünler</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span>İç giyim ve mayo</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span>Kişisel bakım ürünleri</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span>Özel yapım ürünler</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 6. Fikri Mülkiyet */}
                <section id="intellectual" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Fikri Mülkiyet Hakları</h2>
                  <div className="bg-red-50/50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Telif Hakları</h3>
                    <p className="text-gray-700 leading-relaxed">
                      ModaBase web sitesindeki tüm içerik, tasarım, logo, metin, görsel ve yazılım telif hakları ile korunmaktadır. İzinsiz kullanım yasaktır.
                    </p>
                  </div>
                </section>

                {/* 7. Sorumluluk Reddi */}
                <section id="liability" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                    <span>7. Sorumluluk Reddi</span>
                  </h2>
                  <div className="bg-red-50/50 rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed">
                      ModaBase, hizmet kesintileri, veri kaybı, güvenlik ihlalleri veya üçüncü taraf hizmetlerden kaynaklanan zararlardan sorumlu tutulamaz. Kullanıcılar hizmeti kendi risk ve sorumluluklarında kullanır.
                    </p>
                  </div>
                </section>

                {/* 8. Değişiklikler */}
                <section id="changes" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Koşullarda Değişiklik</h2>
                  <p className="text-gray-700 leading-relaxed">
                    ModaBase, bu kullanım koşullarını önceden haber vermeksizin değiştirme hakkını saklı tutar. Değişiklikler web sitesinde yayınlandığı andan itibaren yürürlüğe girer.
                  </p>
                </section>

                {/* 9. İletişim */}
                <section id="contact" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">9. İletişim Bilgileri</h2>
                  <div className="bg-blue-50/50 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Müşteri Hizmetleri</h3>
                        <p className="text-gray-700">E-posta: info@modabase.com.tr</p>
                                                  <p className="text-gray-700">Telefon: 0536 297 12 55</p>
                        <p className="text-gray-700">Çalışma Saatleri: 09:00 - 18:00</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Adres</h3>
                        <p className="text-gray-700">Modahan İbrahim Kaya - ModaBase E-Ticaret</p>
                        <p className="text-gray-700">Malkoçoğlu Mah. 305/1 Sok. No: 17/A</p>
                        <p className="text-gray-700">Sultangazi/İstanbul/Türkiye</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Koşulları Kabul Ediyorum
              </button>
              <a 
                href="/privacy" 
                className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-105 text-center"
              >
                Gizlilik Politikasını İncele
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
