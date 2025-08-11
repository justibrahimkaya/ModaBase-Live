'use client'

import { useState } from 'react'
import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  Send,
  CheckCircle,
  Info
} from 'lucide-react'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    const formData = new FormData(e.currentTarget)
    
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string
    
    // Konu mapping
    const subjectMap: Record<string, string> = {
      'order': 'Sipariş ile ilgili',
      'product': 'Ürün ile ilgili',
      'return': 'İade/Değişim',
      'shipping': 'Kargo/Teslimat',
      'payment': 'Ödeme sorunları',
      'general': 'Genel sorular',
      'suggestion': 'Öneri/Şikayet'
    }
    
    const subjectText = subjectMap[subject] || subject
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          subject: subjectText,
          message,
          businessId: 'modabase-main' // Ana ModaBase sitesi için sabit ID
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        // Formu temizle
        e.currentTarget.reset()
      } else {
        setSubmitStatus('error')
        console.error('Form submission error:', data.error)
      }
    } catch (error) {
      setSubmitStatus('error')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>İletişim - ModaBase | Kadın Giyim Mağazası</title>
        <meta name="description" content="ModaBase ile iletişime geçin. Müşteri hizmetleri, adres bilgileri, çalışma saatleri ve iletişim formu." />
        <meta name="keywords" content="iletişim, müşteri hizmetleri, modabase, kadın giyim, destek, yardım" />
      </Head>
      <main className="min-h-screen bg-gray-50">
        <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20"></div>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Size Nasıl Yardımcı Olabiliriz?
          </h1>
          <p className="text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto">
            ModaBase olarak her zaman yanınızdayız. Sorularınız, önerileriniz veya yardıma ihtiyacınız olduğunda bize ulaşın.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* WhatsApp */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500 transition-colors">
                <MessageCircle className="w-8 h-8 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">Anında destek alın</p>
                                <a
                    href="https://wa.me/905362971255?text=Merhaba ModaBase, yardıma ihtiyacım var."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Mesaj Gönder
                  </a>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors">
                <Phone className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Telefon</h3>
              <p className="text-gray-600 mb-4">Direkt konuşun</p>
              <a
                href="tel:+905362971255"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                (0536) 297 1255
              </a>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors">
                <Mail className="w-8 h-8 text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">E-posta</h3>
              <p className="text-gray-600 mb-4">Detaylı sorular için</p>
              <a
                href="mailto:info@modabase.com.tr"
                className="inline-flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@modabase.com.tr
              </a>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500 transition-colors">
                <MapPin className="w-8 h-8 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Adres</h3>
              <p className="text-gray-600 mb-4">Mağazamızı ziyaret edin</p>
              <address className="text-sm text-gray-700 not-italic">
                Malkoçoğlu Mah.<br />
                305/1 Sokak No:17/A<br />
                Sultangazi/İstanbul
              </address>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Bize Mesaj Gönderin</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Ad *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Adınız"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                          placeholder="(0536) 297 1255"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Konu *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Konu seçin</option>
                    <option value="order">Sipariş ile ilgili</option>
                    <option value="product">Ürün ile ilgili</option>
                    <option value="return">İade/Değişim</option>
                    <option value="shipping">Kargo/Teslimat</option>
                    <option value="payment">Ödeme sorunları</option>
                    <option value="general">Genel sorular</option>
                    <option value="suggestion">Öneri/Şikayet</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mesajınız *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                  ></textarea>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Mesajınız başarıyla gönderildi!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      En kısa sürede size dönüş yapacağız.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <Info className="w-5 h-5" />
                      <span className="font-medium">Mesaj gönderilirken hata oluştu</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      Lütfen tekrar deneyin veya WhatsApp ile iletişime geçin.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className={`w-5 h-5 transition-transform ${isSubmitting ? 'animate-pulse' : 'group-hover:translate-x-1'}`} />
                  {isSubmitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                </button>
              </form>
            </div>

            {/* Company Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">İletişim Bilgileri</h2>
              
              <div className="space-y-8">
                {/* Business Hours */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Çalışma Saatleri</h3>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Pazartesi - Cuma:</span>
                      <span className="font-medium">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cumartesi:</span>
                      <span className="font-medium">10:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pazar:</span>
                      <span className="font-medium text-red-600">Kapalı</span>
                    </div>
                  </div>
                </div>

                {/* Support Info */}
                <div className="bg-blue-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Müşteri Hizmetleri</h3>
                  </div>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>7/24 WhatsApp desteği</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Ücretsiz kargo (2500₺ üzeri)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>14 gün içinde kolay iade</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Güvenli ödeme seçenekleri</span>
                    </div>
                  </div>
                </div>

                {/* Quick Contact */}
                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Hızlı İletişim</h3>
                  <p className="text-gray-700 mb-4">
                    Acil durumlar için WhatsApp üzerinden 7/24 ulaşabilirsiniz.
                  </p>
                  <a
                    href="https://wa.me/905362971255?text=Acil yardıma ihtiyacım var."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Acil Yardım
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* WhatsApp Support Button */}
      <WhatsAppButton
        phoneNumber="905362971255"
        variant="floating"
        size="lg"
        isBusinessAdmin={false}
        className="bottom-6 right-6"
      />
      </main>
    </>
  )
}