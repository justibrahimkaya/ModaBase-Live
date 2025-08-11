'use client'

import { useState, useEffect } from 'react'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function TestWhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('905555555555')
  const [message, setMessage] = useState('')
  const [businessName, setBusinessName] = useState('ModaBase')
  const [isMobile, setIsMobile] = useState(false)

  // Mobil cihaz kontrolü - SSR Safe
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">WhatsApp Buton Test Sayfası</h1>
        
        {/* Mobile Device Info */}
        {isMobile && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-800 font-medium">Mobil Cihaz Algılandı</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              WhatsApp butonları mobil optimizasyonu ile test ediliyor.
            </p>
          </div>
        )}
        
        {/* Test Controls */}
        <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Test Ayarları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Numarası
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="905555555555"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İşletme Adı
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ModaBase"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Özel Mesaj (Opsiyonel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Özel mesajınızı buraya yazın..."
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Floating Buttons */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Floating Buttons</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Müşteri Desteği</h4>
                  <p className="text-sm text-gray-600">Normal kullanıcılar için</p>
                </div>
                <WhatsAppButton
                  phoneNumber={phoneNumber}
                  message={message}
                  variant="floating"
                  size="md"
                  isBusinessAdmin={false}
                  businessName={businessName}
                  className="relative bottom-0 right-0"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium">İşletme Desteği</h4>
                  <p className="text-sm text-gray-600">İşletme sahipleri için</p>
                </div>
                <WhatsAppButton
                  phoneNumber={phoneNumber}
                  message={message}
                  variant="floating"
                  size="md"
                  isBusinessAdmin={true}
                  className="relative bottom-0 right-0"
                />
              </div>
            </div>
          </div>

          {/* Inline Buttons */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Inline Buttons</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Müşteri Desteği</h4>
                <WhatsAppButton
                  phoneNumber={phoneNumber}
                  message={message}
                  variant="inline"
                  isBusinessAdmin={false}
                  businessName={businessName}
                />
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">İşletme Desteği</h4>
                <WhatsAppButton
                  phoneNumber={phoneNumber}
                  message={message}
                  variant="inline"
                  isBusinessAdmin={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Size Variants */}
        <div className="bg-white rounded-lg p-4 sm:p-6 mt-6 sm:mt-8 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Boyut Varyantları</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Küçük</p>
              <WhatsAppButton
                phoneNumber={phoneNumber}
                variant="floating"
                size="sm"
                isBusinessAdmin={false}
                className="relative bottom-0 right-0"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Orta</p>
              <WhatsAppButton
                phoneNumber={phoneNumber}
                variant="floating"
                size="md"
                isBusinessAdmin={false}
                className="relative bottom-0 right-0"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Büyük</p>
              <WhatsAppButton
                phoneNumber={phoneNumber}
                variant="floating"
                size="lg"
                isBusinessAdmin={false}
                className="relative bottom-0 right-0"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Test Talimatları</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• WhatsApp numarasını değiştirerek farklı numaraları test edin</li>
            <li>• Özel mesaj ekleyerek mesaj özelleştirmesini test edin</li>
            <li>• İşletme adını değiştirerek dinamik mesajları test edin</li>
            <li>• Farklı boyutları ve varyantları test edin</li>
            <li>• Butonlara tıklayarak WhatsApp'ın açılıp açılmadığını kontrol edin</li>
            {isMobile && (
              <>
                <li>• Mobilde touch target boyutlarını test edin (minimum 44px)</li>
                <li>• Safe area desteğini kontrol edin (iPhone'larda alt kısım)</li>
                <li>• Active state animasyonlarını test edin</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
} 