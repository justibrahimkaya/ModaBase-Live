'use client'

import { useState, useEffect } from 'react'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [envStatus, setEnvStatus] = useState<any>(null)

  // Environment durumunu kontrol et
  useEffect(() => {
    checkEnvironment()
  }, [])

  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/test-email')
      const data = await response.json()
      setEnvStatus(data)
    } catch (error) {
      console.error('Environment check error:', error)
    }
  }

  const sendTestEmail = async () => {
    if (!email) {
      alert('Lütfen email adresi girin')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        error: 'Test email gönderilemedi',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Email Sistemi Test Sayfası</h1>
        
        {/* Environment Status */}
        {envStatus && (
          <div className={`rounded-lg p-4 mb-6 ${
            envStatus.status === 'READY' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                envStatus.status === 'READY' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium ${
                envStatus.status === 'READY' ? 'text-green-800' : 'text-red-800'
              }`}>
                Environment Status: {envStatus.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>SMTP_HOST:</strong> {envStatus.environment.smtp_host || 'MISSING'}</p>
                <p><strong>SMTP_PORT:</strong> {envStatus.environment.smtp_port || 'MISSING'}</p>
                <p><strong>SMTP_USER:</strong> {envStatus.environment.smtp_user || 'MISSING'}</p>
                <p><strong>SMTP_PASS:</strong> {envStatus.environment.smtp_pass}</p>
              </div>
              <div>
                <p><strong>EMAIL_FROM:</strong> {envStatus.environment.email_from || 'MISSING'}</p>
                <p><strong>NODE_ENV:</strong> {envStatus.environment.node_env || 'MISSING'}</p>
                <p><strong>APP_URL:</strong> {envStatus.environment.app_url || 'MISSING'}</p>
              </div>
            </div>

            {envStatus.issues && envStatus.issues.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-800 mb-2">Sorunlar:</h4>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  {envStatus.issues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Test Email Form */}
        <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Test Email Gönder</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Email Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test@example.com"
            />
          </div>
          
          <button
            onClick={sendTestEmail}
            disabled={loading || !email}
            className={`w-full px-4 py-2 rounded-md text-white font-medium ${
              loading || !email
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Gönderiliyor...' : 'Test Email Gönder'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-lg p-4 mb-6 ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Başarılı' : '❌ Hata'}
            </h3>
            
            <div className="text-sm">
              <p className="mb-2">{result.message || result.error}</p>
              
              {result.details && (
                <div className="bg-gray-100 p-3 rounded">
                  <p className="font-medium mb-1">Detaylar:</p>
                  <p className="text-gray-700">{result.details}</p>
                </div>
              )}
              
              {result.environment && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Environment Bilgileri:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <p><strong>SMTP_HOST:</strong> {result.environment.smtp_host}</p>
                    <p><strong>SMTP_PORT:</strong> {result.environment.smtp_port}</p>
                    <p><strong>SMTP_USER:</strong> {result.environment.smtp_user}</p>
                    <p><strong>SMTP_PASS:</strong> {result.environment.smtp_pass}</p>
                    <p><strong>EMAIL_FROM:</strong> {result.environment.email_from}</p>
                    <p><strong>NODE_ENV:</strong> {result.environment.node_env}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Email Sistemi Test Talimatları</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Önce environment durumunu kontrol edin</li>
            <li>• Tüm SMTP ayarlarının doğru olduğundan emin olun</li>
            <li>• Gmail App Password kullanıldığından emin olun</li>
            <li>• Test email adresini girin ve gönderin</li>
            <li>• Email'in spam klasöründe olup olmadığını kontrol edin</li>
            <li>• Hata durumunda console loglarını kontrol edin</li>
          </ul>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">Gmail App Password Nasıl Alınır?</h4>
            <ol className="text-yellow-700 text-sm space-y-1">
              <li>1. Gmail hesabınıza giriş yapın</li>
              <li>2. Google Account Settings → Security</li>
              <li>3. "2-Step Verification" aktif edin</li>
              <li>4. "App passwords" → "ModaBase" için password oluşturun</li>
              <li>5. 16 haneli kodu SMTP_PASS olarak kullanın</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 