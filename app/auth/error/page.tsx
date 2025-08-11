'use client'

import { useSearchParams } from 'next/navigation'
import { AlertCircle, Home, LogIn, Shield } from 'lucide-react'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Kimlik doğrulama yapılandırma hatası. Lütfen daha sonra tekrar deneyin.'
      case 'AccessDenied':
        return 'Erişim reddedildi. Bu hesaba giriş yapmaya yetkiniz bulunmuyor.'
      case 'Verification':
        return 'E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş.'
      case 'Default':
        return 'Kimlik doğrulama sırasında bir hata oluştu.'
      case 'OAuthSignin':
        return 'Sosyal medya giriş hizmeti ile bağlantı kurulamadı.'
      case 'OAuthCallback':
        return 'Sosyal medya giriş işlemi tamamlanamadı.'
      case 'OAuthCreateAccount':
        return 'Sosyal medya hesabı ile kullanıcı oluşturulamadı.'
      case 'EmailCreateAccount':
        return 'E-posta ile hesap oluşturulamadı.'
      case 'Callback':
        return 'Giriş işlemi tamamlanamadı.'
      case 'OAuthAccountNotLinked':
        return 'Bu sosyal medya hesabı başka bir e-posta adresi ile bağlantılı. Lütfen ilgili e-posta adresi ile giriş yapın.'
      case 'EmailSignin':
        return 'E-posta gönderilirken hata oluştu.'
      case 'CredentialsSignin':
        return 'Geçersiz kullanıcı adı veya şifre.'
      case 'SessionRequired':
        return 'Bu sayfaya erişim için giriş yapmanız gerekiyor.'
      default:
        return 'Kimlik doğrulama sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
    }
  }

  const getSuggestion = (error: string | null) => {
    switch (error) {
      case 'Configuration':
      case 'Default':
        return 'Lütfen birkaç dakika sonra tekrar deneyin veya bizimle iletişime geçin.'
      case 'AccessDenied':
        return 'Farklı bir hesap ile giriş yapmayı deneyin veya yetki talebi için bizimle iletişime geçin.'
      case 'Verification':
        return 'Yeni bir doğrulama e-postası talep edin veya giriş yapmayı deneyin.'
      case 'OAuthAccountNotLinked':
        return 'Daha önce kullandığınız e-posta adresi ile giriş yapmayı deneyin.'
      case 'CredentialsSignin':
        return 'Şifrenizi kontrol edin veya şifre sıfırlama işlemini deneyin.'
      case 'SessionRequired':
        return 'Giriş yaptıktan sonra bu sayfaya geri dönebilirsiniz.'
      default:
        return 'Sorun devam ederse lütfen bizimle iletişime geçin.'
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 max-w-lg w-full">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Kimlik Doğrulama Hatası
              </h1>
              
              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-800 font-medium mb-2">
                  {getErrorMessage(error)}
                </p>
                <p className="text-red-600 text-sm">
                  {getSuggestion(error)}
                </p>
              </div>
              
              {/* Error Code */}
              {error && (
                <div className="bg-gray-100 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-600">
                    Hata Kodu: <span className="font-mono font-semibold">{error}</span>
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Giriş Sayfasına Git</span>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                >
                  <Home className="w-5 h-5" />
                  <span>Ana Sayfaya Dön</span>
                </button>
                
                {error === 'CredentialsSignin' && (
                  <button 
                    onClick={() => window.location.href = '/forgot-password'}
                    className="w-full bg-orange-100 text-orange-700 px-6 py-3 rounded-xl hover:bg-orange-200 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Şifremi Unuttum</span>
                  </button>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Sorun devam ederse{' '}
                                <a href="mailto:info@modabase.com.tr" className="text-blue-600 hover:text-blue-700 font-medium">
                info@modabase.com.tr
                  </a>{' '}
                  adresinden bizimle iletişime geçin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
