import { Clock, Mail, Phone, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Back to Home */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana sayfaya dön
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
          {/* Status Icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <Clock className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Başvurunuz İnceleniyor
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Mağaza başvurunuz başarıyla alındı ve kalite ekibimiz tarafından değerlendirilmektedir. 
            <span className="font-semibold text-orange-600"> 48 saat içinde</span> email ile bilgilendirileceksiniz.
          </p>

          {/* Process Steps */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Değerlendirme Süreci</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 - Completed */}
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-green-800 mb-1">Başvuru Alındı</h3>
                <p className="text-sm text-green-600 text-center">Bilgileriniz sisteme kaydedildi</p>
              </div>

              {/* Step 2 - In Progress */}
              <div className="flex flex-col items-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3 animate-pulse">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-orange-800 mb-1">İnceleme</h3>
                <p className="text-sm text-orange-600 text-center">Kalite ekibi değerlendirme yapıyor</p>
              </div>

              {/* Step 3 - Pending */}
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-1">Sonuç Bildirimi</h3>
                <p className="text-sm text-gray-500 text-center">Email ile bilgilendirileceksiniz</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Bekleme Süresinde
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>✅ Email adresinizi düzenli olarak kontrol edin</p>
              <p>✅ Spam klasörünüzü de kontrol etmeyi unutmayın</p>
              <p>✅ 48 saat sonra bildirim gelmezse bizimle iletişime geçin</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Sorularınız için</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:info@modabase.com.tr"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                info@modabase.com.tr
              </a>
              <a 
                href="tel:05362971255"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                0536 297 12 55
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              Onay sürecimiz güvenilir bir marketplace ortamı oluşturmak için tasarlanmıştır. 
              Sabrınız için teşekkür ederiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
