'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/components/CartContext'
import { useRouter } from 'next/navigation'
import { ShippingQuote } from '@/lib/shippingService'

const steps = [
  { id: 1, label: 'Teslimat Bilgileri' },
  { id: 2, label: 'Ödeme Yöntemi' }
]



export default function CheckoutPage() {
  // Tüm hook'lar en başta
  const { items, getTotal, loading } = useCart()
  const [step, setStep] = useState(1)
  const [delivery, setDelivery] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    addressTitle: '',
    city: '',
    district: '',
    neighborhood: '',
    address: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showInvoiceAddress, setShowInvoiceAddress] = useState(false)
  const [invoice, setInvoice] = useState({
    invoiceType: 'BIREYSEL', // BIREYSEL veya KURUMSAL
    name: '',
    surname: '',
    email: '',
    phone: '',
    addressTitle: '',
    city: '',
    district: '',
    neighborhood: '',
    address: '',
    tcKimlikNo: '',
    vergiNo: '',
    vergiDairesi: '',
    unvan: ''
  })
  const [invoiceErrors, setInvoiceErrors] = useState<{ [key: string]: string }>({})

  const [selectedCargoCompany, setSelectedCargoCompany] = useState<string>('')
  const [cargoQuotes, setCargoQuotes] = useState<ShippingQuote[]>([])
  const [isLoadingCargo, setIsLoadingCargo] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paytr' | 'bank-transfer'>('paytr')
  const [bankTransferData, setBankTransferData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    transferDate: '',
    transferNote: ''
  })
  
  // ✅ Sözleşme kabul durumları - PayTR Uyumluluğu için ZORUNLU
  const [agreements, setAgreements] = useState({
    distanceSales: false,
    returnPolicy: false,
    deliveryInfo: false,
    termsConditions: false
  })
  const [agreementErrors, setAgreementErrors] = useState<string[]>([])
  
  const router = useRouter();

  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push('/cart');
    }
  }, [loading, items, router]);

  // Kargo fiyatlarını otomatik hesapla
  useEffect(() => {
    if (delivery.city && delivery.district && items.length > 0) {
      calculateCargoPrices();
    }
  }, [delivery.city, delivery.district, items]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Sepet yükleniyor...</div>;
  }
  if (items.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Yönlendiriliyor...</div>;
  }

  // ✅ Sözleşme değişikliklerini handle et
  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    // Hata varsa temizle
    if (agreementErrors.length > 0) {
      setAgreementErrors([])
    }
  }

  // ✅ Sözleşmeleri validate et
  const validateAgreements = () => {
    const errors: string[] = []
    
    if (!agreements.distanceSales) {
      errors.push('Mesafeli Satış Sözleşmesini kabul etmeniz zorunludur')
    }
    if (!agreements.returnPolicy) {
      errors.push('İptal-İade Politikasını kabul etmeniz zorunludur')
    }
    if (!agreements.deliveryInfo) {
      errors.push('Teslimat Bilgilerini kabul etmeniz zorunludur')
    }
    if (!agreements.termsConditions) {
      errors.push('Kullanım Şartlarını kabul etmeniz zorunludur')
    }
    
    setAgreementErrors(errors)
    return errors.length === 0
  }

  // Kargo ücretini hesapla
  const getShippingCost = () => {
    const subtotal = getTotal()
    
    // 2500₺ üzeri alışverişlerde ücretsiz kargo
    if (subtotal >= 2500) return 0
    
    // Gerçek kargo firması seçilmişse
    if (selectedCargoCompany && cargoQuotes.length > 0) {
      const selectedQuote = cargoQuotes.find(q => q.companyId === selectedCargoCompany)
      return selectedQuote ? selectedQuote.price : 0
    }
    
    // Kargo seçilmemişse 0 döndür
    return 0
  }

  // Kargo fiyatlarını hesapla - GERÇEK API
  const calculateCargoPrices = async () => {
    if (!delivery.city || !delivery.district) return
    
    console.log('🚚 Gerçek kargo fiyatları hesaplanıyor...')
    console.log('📍 Adres:', delivery.city, delivery.district)
    console.log('📦 Ürün sayısı:', items.length)
    
    setIsLoadingCargo(true)
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          fromAddress: 'İstanbul, Türkiye', // Mağaza adresi
          toAddress: `${delivery.city}, ${delivery.district}`
        })
      })
      
      const data = await response.json()
      console.log('📡 API yanıtı:', data)
      
      if (data.success) {
        setCargoQuotes(data.quotes)
        console.log('✅ Kargo fiyatları alındı:', data.quotes.length, 'firma')
        
        if (data.quotes.length > 0) {
          // En ucuz olanı seç
          const cheapest = data.quotes.reduce((min: any, quote: any) => 
            quote.price < min.price ? quote : min
          )
          setSelectedCargoCompany(cheapest.companyId)
          console.log('💰 En ucuz kargo:', cheapest.companyName, cheapest.price, '₺')
        }
      } else {
        console.error('❌ Kargo API hatası:', data.error)
      }
    } catch (error) {
      console.error('❌ Kargo fiyatı hesaplanamadı:', error)
    } finally {
      setIsLoadingCargo(false)
    }
  }

  // Stepper bileşeni
  const Stepper = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${
            step === s.id ? 'bg-primary-600' : 'bg-gray-300'
          }`}>
            {s.id}
          </div>
          <span className={`ml-2 mr-4 font-medium ${step === s.id ? 'text-primary-600' : 'text-gray-500'}`}>{s.label}</span>
          {i < steps.length - 1 && <div className="w-8 h-1 bg-gray-200 rounded" />}
        </div>
      ))}
    </div>
  )

  // Teslimat Bilgileri Formu
  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDelivery({ ...delivery, [e.target.name]: e.target.value })
  }

  const validateDelivery = () => {
    const newErrors: { [key: string]: string } = {}
    if (!delivery.name) newErrors.name = 'Ad zorunlu'
    if (!delivery.surname) newErrors.surname = 'Soyad zorunlu'
    if (!delivery.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(delivery.email)) newErrors.email = 'Geçerli e-posta girin'
    if (!delivery.phone || !/^\d{10,15}$/.test(delivery.phone.replace(/\D/g, ''))) newErrors.phone = 'Geçerli telefon girin'
    if (!delivery.addressTitle) newErrors.addressTitle = 'Adres başlığı zorunlu'
    if (!delivery.city) newErrors.city = 'İl zorunlu'
    if (!delivery.district) newErrors.district = 'İlçe zorunlu'
    if (!delivery.neighborhood) newErrors.neighborhood = 'Mahalle zorunlu'
    if (!delivery.address) newErrors.address = 'Açık adres zorunlu'
    if (!selectedCargoCompany) newErrors.shipping = 'Kargo firması seçimi zorunlu'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value })
  }

  const validateInvoice = () => {
    if (!showInvoiceAddress) return true
    const newErrors: { [key: string]: string } = {}
    if (!invoice.invoiceType) newErrors.invoiceType = 'Fatura tipi zorunlu'
    if (!invoice.name) newErrors.name = 'Ad zorunlu'
    if (!invoice.surname) newErrors.surname = 'Soyad zorunlu'
    if (!invoice.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(invoice.email)) newErrors.email = 'Geçerli e-posta girin'
    if (!invoice.phone || !/^\d{10,15}$/.test(invoice.phone.replace(/\D/g, ''))) newErrors.phone = 'Geçerli telefon girin'
    if (!invoice.addressTitle) newErrors.addressTitle = 'Adres başlığı zorunlu'
    if (!invoice.city) newErrors.city = 'İl zorunlu'
    if (!invoice.district) newErrors.district = 'İlçe zorunlu'
    if (!invoice.neighborhood) newErrors.neighborhood = 'Mahalle zorunlu'
    if (!invoice.address) newErrors.address = 'Açık adres zorunlu'
    if (invoice.invoiceType === 'BIREYSEL') {
      if (!invoice.tcKimlikNo || !/^\d{11}$/.test(invoice.tcKimlikNo)) newErrors.tcKimlikNo = '11 haneli TC Kimlik No girin'
    } else if (invoice.invoiceType === 'KURUMSAL') {
      if (!invoice.vergiNo || !/^\d{10}$/.test(invoice.vergiNo)) newErrors.vergiNo = '10 haneli Vergi No girin'
      if (!invoice.vergiDairesi) newErrors.vergiDairesi = 'Vergi dairesi zorunlu'
      if (!invoice.unvan) newErrors.unvan = 'Şirket unvanı zorunlu'
    }
    setInvoiceErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateDelivery() && validateInvoice()) {
      setStep(2)
    }
  }


  const subtotal = getTotal() // Ürün fiyatları toplamı (KDV HARİÇ)
  const shippingCost = getShippingCost()
  
  // KDV Hesaplaması
  const TAX_RATE = 0.10 // %10 KDV
  
  // KDV'yi ürün fiyatı üzerine EKLE
  const taxAmount = subtotal * TAX_RATE // KDV tutarı
  const subtotalWithTax = subtotal + taxAmount // KDV dahil ara toplam
  
  // Toplam tutar (KDV dahil ürün fiyatı + kargo)
  const total = subtotalWithTax + shippingCost

  // PayTR ile ödeme başlat
  const handlePaytrPayment = async () => {
    // ✅ ZORUNLU: Sözleşmeleri kontrol et
    if (!validateAgreements()) {
      alert('Lütfen tüm sözleşmeleri okuyup kabul edin!')
      return
    }
    
    setIsPlacingOrder(true)
    try {
      console.log('🚀 PayTR ödeme süreci başlatılıyor...')
      
      // Önce siparişi oluştur
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color
        })),
        total: total,
        subtotal: subtotal,
        subtotalWithTax: subtotalWithTax,
        taxRate: TAX_RATE,
        taxAmount: taxAmount,
        shippingCost: getShippingCost(),
        shippingMethod: selectedCargoCompany || 'cargo',
        paymentMethod: 'PAYTR',
        // Teslimat bilgileri
        guestName: delivery.name,
        guestSurname: delivery.surname,
        guestEmail: delivery.email,
        guestPhone: delivery.phone,
        // Adres bilgileri
        address: {
          title: delivery.addressTitle,
          city: delivery.city,
          district: delivery.district,
          neighborhood: delivery.neighborhood,
          address: delivery.address
        },
        // Fatura bilgileri (varsa)
        invoiceType: showInvoiceAddress ? invoice.invoiceType : null,
        tcKimlikNo: showInvoiceAddress ? invoice.tcKimlikNo : null,
        vergiNo: showInvoiceAddress ? invoice.vergiNo : null,
        vergiDairesi: showInvoiceAddress ? invoice.vergiDairesi : null,
        unvan: showInvoiceAddress ? invoice.unvan : null
      }

      console.log('📋 Sipariş oluşturuluyor...', {orderId: 'pending', total: total})

      // Siparişi oluştur
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const orderResult = await orderResponse.json()
      console.log('📦 Sipariş yanıtı:', orderResult)
      
      if (!orderResult.success) {
        console.error('❌ Sipariş oluşturulamadı:', orderResult.error)
        throw new Error(orderResult.error || 'Sipariş oluşturulamadı')
      }

      const orderId = orderResult.order.id
      console.log('✅ Sipariş oluşturuldu:', orderId)

      // PayTR token isteği
      const paytrData = {
        merchant_oid: orderId.replace(/[^a-zA-Z0-9]/g, ''), // Alt çizgi ve özel karakterleri kaldır
        amount: total.toString(), // TL cinsinden (API'de kuruş'a çevrilecek)
        email: delivery.email,
        user_ip: '127.0.0.1',
        user_name: delivery.name + ' ' + delivery.surname,
        user_address: `${delivery.city}, ${delivery.district}, ${delivery.address}`,
        user_phone: delivery.phone
      }

      console.log('💳 PayTR token isteniyor...', {orderId, amount: paytrData.amount, email: paytrData.email})

      const res = await fetch('/api/paytr/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paytrData)
      })

      console.log('📡 PayTR API yanıt durumu:', res.status, res.statusText)
      console.log('📡 PayTR API yanıt headers:', Object.fromEntries(res.headers.entries()))

      // Response'u parse etmeye çalış
      let data;
      try {
        const responseText = await res.text()
        console.log('📄 PayTR API Ham Yanıt:', responseText)
        
        if (!responseText || responseText.trim() === '') {
          throw new Error(`PayTR API boş yanıt döndü (HTTP ${res.status})`)
        }
        
        data = JSON.parse(responseText)
        console.log('✅ PayTR API JSON parse başarılı:', data)
        console.log('🔍 PayTR Response Analizi:')
        console.log(`   success: ${data.success}`)
        console.log(`   status: ${data.status}`)
        console.log(`   token: ${data.token ? 'VAR' : 'YOK'}`)
        console.log(`   error: ${data.error || 'YOK'}`)
        console.log(`   reason: ${data.reason || 'YOK'}`)
        
      } catch (parseError) {
        console.error('❌ PayTR API JSON parse hatası:', parseError)
        throw new Error(`PayTR API yanıtı işlenemiyor. Lütfen daha sonra tekrar deneyin. (Hata: JSON parse)`);
      }
      
      if ((data.success || data.status === 'success') && data.token) {
        console.log('🎉 PayTR token başarılı:', data.token)
        const paytrUrl = `https://www.paytr.com/odeme/guvenli/${data.token}`
        console.log('🔗 PayTR URL:', paytrUrl)
        
        // İframe yerine yeni sekmede aç
        window.open(paytrUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
        

        
        // Kullanıcıya bilgi ver
        alert('PayTR ödeme sayfası yeni sekmede açıldı. Ödemenizi tamamladıktan sonra bu sayfaya geri dönebilirsiniz.')
      } else {
        console.error('❌ PayTR token başarısız:', data)
        
        // PayTR error mesajlarını user-friendly hale getir
        let errorMessage = 'PayTR ödeme sistemi geçici olarak kullanılamıyor'
        
        if (data.error) {
          // API'den gelen hata mesajını kontrol et
          if (typeof data.error === 'string' && data.error.includes('JSON')) {
            errorMessage = 'Ödeme sistemi geçici olarak kullanılamıyor. Lütfen havale yöntemi ile ödeme yapın.'
          } else if (typeof data.error === 'string' && data.error.includes('hash')) {
            errorMessage = 'Güvenlik doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin.'
          } else if (typeof data.error === 'string' && data.error.includes('merchant')) {
            errorMessage = 'Ödeme sistemi yapılandırma hatası. Lütfen havale yöntemi kullanın.'
          } else if (typeof data.error === 'string' && data.error.includes('payment_amount')) {
            errorMessage = 'Ödeme tutarı hatası. Lütfen sepetinizi kontrol edin.'
          } else if (typeof data.error === 'string' && data.error.includes('merchant_oid')) {
            errorMessage = 'Sipariş numarası hatası. Lütfen sayfayı yenileyin.'
          } else {
            errorMessage = `PayTR Hatası: ${typeof data.error === 'string' ? data.error : JSON.stringify(data.error)}`
          }
        } else if (data.reason) {
          // PayTR API'den gelen reason mesajını kullan
          errorMessage = `PayTR Hatası: ${typeof data.reason === 'string' ? data.reason : JSON.stringify(data.reason)}`
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('💥 PayTR payment error:', error)
      
      // User-friendly error message
      let userMessage = 'Ödeme sistemi geçici olarak kullanılamıyor. ';
      
      if (error instanceof Error) {
        if (error.message.includes('JSON') || error.message.includes('parse')) {
          userMessage += 'Lütfen havale yöntemi ile ödeme yapın veya daha sonra tekrar deneyin.';
        } else if (error.message.includes('fetch')) {
          userMessage += 'İnternet bağlantınızı kontrol edip tekrar deneyin.';
        } else {
          userMessage += error.message;
        }
      } else {
        userMessage += 'Lütfen havale yöntemi ile ödeme yapın.';
      }
      
      // Modern alert yerine daha güzel bir hata gösterimi
      if (confirm(`${userMessage}\n\nHavale yöntemi ile devam etmek ister misiniz?`)) {
        setSelectedPaymentMethod('bank-transfer');
      }
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Havale ile ödeme başlat
  const handleBankTransferPayment = async () => {
    // ✅ ZORUNLU: Sözleşmeleri kontrol et
    if (!validateAgreements()) {
      alert('Lütfen tüm sözleşmeleri okuyup kabul edin!')
      return
    }
    
    setIsPlacingOrder(true)
    try {
      // Önce siparişi oluştur
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color
        })),
        total: total,
        subtotal: subtotal,
        subtotalWithTax: subtotalWithTax,
        taxRate: TAX_RATE,
        taxAmount: taxAmount,
        shippingCost: getShippingCost(),
        shippingMethod: selectedCargoCompany || 'cargo',
        paymentMethod: 'BANK_TRANSFER',
        // Teslimat bilgileri
        guestName: delivery.name,
        guestSurname: delivery.surname,
        guestEmail: delivery.email,
        guestPhone: delivery.phone,
        // Adres bilgileri
        address: {
          title: delivery.addressTitle,
          city: delivery.city,
          district: delivery.district,
          neighborhood: delivery.neighborhood,
          address: delivery.address
        },
        // Fatura bilgileri (varsa)
        invoiceType: showInvoiceAddress ? invoice.invoiceType : null,
        tcKimlikNo: showInvoiceAddress ? invoice.tcKimlikNo : null,
        vergiNo: showInvoiceAddress ? invoice.vergiNo : null,
        vergiDairesi: showInvoiceAddress ? invoice.vergiDairesi : null,
        unvan: showInvoiceAddress ? invoice.unvan : null
      }

      // Siparişi oluştur
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const orderResult = await orderResponse.json()
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Sipariş oluşturulamadı')
      }

      const orderId = orderResult.order.id

      // Havale bildirimi gönder
      const transferData = {
        orderId: orderId,
        customerName: `${delivery.name} ${delivery.surname}`,
        customerEmail: delivery.email,
        customerPhone: delivery.phone,
        transferAmount: total,
        transferDate: bankTransferData.transferDate || new Date().toISOString().split('T')[0],
        transferNote: bankTransferData.transferNote || `Sipariş #${orderId}`
      }

      console.log('📤 Havale bildirimi gönderiliyor:', transferData)

      const transferResponse = await fetch('/api/payment/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData)
      })

      const transferResult = await transferResponse.json()
      
      if (transferResult.success) {
        // Başarılı havale bildirimi
        alert('Havale bildiriminiz başarıyla alındı! Banka bilgileri e-posta adresinize gönderildi.')
        router.push(`/order/${orderId}`)
      } else {
        throw new Error(transferResult.error || 'Havale bildirimi gönderilemedi')
      }
    } catch (error) {
      console.error('Bank transfer error:', error)
      alert('Havale bildirimi gönderilirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Stepper />

          {step === 1 && (
            <form onSubmit={handleDeliverySubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Teslimat Bilgileri</h2>
              
              {/* Kargo Seçimi */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kargo Seçimi</h3>
                
                {/* Gerçek Kargo Firmaları */}
                {delivery.city && delivery.district && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Kargo Firmaları</h4>
                      <button
                        type="button"
                        onClick={calculateCargoPrices}
                        disabled={isLoadingCargo}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {isLoadingCargo ? 'Hesaplanıyor...' : 'Fiyatları Güncelle'}
                      </button>
                    </div>
                    
                    {isLoadingCargo && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Kargo fiyatları hesaplanıyor...</p>
                      </div>
                    )}
                    
                    {cargoQuotes.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {cargoQuotes.map((quote) => (
                          <label
                            key={quote.companyId}
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedCargoCompany === quote.companyId
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="cargoCompany"
                              value={quote.companyId}
                              checked={selectedCargoCompany === quote.companyId}
                              onChange={(e) => setSelectedCargoCompany(e.target.value)}
                              className="sr-only"
                            />
                            <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full mr-3">
                              {selectedCargoCompany === quote.companyId && (
                                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-xs font-bold text-gray-600">
                                      {quote.companyName?.split(' ')[0]?.charAt(0) || 'K'}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{quote.companyName}</div>
                                    <div className="text-sm text-gray-500">{quote.estimatedDays} iş günü</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-semibold text-gray-900">{quote.price.toFixed(2)}₺</span>
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Debug Bilgileri */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-yellow-800 mb-2">🔍 Debug Bilgileri</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <div>📍 İl: {delivery.city || 'Boş'}</div>
                    <div>📍 İlçe: {delivery.district || 'Boş'}</div>
                    <div>🚚 Kargo Firmaları: {cargoQuotes.length} adet</div>
                    <div>✅ Seçili Kargo: {selectedCargoCompany || 'Yok'}</div>
                    <div>⏳ Loading: {isLoadingCargo ? 'Evet' : 'Hayır'}</div>
                    <div>📦 Ürün Sayısı: {items.length}</div>
                    <div>💰 Ara Toplam (KDV Hariç): {subtotal.toFixed(2)}₺</div>
                    <div>🧾 KDV (%{TAX_RATE * 100}): {taxAmount.toFixed(2)}₺</div>
                    <div>💳 Ara Toplam (KDV Dahil): {subtotalWithTax.toFixed(2)}₺</div>
                    <div>🎯 Kargo Ücreti: {getShippingCost().toFixed(2)}₺</div>
                    <div>🎁 Ücretsiz Kargo: {subtotal >= 2500 ? 'Evet (2500₺+)' : 'Hayır'}</div>
                    <div>📦 GENEL TOPLAM: {total.toFixed(2)}₺</div>
                  </div>
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={calculateCargoPrices}
                      disabled={!delivery.city || !delivery.district}
                      className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      🔄 Kargo Fiyatlarını Hesapla
                    </button>
                    <button
                      onClick={() => {
                        console.log('📊 Debug Bilgileri:');
                        console.log('- İl:', delivery.city);
                        console.log('- İlçe:', delivery.district);
                        console.log('- Kargo Firmaları:', cargoQuotes);
                        console.log('- Seçili Kargo:', selectedCargoCompany);
                        console.log('- Ürünler:', items);
                        console.log('- Ücretsiz Kargo:', subtotal >= 2500);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      📊 Console Log
                    </button>
                  </div>
                </div>

                {/* Gerçek Kargo Firmaları */}
                {cargoQuotes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">🚚 Kargo Firmaları</h4>
                    
                    {/* Ücretsiz Kargo Bilgisi */}
                    {subtotal >= 2500 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center">
                          <span className="text-green-600 text-xl mr-2">🎁</span>
                          <div>
                            <div className="font-medium text-green-800">Ücretsiz Kargo!</div>
                            <div className="text-sm text-green-700">
                              2500₺ üzeri alışverişinizde kargo ücreti alınmaz.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-3">
                      {cargoQuotes.length} kargo firmasından birini seçin:
                    </div>
                    {cargoQuotes.map((quote) => {
                      const isSelected = selectedCargoCompany === quote.companyId
                      return (
                        <label
                          key={quote.companyId}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cargo"
                            value={quote.companyId}
                            checked={isSelected}
                            onChange={(e) => {
                              setSelectedCargoCompany(e.target.value)
                            }}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full mr-3">
                            {isSelected && (
                              <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-xl mr-2">🚚</span>
                                <div>
                                  <div className="font-medium text-gray-900">{quote.companyName}</div>
                                  <div className="text-sm text-gray-500">{quote.estimatedDays} iş günü</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-gray-900">{quote.price.toFixed(2)}₺</span>
                              </div>
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}

                {/* Kargo Seçimi Bilgisi */}
                {!delivery.city || !delivery.district ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-blue-600 text-xl mr-2">ℹ️</span>
                      <div>
                        <div className="font-medium text-blue-800">Kargo Fiyatları</div>
                        <div className="text-sm text-blue-700">
                          İl ve ilçe bilgilerinizi doldurduktan sonra gerçek kargo firmaları ve fiyatları görünecektir.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : cargoQuotes.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-600 text-xl mr-2">⏳</span>
                      <div>
                        <div className="font-medium text-yellow-800">Kargo Fiyatları Hesaplanıyor</div>
                        <div className="text-sm text-yellow-700">
                          Kargo firmaları ve fiyatları yükleniyor...
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {errors.shipping && <span className="text-xs text-red-500">{errors.shipping}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad</label>
                  <input name="name" value={delivery.name} onChange={handleDeliveryChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Soyad</label>
                  <input name="surname" value={delivery.surname} onChange={handleDeliveryChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  {errors.surname && <span className="text-xs text-red-500">{errors.surname}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-posta</label>
                  <input name="email" value={delivery.email} onChange={handleDeliveryChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <input name="phone" value={delivery.phone} onChange={handleDeliveryChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adres Başlığı</label>
                  <input name="addressTitle" value={delivery.addressTitle} onChange={handleDeliveryChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  {errors.addressTitle && <span className="text-xs text-red-500">{errors.addressTitle}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">İl</label>
                  <input name="city" value={delivery.city} onChange={handleDeliveryChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  {errors.city && <span className="text-xs text-red-500">{errors.city}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">İlçe</label>
                  <input name="district" value={delivery.district} onChange={handleDeliveryChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  {errors.district && <span className="text-xs text-red-500">{errors.district}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mahalle</label>
                  <input name="neighborhood" value={delivery.neighborhood} onChange={handleDeliveryChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  {errors.neighborhood && <span className="text-xs text-red-500">{errors.neighborhood}</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Açık Adres</label>
                  <textarea name="address" value={delivery.address} onChange={handleDeliveryChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" rows={3} />
                  {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                </div>
              </div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="showInvoiceAddress"
                  checked={showInvoiceAddress}
                  onChange={e => setShowInvoiceAddress(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showInvoiceAddress" className="text-sm text-gray-700">Fatura adresim teslimat adresimden farklı</label>
              </div>
              {showInvoiceAddress && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-4">Fatura Adresi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fatura Tipi</label>
                      <select name="invoiceType" value={invoice.invoiceType} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="BIREYSEL">Bireysel</option>
                        <option value="KURUMSAL">Kurumsal</option>
                      </select>
                      {invoiceErrors.invoiceType && <span className="text-xs text-red-500">{invoiceErrors.invoiceType}</span>}
                    </div>
                    {invoice.invoiceType === 'BIREYSEL' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">TC Kimlik No</label>
                        <input name="tcKimlikNo" value={invoice.tcKimlikNo} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" maxLength={11} />
                        {invoiceErrors.tcKimlikNo && <span className="text-xs text-red-500">{invoiceErrors.tcKimlikNo}</span>}
                      </div>
                    )}
                    {invoice.invoiceType === 'KURUMSAL' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Vergi No</label>
                          <input name="vergiNo" value={invoice.vergiNo} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" maxLength={10} />
                          {invoiceErrors.vergiNo && <span className="text-xs text-red-500">{invoiceErrors.vergiNo}</span>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Vergi Dairesi</label>
                          <input name="vergiDairesi" value={invoice.vergiDairesi} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                          {invoiceErrors.vergiDairesi && <span className="text-xs text-red-500">{invoiceErrors.vergiDairesi}</span>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Şirket Unvanı</label>
                          <input name="unvan" value={invoice.unvan} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                          {invoiceErrors.unvan && <span className="text-xs text-red-500">{invoiceErrors.unvan}</span>}
                        </div>
                      </>
                    )}
                    {/* Diğer fatura adresi alanları */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ad</label>
                      <input name="name" value={invoice.name} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      {invoiceErrors.name && <span className="text-xs text-red-500">{invoiceErrors.name}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Soyad</label>
                      <input name="surname" value={invoice.surname} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      {invoiceErrors.surname && <span className="text-xs text-red-500">{invoiceErrors.surname}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">E-posta</label>
                      <input name="email" value={invoice.email} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      {invoiceErrors.email && <span className="text-xs text-red-500">{invoiceErrors.email}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telefon</label>
                      <input name="phone" value={invoice.phone} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      {invoiceErrors.phone && <span className="text-xs text-red-500">{invoiceErrors.phone}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Adres Başlığı</label>
                      <input name="addressTitle" value={invoice.addressTitle} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      {invoiceErrors.addressTitle && <span className="text-xs text-red-500">{invoiceErrors.addressTitle}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">İl</label>
                      <input name="city" value={invoice.city} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      {invoiceErrors.city && <span className="text-xs text-red-500">{invoiceErrors.city}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">İlçe</label>
                      <input name="district" value={invoice.district} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      {invoiceErrors.district && <span className="text-xs text-red-500">{invoiceErrors.district}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mahalle</label>
                      <input name="neighborhood" value={invoice.neighborhood} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      {invoiceErrors.neighborhood && <span className="text-xs text-red-500">{invoiceErrors.neighborhood}</span>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Açık Adres</label>
                      <textarea name="address" value={invoice.address} onChange={handleInvoiceChange} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" rows={3} />
                      {invoiceErrors.address && <span className="text-xs text-red-500">{invoiceErrors.address}</span>}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button type="submit" className="btn-primary px-8 py-3 text-lg">Kaydet ve Devam Et</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ödeme Yöntemi Seçimi</h2>
              <p className="text-gray-600 mb-6">Güvenli ödeme için 2 seçeneğiniz bulunmaktadır:</p>
              
                              {/* Ödeme Yöntemi Seçimi */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ödeme Yöntemi Seçin</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    Aşağıdaki 2 güvenli ödeme yönteminden birini seçin:
                  </div>
                
                {/* PayTR Seçeneği */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPaymentMethod === 'paytr' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paytr"
                    checked={selectedPaymentMethod === 'paytr'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as 'paytr' | 'bank-transfer')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full mr-3">
                    {selectedPaymentMethod === 'paytr' && (
                      <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💳</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Kredi Kartı / Taksitli Ödeme</h4>
                          <p className="text-sm text-gray-600">PayTR ile güvenli ödeme</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Komisyon</div>
                        <div className="text-sm font-medium text-gray-900">%2.5</div>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Havale Seçeneği */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPaymentMethod === 'bank-transfer' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank-transfer"
                    checked={selectedPaymentMethod === 'bank-transfer'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as 'paytr' | 'bank-transfer')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full mr-3">
                    {selectedPaymentMethod === 'bank-transfer' && (
                      <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏦</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Havale / EFT</h4>
                          <p className="text-sm text-gray-600">Direkt işletme IBAN'ına havale</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Komisyon</div>
                        <div className="text-sm font-medium text-green-600">ÜCRETSİZ</div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Havale Formu */}
              {selectedPaymentMethod === 'bank-transfer' && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Havale Bilgileri</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Havale Tarihi
                      </label>
                      <input
                        type="date"
                        value={bankTransferData.transferDate}
                        onChange={(e) => setBankTransferData({...bankTransferData, transferDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Havale Açıklaması (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        placeholder="Sipariş numarası veya açıklama"
                        value={bankTransferData.transferNote}
                        onChange={(e) => setBankTransferData({...bankTransferData, transferNote: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Not:</strong> Havale yaptıktan sonra siparişiniz 1-2 iş günü içinde onaylanacaktır.
                    </p>
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sipariş Özeti</h2>
              {/* Ürünler */}
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">
                        {item.size && `Beden: ${item.size}`}
                        {item.color && item.size && ' • '}
                        {item.color && `Renk: ${item.color}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 text-sm">₺{(item.product.price * item.quantity).toFixed(2)}</span>
                      <div className="text-xs text-gray-500">x{item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Teslimat Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Teslimat Bilgileri</h3>
                <div className="text-sm text-gray-700">
                  <div>{delivery.name} {delivery.surname} - {delivery.phone}</div>
                  <div>{delivery.email}</div>
                  <div>{delivery.addressTitle} / {delivery.city} / {delivery.district} / {delivery.neighborhood}</div>
                  <div>{delivery.address}</div>
                </div>
              </div>
              {showInvoiceAddress && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-dashed border-primary-200">
                  <h3 className="font-semibold text-primary-700 mb-2 text-sm">Fatura Adresi</h3>
                  <div className="text-sm text-gray-700">
                    <div>{invoice.name} {invoice.surname} - {invoice.phone}</div>
                    <div>{invoice.email}</div>
                    <div>{invoice.addressTitle} / {invoice.city} / {invoice.district} / {invoice.neighborhood}</div>
                    <div>{invoice.address}</div>
                  </div>
                </div>
              )}
              {/* Toplam */}
              <div className="flex flex-col gap-2 border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Ara Toplam (KDV Hariç):</span>
                  <span className="font-bold text-md text-gray-900">₺{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">KDV (%{TAX_RATE * 100}):</span>
                  <span className="font-bold text-md text-gray-900">₺{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Ara Toplam (KDV Dahil):</span>
                  <span className="font-bold text-md text-gray-900">₺{subtotalWithTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Kargo:</span>
                  <span className="font-bold text-md text-gray-900">₺{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-gray-900">GENEL TOPLAM:</span>
                  <span className="font-bold text-lg text-primary-600">₺{total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* ✅ ZORUNLU: PayTR Uyumluluğu İçin Sözleşme Kabulleri */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Sözleşme Kabulleri (Zorunlu)
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.distanceSales}
                      onChange={() => handleAgreementChange('distanceSales')}
                      className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-primary-600 hover:underline font-medium">
                        Mesafeli Satış Sözleşmesini
                      </a> okudum ve kabul ediyorum
                    </span>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.returnPolicy}
                      onChange={() => handleAgreementChange('returnPolicy')}
                      className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      <a href="/iptal-iade-politikasi" target="_blank" className="text-primary-600 hover:underline font-medium">
                        İptal-İade Politikasını
                      </a> okudum ve kabul ediyorum
                    </span>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.deliveryInfo}
                      onChange={() => handleAgreementChange('deliveryInfo')}
                      className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      <a href="/teslimat-bilgileri" target="_blank" className="text-primary-600 hover:underline font-medium">
                        Teslimat Bilgilerini
                      </a> okudum ve kabul ediyorum
                    </span>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.termsConditions}
                      onChange={() => handleAgreementChange('termsConditions')}
                      className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      <a href="/terms" target="_blank" className="text-primary-600 hover:underline font-medium">
                        Kullanım Şartlarını
                      </a> okudum ve kabul ediyorum
                    </span>
                  </label>
                </div>
                
                {/* Hata mesajları */}
                {agreementErrors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ul className="text-sm text-red-700 space-y-1">
                      {agreementErrors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Siparişi Tamamla */}
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary px-8 py-3 text-lg">Geri</button>
                <button
                  type="button"
                  onClick={selectedPaymentMethod === 'paytr' ? handlePaytrPayment : handleBankTransferPayment}
                  className={`px-8 py-3 text-lg flex items-center justify-center rounded-lg font-semibold transition-all ${
                    isPlacingOrder || !Object.values(agreements).every(Boolean)
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'btn-primary hover:scale-105'
                  }`}
                  disabled={isPlacingOrder || !Object.values(agreements).every(Boolean)}
                >
                  {isPlacingOrder ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  ) : null}
                  {selectedPaymentMethod === 'paytr' ? 'Ödemeyi Tamamla' : 'Havale Bildirimi Gönder'}
                </button>
              </div>
            </div>
          )}


        </div>
      </main>
      <Footer />
    </>
  )
}
