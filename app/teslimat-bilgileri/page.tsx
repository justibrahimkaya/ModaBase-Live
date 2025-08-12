'use client'

import { Truck, Clock, MapPin, Package, Shield, CreditCard, Phone, AlertTriangle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ShippingInfoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><a href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</a></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">Teslimat Bilgileri</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Teslimat Bilgileri
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hızlı, güvenli ve ücretsiz kargo seçenekleri ile kapınıza kadar teslimat
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Truck className="w-4 h-4 text-purple-500" />
                <span>Ücretsiz kargo</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Güvenli teslimat</span>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-green-50/50 rounded-xl p-4 text-center border border-green-200">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">1-2 Gün</div>
              <div className="text-xs text-gray-600">Hızlı Teslimat</div>
            </div>
            <div className="bg-blue-50/50 rounded-xl p-4 text-center border border-blue-200">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">Ücretsiz</div>
              <div className="text-xs text-gray-600">Kargo Bedava</div>
            </div>
            <div className="bg-purple-50/50 rounded-xl p-4 text-center border border-purple-200">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">Güvenli</div>
              <div className="text-xs text-gray-600">Sigortalı Gönderi</div>
            </div>
            <div className="bg-orange-50/50 rounded-xl p-4 text-center border border-orange-200">
              <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-orange-600">Takip</div>
              <div className="text-xs text-gray-600">Anlık İzleme</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-12">
            
            {/* Teslimat Süreleri */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Clock className="w-8 h-8 text-blue-500" />
                <span>1. TESLİMAT SÜRELERİ</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50/50 rounded-xl p-6 text-center border border-green-200">
                  <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-600 mb-2">1-2 İş Günü</h3>
                  <h4 className="font-semibold text-gray-900 mb-3">Hızlı Teslimat</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Stokta bulunan ürünler</li>
                    <li>• İstanbul ve çevre iller</li>
                    <li>• Saat 14:00'a kadar verilen siparişler</li>
                    <li>• Aynı gün kargoya verilir</li>
                  </ul>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-6 text-center border border-blue-200">
                  <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-blue-600 mb-2">2-4 İş Günü</h3>
                  <h4 className="font-semibold text-gray-900 mb-3">Standart Teslimat</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Türkiye geneli</li>
                    <li>• Tüm stok ürünler</li>
                    <li>• Normal kargo süreci</li>
                    <li>• En yaygın tercih</li>
                  </ul>
                </div>
                <div className="bg-purple-50/50 rounded-xl p-6 text-center border border-purple-200">
                  <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-purple-600 mb-2">5-7 İş Günü</h3>
                  <h4 className="font-semibold text-gray-900 mb-3">Özel Durumlar</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sipariş üzerine üretim</li>
                    <li>• Tedarikçiden gelecek ürünler</li>
                    <li>• Özel beden/renk</li>
                    <li>• Bayram dönemleri</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <strong>Önemli:</strong> Teslimat süreleri, kargo firmasının performansı, hava koşulları, tatil günleri ve sipariş yoğunluğuna göre değişiklik gösterebilir. Özel günlerde (bayram, indirim dönemleri) teslimat süreleri uzayabilir.
                  </p>
                </div>
              </div>
            </section>

            {/* Kargo Firmaları */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Truck className="w-8 h-8 text-purple-500" />
                <span>2. KARGO FİRMALARI</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-50/50 rounded-xl p-4 text-center border border-red-200">
                  <div className="w-12 h-12 bg-red-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">ARAS</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Aras Kargo</h3>
                  <p className="text-xs text-gray-600">Türkiye geneli</p>
                </div>
                <div className="bg-orange-50/50 rounded-xl p-4 text-center border border-orange-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">PTT</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">PTT Kargo</h3>
                  <p className="text-xs text-gray-600">Güvenli teslimat</p>
                </div>
                <div className="bg-green-50/50 rounded-xl p-4 text-center border border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xs">HEPSİ</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">HepsiJet</h3>
                  <p className="text-xs text-gray-600">Hızlı teslimat</p>
                </div>
                <div className="bg-brown-50/50 rounded-xl p-4 text-center border border-yellow-200">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-yellow-600 font-bold text-xs">UPS</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">UPS Kargo</h3>
                  <p className="text-xs text-gray-600">Uluslararası</p>
                </div>
              </div>
              <div className="mt-6 bg-blue-50/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Kargo Seçimi</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Kargo firması seçimi, teslimat adresinize göre otomatik olarak en uygun seçenek belirlenir. Size en hızlı ve güvenli teslimatı sağlayacak kargo firması seçilir.
                </p>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Adresinize göre en uygun kargo seçilir</li>
                  <li>• Kargo takip numarası SMS ile gönderilir</li>
                  <li>• Online takip sistemi mevcuttur</li>
                  <li>• Teslimatta kimlik kontrolü yapılır</li>
                </ul>
              </div>
            </section>

            {/* Kargo Ücretleri */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <CreditCard className="w-8 h-8 text-green-500" />
                <span>3. KARGO ÜCRETLERİ</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Package className="w-6 h-6 text-green-500" />
                    <span>Ücretsiz Kargo</span>
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>300 TL ve üzeri tüm siparişler</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Kampanya dönemlerinde daha düşük limitler</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Premium üyelere özel avantajlar</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Türkiye geneli geçerli</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ücretli Kargo</h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">Standart Kargo</span>
                        <span className="text-blue-600 font-bold">29,90 TL</span>
                      </div>
                      <p className="text-sm text-gray-600">300 TL altı siparişler için</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">Hızlı Kargo</span>
                        <span className="text-blue-600 font-bold">39,90 TL</span>
                      </div>
                      <p className="text-sm text-gray-600">Aynı gün/ertesi gün teslimat</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Teslimat Adresi */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <MapPin className="w-8 h-8 text-orange-500" />
                <span>4. TESLİMAT ADRESİ</span>
              </h2>
              <div className="space-y-6">
                <div className="bg-orange-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Adres Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">✅ Zorunlu Bilgiler</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Ad Soyad (tam ve doğru)</li>
                        <li>• Telefon numarası (ulaşılabilir)</li>
                        <li>• İl, İlçe, Mahalle</li>
                        <li>• Açık adres (detaylı tarif)</li>
                        <li>• Posta kodu</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">💡 Öneriler</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Kat, daire, blok numarası belirtin</li>
                        <li>• Alternatif telefon ekleyin</li>
                        <li>• Yakın nokta tarifi yapın</li>
                        <li>• İş/ev ayrımını belirtin</li>
                        <li>• Teslimat notları ekleyin</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Teslimat Koşulları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Kimlik Kontrolü</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Teslimatta kimlik gösterilmelidir</li>
                        <li>• Sipariş sahibi veya aynı adresteki kişi</li>
                        <li>• 18 yaş altı teslimat alamaz</li>
                        <li>• Vekaleten teslim mümkündür</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Özel Durumlar</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Kapıcı/komşu teslim mümkün</li>
                        <li>• İş yeri teslimi yapılır</li>
                        <li>• Kargo şubesinden alınabilir</li>
                        <li>• Randevulu teslimat yapılabilir</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Teslimat Takibi */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">5. TESLİMAT TAKİBİ</h2>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start space-x-4 p-6 bg-purple-50/50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sipariş Onayı</h3>
                    <p className="text-gray-700 text-sm">
                      Siparişiniz onaylandıktan sonra hazırlık sürecine alınır. SMS ile bilgilendirilirsiniz.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4 p-6 bg-blue-50/50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Kargoya Verildi</h3>
                    <p className="text-gray-700 text-sm">
                      Paketiniz kargo firmasına teslim edildi. Takip numarası SMS ile gönderilir.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4 p-6 bg-green-50/50 rounded-xl">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Dağıtımda</h3>
                    <p className="text-gray-700 text-sm">
                      Paketiniz dağıtım merkezinden çıktı, kurye teslimat için yola çıktı.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-4 p-6 bg-orange-50/50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Teslim Edildi</h3>
                    <p className="text-gray-700 text-sm">
                      Paketiniz başarıyla teslim edildi. Teslim alan kişi bilgisi kaydedilir.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Teslim Alamama */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <span>6. TESLİM ALAMAMA DURUMU</span>
              </h2>
              <div className="bg-red-50/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Paket Teslim Alınamazsa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Kargo Firması Süreci</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• 3 kez teslimat denemesi yapılır</li>
                      <li>• Her denemede SMS bildirim gönderilir</li>
                      <li>• Son denemede randevu teklif edilir</li>
                      <li>• Teslim alınamazsa kargo şubesinde bekletilir</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Çözüm Yolları</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Kargo şubesinden teslim alabilirsiniz</li>
                      <li>• Yeni teslimat randevusu alabilirsiniz</li>
                      <li>• Adres değişikliği yapabilirsiniz</li>
                      <li>• Müşteri hizmetlerinden destek alabilirsiniz</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-gray-700">
                    <strong>Dikkat:</strong> Paket 15 gün süreyle kargo şubesinde bekletilir. Bu süre sonunda gönderen adrese iade edilir ve kargo ücreti tahsil edilir.
                  </p>
                </div>
              </div>
            </section>

            {/* İletişim */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Phone className="w-8 h-8 text-blue-500" />
                <span>7. KARGO İLETİŞİM</span>
              </h2>
              <div className="bg-blue-50/50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Phone className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Müşteri Hizmetleri</h3>
                    <p className="text-gray-700">0536 297 12 55</p>
                    <p className="text-sm text-gray-600">Kargo sorunları için</p>
                  </div>
                  <div className="text-center">
                    <Package className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
                    <p className="text-gray-700">0536 297 12 55</p>
                    <p className="text-sm text-gray-600">Hızlı destek</p>
                  </div>
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Online Takip</h3>
                    <p className="text-gray-700">Takip Kodu ile</p>
                    <p className="text-sm text-gray-600">24/7 erişim</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/hesabim/siparislerim" 
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 text-center"
            >
              Siparişlerimi Takip Et
            </a>
            <a 
              href="/iptal-iade-politikasi" 
              className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-105 text-center"
            >
              İade Politikası
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
} 