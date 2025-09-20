'use client'

import { useState } from 'react'
import { User, Lock, Eye, EyeOff, ArrowRight, Building2, CheckCircle, AlertCircle, LogIn } from 'lucide-react'

export default function BusinessLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setError('')

    // Form validasyonu
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
      setError('Şifre boş bırakılamaz')
      setLoading(false)
      return
    }

    try {
      console.log('🏢 Business login başlatılıyor...');
      
      const response = await fetch('/api/admin/business-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Cookie'ler için önemli
        body: JSON.stringify(formData)
      })

      console.log('📡 Business login API yanıt:', response.status, response.statusText);
      const data = await response.json()
      console.log('📋 Business login API data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Giriş yapılamadı')
      }

      console.log('✅ Business login başarılı, yönlendiriliyor...');
      console.log('🍪 Cookie kontrol:', document.cookie);

      // Başarılı giriş - cookie'nin set edilmesini bekleyip sonra yönlendir
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/admin'

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-20 w-40 h-40 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/10 backdrop-blur-sm">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            İşletme Girişi
          </h1>
          <p className="mt-2 text-lg font-medium text-gray-300">ModaBase İşletme Paneli</p>
          <p className="mt-1 text-sm text-gray-400">Mağazanızı yönetmek için giriş yapın</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200">
                İşletme E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="isletme@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Giriş Yapılıyor...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>İşletme Paneline Gir</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm font-medium text-green-300">Henüz işletmeniz kayıtlı değil mi?</span>
              </div>
              <p className="text-sm text-gray-300">
                ModaBase'e işletmenizi kaydederek premium e-ticaret çözümlerimizden yararlanın.
              </p>
              <a
                href="/admin/register"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                İşletme Kaydı Yap
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              ← Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
