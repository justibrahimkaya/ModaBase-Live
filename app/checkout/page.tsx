'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/components/CartContext'
import { useRouter } from 'next/navigation'
import { ShippingQuote } from '@/lib/shippingService'

const steps = [
  { id: 1, label: 'Teslimat Bilgileri' },
  { id: 2, label: 'Ödeme Bilgileri' },
  { id: 3, label: 'Sipariş Özeti' }
]

// Kargo seçenekleri - Dinamik olacak
const shippingOptions = [
  {
    id: 'free',
    name: 'Ücretsiz Kargo',
    price: 0,
    description: '2500₺ üzeri alışverişlerde',
    icon: '🎁'
  }
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
  const [selectedShipping, setSelectedShipping] = useState('standard')
  const [selectedCargoCompany, setSelectedCargoCompany] = useState<string>('')
  const [cargoQuotes, setCargoQuotes] = useState<ShippingQuote[]>([])
  const [isLoadingCargo, setIsLoadingCargo] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponStatus, setCouponStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [discount, setDiscount] = useState(0)
  const validCoupons: Record<string, number> = {
    "MODA10": 0.10, // %10 indirim
    "MODA20": 0.20  // %20 indirim
  }
  const [showPaytrIframe, setShowPaytrIframe] = useState(false)
  const [paytrUrl, setPaytrUrl] = useState<string | null>(null)
  const paytrIframeRef = useRef<HTMLIFrameElement>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paytr' | 'bank-transfer'>('paytr')
  const [bankTransferData, setBankTransferData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    transferDate: '',
    transferNote: ''
  })
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

  // Kargo ücretini hesapla
  const getShippingCost = () => {
    const subtotal = getTotal()
    
    // Ücretsiz kargo kontrolü
    if (subtotal >= 2500) return 0
    
    // Gerçek kargo firması seçilmişse
    if (selectedCargoCompany && cargoQuotes.length > 0) {
      const selectedQuote = cargoQuotes.find(q => q.companyId === selectedCargoCompany)
      return selectedQuote ? selectedQuote.price : 0
    }
    
    // Standart kargo seçenekleri
    const selectedOption = shippingOptions.find(option => option.id === selectedShipping)
    return selectedOption?.price || 49.90
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
    if (!selectedShipping) newErrors.shipping = 'Kargo seçimi zorunlu'
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

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase()
    if (validCoupons[code]) {
      setDiscount(validCoupons[code])
      setCouponStatus('success')
    } else {
      setDiscount(0)
      setCouponStatus('error')
    }
  }

  const subtotal = getTotal()
  const shippingCost = getShippingCost()
  const discountedSubtotal = subtotal * (1 - discount)
  const total = discountedSubtotal + shippingCost

  // PayTR ile ödeme başlat
  const handlePaytrPayment = async () => {
    setIsPlacingOrder(true)
    try {
      // Önce siparişi oluştur
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color
        })),
        total: total,
        discount: discount,
        shippingCost: getShippingCost(),
        shippingMethod: selectedShipping,
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

      // PayTR için sepet bilgilerini hazırla
      const userBasket = items.map(item => 
        `${item.product.name}~${item.size || 'Tek Beden'}~${item.color || 'Tek Renk'}~${item.product.price}~${item.quantity}`
      ).join('|')

      // PayTR token isteği
      const paytrData = {
        merchant_oid: orderId,
        amount: Math.round(total * 100), // PayTR kuruş cinsinden ister
        email: delivery.email,
        user_ip: '127.0.0.1', // Gerçek IP alınacak
        user_name: delivery.name + ' ' + delivery.surname,
        user_address: `${delivery.city}, ${delivery.district}, ${delivery.address}`,
        user_phone: delivery.phone,
        user_basket: userBasket,
        no_installment: '0', // Taksit seçeneği
        max_installment: '12', // Maksimum taksit
        currency: 'TL',
        test_mode: '1', // Test modu
        merchant_ok_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.modabase.com.tr'}/order/${orderId}`,
        merchant_fail_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.modabase.com.tr'}/order/${orderId}?status=failed`,
        timeout_limit: '30'
      }

      const res = await fetch('/api/paytr/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paytrData)
      })

      const data = await res.json()
      
      if (data.success && data.token) {
        setPaytrUrl(`${data.paytr_url}?token=${data.token}`)
        setShowPaytrIframe(true)
      } else {
        throw new Error(data.error || 'PayTR ödeme başlatılamadı')
      }
    } catch (error) {
      console.error('PayTR payment error:', error)
      alert('PayTR ödeme başlatılırken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Havale ile ödeme başlat
  const handleBankTransferPayment = async () => {
    setIsPlacingOrder(true)
    try {
      // Önce siparişi oluştur
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color
        })),
        total: total,
        discount: discount,
        shippingCost: getShippingCost(),
        shippingMethod: selectedShipping,
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
                
                {/* Gerçek Kargo Firmaları */}
                {cargoQuotes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">🚚 Kargo Firmaları</h4>
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
                              setSelectedShipping('')
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

                {/* Ücretsiz Kargo Seçeneği */}
                <div className="space-y-3">
                  {shippingOptions.map((option) => {
                    const isFree = option.id === 'free' && subtotal >= 2500
                    const isSelected = selectedShipping === option.id && !selectedCargoCompany
                    return (
                      <label
                        key={option.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id && !selectedCargoCompany}
                          onChange={(e) => {
                            setSelectedShipping(e.target.value)
                            setSelectedCargoCompany('')
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
                              <span className="text-xl mr-2">{option.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900">{option.name}</div>
                                <div className="text-sm text-gray-500">{option.description}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              {isFree ? (
                                <span className="text-green-600 font-semibold">Ücretsiz</span>
                              ) : (
                                <span className="font-semibold text-gray-900">{option.price.toFixed(2)}₺</span>
                              )}
                            </div>
                          </div>
                          {option.id === 'free' && subtotal < 2500 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {2500 - subtotal}₺ daha alışveriş yapın, ücretsiz kargo kazanın
                            </div>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
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
              {/* Kupon Alanı */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">İndirim Kuponu</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value); setCouponStatus('idle') }}
                    placeholder="Kupon kodunuz (örn: MODA10)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Uygula
                  </button>
                </div>
                {couponStatus === 'success' && (
                  <span className="text-green-600 text-sm mt-2 block">Kupon başarıyla uygulandı! %{discount * 100} indirim</span>
                )}
                {couponStatus === 'error' && (
                  <span className="text-red-600 text-sm mt-2 block">Geçersiz kupon kodu</span>
                )}
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ödeme Bilgileri</h2>
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-lg text-gray-700 mb-6">Ödeme işleminiz PayTR ile güvenli şekilde alınacaktır.</p>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ödeme Yöntemi Seçimi</h2>
              
              {/* Ödeme Yöntemi Seçimi */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Ödeme Yöntemi Seçin</h3>
                
                {/* PayTR Seçeneği */}
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
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
                      <div>
                        <h4 className="font-semibold text-gray-900">Kredi Kartı / Taksitli Ödeme</h4>
                        <p className="text-sm text-gray-600">PayTR ile güvenli ödeme</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Komisyon</div>
                        <div className="text-sm font-medium text-gray-900">%2.5</div>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Havale Seçeneği */}
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
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
                      <div>
                        <h4 className="font-semibold text-gray-900">Havale / EFT</h4>
                        <p className="text-sm text-gray-600">Direkt işletme IBAN'ına havale</p>
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
                  <span className="font-semibold text-gray-900">Ara Toplam:</span>
                  <span className="font-bold text-md text-gray-900">₺{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-700">İndirim (%{discount * 100}):</span>
                    <span className="font-bold text-md text-green-700">-₺{(subtotal * discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Kargo:</span>
                  <span className="font-bold text-md text-gray-900">₺{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Toplam Tutar:</span>
                  <span className="font-bold text-lg text-primary-600">₺{total.toFixed(2)}</span>
                </div>
              </div>
              {/* Siparişi Tamamla */}
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary px-8 py-3 text-lg">Geri</button>
                <button
                  type="button"
                  onClick={selectedPaymentMethod === 'paytr' ? handlePaytrPayment : handleBankTransferPayment}
                  className="btn-primary px-8 py-3 text-lg flex items-center justify-center"
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  ) : null}
                  {selectedPaymentMethod === 'paytr' ? 'Ödemeyi Tamamla' : 'Havale Bildirimi Gönder'}
                </button>
              </div>
            </div>
          )}

          {/* PayTR Iframe Modal */}
          {showPaytrIframe && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full h-5/6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">PayTR Güvenli Ödeme</h2>
                  <button
                    onClick={() => setShowPaytrIframe(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <iframe
                  ref={paytrIframeRef}
                  src={paytrUrl || ''}
                  title="PayTR Güvenli Ödeme"
                  className="w-full h-full border rounded"
                  allow="payment"
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
