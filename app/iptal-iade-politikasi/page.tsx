'use client'

import { RefreshCw, Package, Clock, CheckCircle, AlertTriangle, CreditCard, Mail, Phone } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ReturnPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><a href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</a></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">İptal-İade Politikası</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <RefreshCw className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              İptal-İade Politikası
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              14 gün içinde koşulsuz iade hakkınız - Tüketici haklarınız korunur
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>14 gün garanti</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Package className="w-4 h-4 text-blue-500" />
                <span>Ücretsiz iade</span>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-green-50/50 rounded-xl p-6 text-center border border-green-200">
              <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">14 Gün İade</h3>
              <p className="text-gray-600 text-sm">Teslim tarihinden itibaren 14 gün içinde iade edebilirsiniz</p>
            </div>
            <div className="bg-blue-50/50 rounded-xl p-6 text-center border border-blue-200">
              <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ücretsiz Kargo</h3>
              <p className="text-gray-600 text-sm">İade kargo ücreti tarafımızdan karşılanır</p>
            </div>
            <div className="bg-purple-50/50 rounded-xl p-6 text-center border border-purple-200">
              <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hızlı Ödeme</h3>
              <p className="text-gray-600 text-sm">İade onayından sonra 5-7 iş günü içinde ödeme iadesi</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-12">
            
            {/* İade Hakkı */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <RefreshCw className="w-8 h-8 text-green-500" />
                <span>1. İADE HAKKI</span>
              </h2>
              <div className="bg-green-50/50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Yasal İade Hakkı</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, tüketiciler malı teslim aldıkları tarihten itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden sözleşmeden cayma hakkına sahiptir.
                </p>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600">
                    <strong>Önemli:</strong> İade süresi, ürünün size teslim edildiği tarihten başlar. Hafta sonu ve resmi tatil günleri de süreye dahildir.
                  </p>
                </div>
              </div>
            </section>

            {/* İade Edilebilir Ürünler */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">2. İADE EDİLEBİLİR ÜRÜNLER</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span>İade Edilebilir</span>
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span>Giyim ürünleri (etiketli ve denenmemiş)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span>Ayakkabı ve çanta (kutusunda)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span>Aksesuar ve takı</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span>Kozmetik ürünleri (açılmamış)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span>Parfüm ve deodorant (açılmamış)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span>Ev tekstili ürünleri</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-red-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <span>İade Edilemez</span>
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>İç giyim, mayo, bikini</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>Çorap ve külot</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>Açılmış kozmetik ürünleri</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>Kişiye özel üretim ürünler</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>Mücevher (açılmış ambalaj)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>Temizlik ve hijyen ürünleri</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* İade Koşulları */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">3. İADE KOŞULLARI</h2>
              <div className="bg-blue-50/50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Ürün Durumu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">✅ Zorunlu Koşullar</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Ürün orijinal ambalajında olmalı</li>
                      <li>• Etiketler koparılmamış olmalı</li>
                      <li>• Ürün temiz ve hasarsız olmalı</li>
                      <li>• Hediye ve aksesuarlar eksiksiz olmalı</li>
                      <li>• Fatura ile birlikte gönderilmeli</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">❌ İade Kabul Edilmez</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Yıkanmış veya kullanılmış ürünler</li>
                      <li>• Etiketi koparılmış ürünler</li>
                      <li>• Hasarlı veya kirli ürünler</li>
                      <li>• Eksik parçalı ürünler</li>
                      <li>• Kokulu ürünler (parfüm, sigara vb.)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* İade Süreci */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Package className="w-8 h-8 text-blue-500" />
                <span>4. İADE SÜRECİ</span>
              </h2>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start space-x-4 p-6 bg-blue-50/50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">İade Talebinde Bulunun</h3>
                    <p className="text-gray-700 mb-3">14 gün içinde aşağıdaki yöntemlerle iade talebinde bulunun:</p>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• Web sitesinden "Hesabım &gt; Siparişlerim" bölümünden</li>
                      <li>• WhatsApp: 0536 297 12 55</li>
                      <li>• E-posta: info@modabase.com.tr</li>
                      <li>• Telefon: 0536 297 12 55</li>
                    </ul>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4 p-6 bg-green-50/50 rounded-xl">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürünü Paketleyin</h3>
                    <p className="text-gray-700 mb-3">Ürünü orijinal ambalajında, fatura ile birlikte paketleyin:</p>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• Orijinal kutu/poşet kullanın</li>
                      <li>• Faturayı mutlaka ekleyin</li>
                      <li>• Hediye ve aksesuarları unutmayın</li>
                      <li>• Güvenli bir şekilde paketleyin</li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4 p-6 bg-purple-50/50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Kargo ile Gönderin</h3>
                    <p className="text-gray-700 mb-3">Size ileteceğimiz kargo bilgileriyle ürünü gönderin:</p>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• İade kargo ücretsizdir</li>
                      <li>• Kargo kodu size SMS ile gelir</li>
                      <li>• Kargo takip numarasını saklayın</li>
                      <li>• Kapıda ödeme ile gönderebilirsiniz</li>
                    </ul>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-4 p-6 bg-orange-50/50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">İade Onayı ve Ödeme</h3>
                    <p className="text-gray-700 mb-3">Ürün ulaştıktan sonra inceleme süreci:</p>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• 1-2 iş günü içinde ürün incelenir</li>
                      <li>• İade onayı SMS/e-posta ile bildirilir</li>
                      <li>• Ödeme iadesi 5-7 iş günü içinde yapılır</li>
                      <li>• Aynı ödeme yöntemi ile iade edilir</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Değişim */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">5. ÜRÜN DEĞİŞİMİ</h2>
              <div className="bg-yellow-50/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Beden/Renk Değişimi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-700 mb-4">
                      Sadece aynı ürünün farklı beden veya rengini istiyorsanız değişim yapabilirsiniz:
                    </p>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• İstediğiniz beden/renk stokta olmalı</li>
                      <li>• Fiyat farkı varsa ek ödeme yapılır</li>
                      <li>• Fiyat düşükse fark iade edilir</li>
                      <li>• Değişim kargo ücreti ücretsizdir</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Hızlı Değişim</h4>
                    <p className="text-sm text-gray-600">
                      Aynı adrese yeni ürünü gönderir, eski ürünü kargo ile geri alırız. Böylece daha hızlı değişim yapabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ödeme İadesi */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <CreditCard className="w-8 h-8 text-green-500" />
                <span>6. ÖDEME İADESİ</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">İade Süreleri</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span><strong>Kredi Kartı:</strong> 5-7 iş günü</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span><strong>Havale/EFT:</strong> 3-5 iş günü</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span><strong>Kapıda Ödeme:</strong> 5-7 iş günü</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">İade Şekli</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Kredi kartından ödendi ise aynı karta iade</li>
                    <li>• Havale ile ödendi ise aynı hesaba iade</li>
                    <li>• Kapıda ödeme ise hesap numaranıza iade</li>
                    <li>• İade işlemi SMS/e-posta ile bildirilir</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* İletişim */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Phone className="w-8 h-8 text-blue-500" />
                <span>7. İLETİŞİM</span>
              </h2>
              <div className="bg-blue-50/50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Phone className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
                    <p className="text-gray-700">0536 297 12 55</p>
                    <p className="text-sm text-gray-600">09:00 - 18:00</p>
                  </div>
                  <div className="text-center">
                    <Mail className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">E-posta</h3>
                    <p className="text-gray-700">info@modabase.com.tr</p>
                    <p className="text-sm text-gray-600">24 saat</p>
                  </div>
                  <div className="text-center">
                    <Package className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
                    <p className="text-gray-700">0536 297 12 55</p>
                    <p className="text-sm text-gray-600">Hızlı yanıt</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/hesabim/siparislerim" 
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 text-center"
            >
              İade Talebi Oluştur
            </a>
            <a 
              href="/mesafeli-satis-sozlesmesi" 
              className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-105 text-center"
            >
              Mesafeli Satış Sözleşmesi
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
} 