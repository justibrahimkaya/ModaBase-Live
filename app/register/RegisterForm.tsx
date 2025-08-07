'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { User, Lock, Eye, EyeOff, ArrowRight, Mail, Phone, Shield, Star, XCircle, UserPlus, Zap } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (!formData.name.trim() || !formData.surname.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Tüm alanları doldurun')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('Üyelik sözleşmesini kabul etmelisiniz')
      setLoading(false)
      return
    }

    try {
      // Registration logic here
      setLoading(false)
    } catch (error) {
      setError('Üye olurken bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12 px-4 sm:px-6 lg:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M50 50L25 25L75 25Z'/%3E%3Cpath d='M50 50L75 75L25 75Z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="max-w-2xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 transform rotate-6 shadow-2xl">
              <UserPlus className="h-10 w-10 text-white transform -rotate-6" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              ModaBase'e Katıl!
            </h1>
            <p className="text-purple-200 text-xl">
              Binlerce moda ürünü, özel indirimler ve daha fazlası
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Social Login Buttons */}
            <div className="space-y-4 mb-8">
              <div className="text-center">
                <p className="text-purple-100 text-sm mb-4">Hızlı üyelik için</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Sign Up */}
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                {/* Facebook Sign Up */}
                <button
                  type="button"
                  onClick={() => signIn('facebook', { callbackUrl: '/' })}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">veya e-posta ile</span>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-purple-100 mb-2">
                    Ad
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-purple-300" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Adınız"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-purple-100 mb-2">
                    Soyad
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-purple-300" />
                    </div>
                    <input
                      id="surname"
                      name="surname"
                      type="text"
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Soyadınız"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-100 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-purple-300" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-purple-100 mb-2">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-purple-300" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="0555 123 45 67"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-purple-100 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-purple-300" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Şifreniz"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-100 mb-2">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-purple-300" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Şifre tekrar"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center">
                <input
                  id="accept-terms"
                  name="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/30 rounded bg-white/10"
                />
                <label htmlFor="accept-terms" className="ml-2 block text-sm text-purple-200">
                  <a href="/terms" className="text-purple-300 hover:text-white transition-colors">
                    Üyelik sözleşmesini
                  </a> ve{' '}
                  <a href="/privacy" className="text-purple-300 hover:text-white transition-colors">
                    gizlilik politikasını
                  </a> kabul ediyorum
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Üye Ol</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-purple-200">
                Zaten hesabınız var mı?{' '}
                <a href="/login" className="font-medium text-purple-300 hover:text-white transition-colors">
                  Giriş yapın
                </a>
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="text-white font-semibold mb-2">Güvenli Alışveriş</h3>
              <p className="text-purple-200 text-sm">SSL sertifikası ile korumalı ödeme sistemi</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-pink-300" />
              </div>
              <h3 className="text-white font-semibold mb-2">Özel İndirimler</h3>
              <p className="text-purple-200 text-sm">Üyelere özel kampanyalar ve indirimler</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-indigo-300" />
              </div>
              <h3 className="text-white font-semibold mb-2">Hızlı Teslimat</h3>
              <p className="text-purple-200 text-sm">24 saat içinde kargo, ücretsiz teslimat</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}