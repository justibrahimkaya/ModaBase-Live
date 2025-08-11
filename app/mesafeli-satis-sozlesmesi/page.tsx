'use client'

import { FileText, Scale, Shield, Clock, CreditCard, Truck, RefreshCw, Phone } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DistanceSalesContractPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><a href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</a></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">Mesafeli Satış Sözleşmesi</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Mesafeli Satış Sözleşmesi
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca düzenlenmiştir
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Scale className="w-4 h-4 text-green-500" />
                <span>Yasal olarak bağlayıcı</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Tüketici hakları korunur</span>
              </div>
            </div>
          </div>

          {/* Contract Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-12">
            
            {/* Taraflar */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <FileText className="w-8 h-8 text-blue-500" />
                <span>MADDE 1 - TARAFLAR</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">SATICI</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Ünvan:</strong> Modahan İbrahim Kaya</p>
                    <p><strong>Ticaret Unvanı:</strong> ModaBase E-Ticaret</p>
                    <p><strong>Adres:</strong> Malkoçoğlu Mah. 305/1 Sok. No: 17/A Sultangazi/İstanbul</p>
                    <p><strong>Telefon:</strong> 0536 297 12 55</p>
                    <p><strong>E-posta:</strong> info@modabase.com.tr</p>
                    <p><strong>Web Sitesi:</strong> modabase.com.tr</p>
                  </div>
                </div>
                
                <div className="bg-green-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">ALICI (TÜKETİCİ)</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>Sipariş veren kişinin;</p>
                    <p><strong>Adı Soyadı:</strong> Sipariş sırasında belirtilen</p>
                    <p><strong>Adresi:</strong> Sipariş sırasında belirtilen teslimat adresi</p>
                    <p><strong>Telefon:</strong> Sipariş sırasında belirtilen</p>
                    <p><strong>E-posta:</strong> Sipariş sırasında belirtilen</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sözleşme Konusu */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">MADDE 2 - SÖZLEŞME KONUSU</h2>
              <div className="bg-yellow-50/50 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed">
                  İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait modabase.com.tr internet sitesi üzerinden elektronik ortamda vermiş olduğu siparişe konu mal/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanması amaçlanmaktadır.
                </p>
              </div>
            </section>

            {/* Mal/Hizmet Bilgileri */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <CreditCard className="w-8 h-8 text-green-500" />
                <span>MADDE 3 - MAL/HİZMET BİLGİLERİ</span>
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ürün Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Satışa konu mal/hizmetin temel özellikleri, rengi, adedi, marka, modeli, ürün sayfasında yer almaktadır.</li>
                    <li>• Ürün fiyatları tüm vergiler dâhil olarak belirtilmiştir.</li>
                    <li>• Ürün fiyatları, kampanyalar ve değişiklikler nedeniyle değişebilir.</li>
                    <li>• Stok durumuna göre tedarik süresi değişkenlik gösterebilir.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Ödeme Koşulları */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">MADDE 4 - ÖDEME KOŞULLARI</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ödeme Yöntemleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Kredi Kartı (Tek Çekim/Taksit)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Banka Kartı</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Havale/EFT</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Kapıda Ödeme (Nakit/Kart)</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ödeme Güvenliği</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• SSL 256-bit şifreleme</li>
                    <li>• 3D Secure güvenlik sistemi</li>
                    <li>• PCI-DSS standartlarına uygun</li>
                    <li>• Kart bilgileri saklanmaz</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Teslimat */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Truck className="w-8 h-8 text-purple-500" />
                <span>MADDE 5 - TESLİMAT KOŞULLARI</span>
              </h2>
              <div className="bg-purple-50/50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                    <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-purple-600">1-2 İş Günü</div>
                    <div className="text-sm text-gray-600">Hızlı Teslimat</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                    <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-purple-600">2-4 İş Günü</div>
                    <div className="text-sm text-gray-600">Standart Teslimat</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                    <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-purple-600">5-7 İş Günü</div>
                    <div className="text-sm text-gray-600">Özel Durum</div>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Ürünler, sipariş onayından sonra belirtilen süre içinde teslim edilir.</li>
                  <li>• Teslimat süresi, stok durumu ve kargo yoğunluğuna göre değişebilir.</li>
                  <li>• Tatil günleri ve resmi bayramlar teslimat süresini etkileyebilir.</li>
                  <li>• Kargo takip numarası SMS/e-posta ile bildirilir.</li>
                </ul>
              </div>
            </section>

            {/* Cayma Hakkı */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <RefreshCw className="w-8 h-8 text-orange-500" />
                <span>MADDE 6 - CAYMA HAKKI</span>
              </h2>
              <div className="bg-orange-50/50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">14 Gün Cayma Hakkı</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ALICI, malın kendisine veya gösterdiği üçüncü kişiye teslim edildiği tarihten itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden bu sözleşmeden cayma hakkına sahiptir.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cayma Koşulları:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Ürün kutusunda, ambalajında hasar olmamalı</li>
                      <li>• Ürünle birlikte gönderilen hediye, aksesuar iade edilmeli</li>
                      <li>• Hijyen ürünleri açılmamış olmalı</li>
                      <li>• Etiketler koparılmamalı</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cayma Hakkı Olmayan Ürünler:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• İç giyim, mayo, bikini</li>
                      <li>• Mücevher ve saat (açılmış ise)</li>
                      <li>• Kişisel bakım ve kozmetik ürünleri</li>
                      <li>• Kişiye özel üretim ürünler</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Sorumluluklar */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">MADDE 7 - TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">SATICI Yükümlülükleri</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Ürünü sözleşmede belirtilen özelliklerde teslim etmek</li>
                    <li>• Yasal garanti koşullarını yerine getirmek</li>
                    <li>• Cayma hakkı taleplerini değerlendirmek</li>
                    <li>• Kişisel verileri korumak</li>
                    <li>• Fatura ve belgeler düzenlemek</li>
                  </ul>
                </div>
                <div className="bg-green-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">ALICI Yükümlülükleri</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Doğru ve eksiksiz bilgi vermek</li>
                    <li>• Ödemeyi zamanında yapmak</li>
                    <li>• Ürünü teslim almak</li>
                    <li>• Sözleşme koşullarına uymak</li>
                    <li>• İade koşullarını yerine getirmek</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* İletişim */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Phone className="w-8 h-8 text-green-500" />
                <span>MADDE 8 - İLETİŞİM VE UYUŞMAZLIK</span>
              </h2>
              <div className="bg-green-50/50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Müşteri Hizmetleri</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>E-posta:</strong> info@modabase.com.tr</li>
                      <li><strong>Telefon:</strong> 0536 297 12 55</li>
                      <li><strong>Çalışma Saatleri:</strong> 09:00 - 18:00 (Hafta içi)</li>
                      <li><strong>Adres:</strong> Malkoçoğlu Mah. 305/1 Sok. No: 17/A Sultangazi/İstanbul</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Uyuşmazlık Çözümü</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Bu sözleşmeden doğan uyuşmazlıklarda, Türk Mahkemeleri yetkili olup, Türk Hukuku uygulanacaktır. Tüketici şikayetleri için İl/İlçe Tüketici Hakem Heyetleri'ne başvurulabilir.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Yürürlük */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">MADDE 9 - YÜRÜRLÜK</h2>
              <div className="bg-blue-50/50 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed">
                  İşbu sözleşme, ALICI tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer. SATICI, sipariş onayı ile sözleşmeyi kabul etmiş sayılır. Bu sözleşme elektronik ortamda saklanır ve istendiğinde ALICI'ya sunulur.
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  <strong>Son güncelleme:</strong> 15 Ocak 2025
                </p>
              </div>
            </section>

          </div>

          {/* Accept Button */}
          <div className="mt-8 text-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Mesafeli Satış Sözleşmesini Okudum ve Kabul Ediyorum
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
} 