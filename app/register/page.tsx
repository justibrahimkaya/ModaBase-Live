'use client'

import { useState } from 'react'
import { User, Lock, Eye, EyeOff, ArrowRight, Mail, Phone, Shield, Star, Sparkles, Crown, CheckCircle, XCircle, UserPlus, Zap } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RegisterPage() {
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
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Password strength calculator
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const getPasswordStrengthColor = (strength: number) => {
    switch (strength) {
      case 0: case 1: return 'bg-red-500'
      case 2: return 'bg-orange-500'
      case 3: return 'bg-yellow-500'
      case 4: return 'bg-blue-500'
      case 5: return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0: case 1: return 'Çok Zayıf'
      case 2: return 'Zayıf'
      case 3: return 'Orta'
      case 4: return 'Güçlü'
      case 5: return 'Çok Güçlü'
      default: return ''
    }
  }

  const passwordStrength = calculatePasswordStrength(formData.password)

  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider)
    setError('')
    
    try {
      const result = await signIn(provider, {
        callbackUrl: '/profile',
        redirect: false
      })
      
      if (result?.error) {
        setError(`${provider === 'google' ? 'Google' : 'Facebook'} ile kayıt olma başarısız oldu`)
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      setError('Sosyal medya kayıt işleminde bir hata oluştu')
    } finally {
      setSocialLoading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Form validasyonu
    if (!formData.name.trim()) {
      setError('Ad alanı boş bırakılamaz')
      setLoading(false)
      return
    }

    if (!formData.surname.trim()) {
      setError('Soyad alanı boş bırakılamaz')
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('E-posta adresi boş bırakılamaz')
      setLoading(false)
      return
    }

    // E-posta format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir e-posta adresi girin')
      setLoading(false)
      return
    }

    if (!formData.password) {
      setError('Şifre alanı boş bırakılamaz')
      setLoading(false)
      return
    }

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('Kullanım şartlarını kabul etmelisiniz')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt yapılamadı')
      }

      // Başarılı kayıt sonrası otomatik giriş yap
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl: '/profile',
        redirect: false
      })

      if (signInResult?.error) {
        // Kayıt başarılı ama giriş başarısız - kullanıcıyı login sayfasına yönlendir
        window.location.href = '/login?message=Kayıt başarılı! Şimdi giriş yapabilirsiniz.'
      } else if (signInResult?.url) {
        window.location.href = signInResult.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-violet-500 rounded-full blur-xl opacity-25 animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-xl opacity-30 animate-pulse delay-3000"></div>
        </div>

        <div className="relative z-10 py-16">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li><a href="/" className="hover:text-violet-600 transition-colors">Ana Sayfa</a></li>
                <li>/</li>
                <li className="text-gray-900 font-medium">Kayıt Ol</li>
              </ol>
            </nav>

            {/* Registration Card */}
            <div className="relative">
              {/* Glassmorphism Card */}
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
                {/* Free Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                    <Crown className="w-4 h-4" />
                    <span>Ücretsiz Üyelik</span>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8 mt-4">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <UserPlus className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                    Hesap Oluşturun
                  </h1>
                  <p className="text-gray-600 text-lg">ModaBase'e katılın ve kaliteli alışveriş deneyimini yaşayın</p>
                  <div className="flex flex-col items-center space-y-2 mt-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-500">100% Güvenli</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-500">Ücretsiz</span>
                      </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1">
                      <span className="text-emerald-700 text-sm font-medium">🎉 Kayıt tamamen ücretsiz - Hiçbir ücret talep edilmez</span>
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Bilgilerinizi Girin</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-bold">2</span>
                      </div>
                      <span className="text-sm text-gray-500">Doğrulama</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-bold">3</span>
                      </div>
                      <span className="text-sm text-gray-500">Tamamlandı</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl animate-shake">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-600 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Social Registration - Temporarily disabled */}
                {/* Uncomment this section when you have real Google/Facebook OAuth credentials */}
                {false && (
                <div className="mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300/50" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/80 text-gray-500 font-medium">Hızlı kayıt</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSocialSignIn('google')}
                      disabled={socialLoading === 'google'}
                      className="group relative w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {socialLoading === 'google' ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent mr-2"></div>
                      ) : (
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Google
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialSignIn('facebook')}
                      disabled={socialLoading === 'facebook'}
                      className="group relative w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {socialLoading === 'facebook' ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent mr-2"></div>
                      ) : (
                        <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                        </svg>
                      )}
                      Facebook
                    </button>
                  </div>
                </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <User className="w-4 h-4 text-violet-500" />
                        <span>Ad *</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 group-hover:bg-white/70"
                          placeholder="Adınız"
                          required
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-500" />
                        <span>Soyad *</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.surname}
                          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                          className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:bg-white/70"
                          placeholder="Soyadınız"
                          required
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span>E-posta Adresi *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/70"
                        placeholder="ornek@email.com"
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      <span>Telefon</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 group-hover:bg-white/70"
                        placeholder="+90 5XX XXX XX XX"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      <span>Şifre *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 group-hover:bg-white/70"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{getPasswordStrengthText(passwordStrength)}</span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center space-x-1">
                            {formData.password.length >= 8 ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span>En az 8 karakter</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {/[A-Z]/.test(formData.password) ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span>Büyük harf</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {/[0-9]/.test(formData.password) ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span>Rakam</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-orange-500" />
                      <span>Şifre Tekrar *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 group-hover:bg-white/70"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div className="mt-2 flex items-center space-x-1">
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Şifreler eşleşiyor</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">Şifreler eşleşmiyor</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="sr-only"
                        required
                      />
                      <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 cursor-pointer ${
                        acceptTerms 
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 border-violet-500' 
                          : 'border-gray-300 hover:border-violet-400'
                      }`} onClick={() => setAcceptTerms(!acceptTerms)}>
                        {acceptTerms && (
                          <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-700">
                        <a href="/terms" className="text-violet-600 hover:text-violet-700 font-medium hover:underline">
                          Kullanım Koşulları
                        </a>
                        {' '}ve{' '}
                        <a href="/privacy" className="text-violet-600 hover:text-violet-700 font-medium hover:underline">
                          Gizlilik Politikası
                        </a>
                        'nı kabul ediyorum.
                      </p>
                    </div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-violet-700 hover:to-purple-700 focus:ring-4 focus:ring-violet-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Hesap oluşturuluyor...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          <span>Hesap Oluştur</span>
                          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <p className="text-center text-gray-600">
                    Zaten hesabınız var mı?{' '}
                    <a href="/login" className="text-violet-600 hover:text-violet-700 font-semibold hover:underline transition-all duration-300">
                      Giriş yapın
                    </a>
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span>Ücretsiz</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-blue-500" />
                      <span>Premium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  )
}
