'use client'

import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mobile-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile-optimized grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-primary-400 mb-3 sm:mb-4">ModaBase</h3>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
              Türkiye'nin en güvenilir e-ticaret platformu. Moda dünyasının en yeni trendlerini sizlerle buluşturuyoruz.
            </p>
            {/* Mobile-optimized social icons */}
            <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
              <a 
                href="#" 
                className="p-2 sm:p-2.5 text-gray-400 hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-800"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="#" 
                className="p-2 sm:p-2.5 text-gray-400 hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-800"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="#" 
                className="p-2 sm:p-2.5 text-gray-400 hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-800"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="#" 
                className="p-2 sm:p-2.5 text-gray-400 hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-800"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links - Mobile optimized */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Hızlı Linkler</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Ana Sayfa</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Hakkımızda</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Ürünler</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Kampanyalar</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">İletişim</a></li>
            </ul>
          </div>

          {/* Categories - Mobile optimized */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Kategoriler</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Kadın Giyim</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Erkek Giyim</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Çocuk Giyim</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Aksesuar</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Ayakkabı</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base block py-1 hover:underline">Spor Giyim</a></li>
            </ul>
          </div>

          {/* Contact Info - Mobile optimized */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">İletişim</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center sm:justify-start">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">Malkoçoğlu Mah. 305/1 Sok. No: 17/A, Sultangazi/İstanbul/Türkiye</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 mr-2 sm:mr-3 flex-shrink-0" />
                <a href="tel:+905362971255" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  +90 (536) 297 12 55
                </a>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 mr-2 sm:mr-3 flex-shrink-0" />
                <a href="mailto:info@modabase.com.tr" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base break-all">
                  info@modabase.com.tr
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Mobile optimized */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © 2025 ModaBase. Tüm hakları saklıdır.
            </p>
            {/* Mobile-optimized legal links - PayTR Uyumlu */}
            <div className="flex flex-wrap justify-center md:justify-end gap-x-3 gap-y-2 sm:gap-x-4">
              <a href="/privacy" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors hover:underline">
                Gizlilik Politikası
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors hover:underline">
                Kullanım Şartları
              </a>
              <a href="/mesafeli-satis-sozlesmesi" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors hover:underline">
                Mesafeli Satış Sözleşmesi
              </a>
              <a href="/iptal-iade-politikasi" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors hover:underline">
                İptal-İade Politikası
              </a>
              <a href="/teslimat-bilgileri" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors hover:underline">
                Teslimat Bilgileri
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
