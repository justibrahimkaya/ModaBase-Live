'use client'

import { Truck, Clock, RefreshCw, Shield, MapPin } from 'lucide-react'

export default function DeliveryInfo() {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Teslimat ve İade Bilgileri</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Delivery */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Teslimat</h3>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span>1-3 iş günü içinde teslimat</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Adresinize teslimat</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>₺150 üzeri ücretsiz kargo</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Önemli:</strong> Teslimat süresi, siparişinizin onaylanma saatine göre değişebilir.
            </p>
          </div>
        </div>

        {/* Return Policy */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <RefreshCw className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">İade Politikası</h3>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span>30 gün içinde iade</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Ücretsiz iade kargo</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-orange-600" />
              <span>Kullanılmamış ürünler</span>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Koşul:</strong> Ürün orijinal ambalajında ve kullanılmamış olmalıdır.
            </p>
          </div>
        </div>

        {/* Payment Security */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Güvenli Ödeme</h3>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>SSL şifreli ödeme</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>256-bit güvenlik</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span>PCI DSS uyumlu</span>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800">
              <strong>Güvence:</strong> Tüm ödemeleriniz güvenli şekilde işlenir.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Önemli Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Teslimat Bölgeleri</h4>
            <ul className="space-y-1">
              <li>• Tüm Türkiye geneli teslimat</li>
              <li>• Adalar dahil tüm bölgeler</li>
              <li>• Köy ve kasabalara da teslimat</li>
              <li>• PTT ve özel kargo firmaları</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">İade Süreci</h4>
            <ul className="space-y-1">
              <li>• Online iade talebi</li>
              <li>• Kargo firması ile ücretsiz toplama</li>
              <li>• 3-5 iş günü içinde iade</li>
              <li>• Para iadesi 7-10 iş günü</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Sorularınız için</h4>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📞 0536 297 12 55</span>
                      <span>📧 info@modabase.com.tr</span>
          <span>💬 Canlı Destek</span>
        </div>
      </div>
    </section>
  )
}
