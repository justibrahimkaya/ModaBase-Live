'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/components/CartContext'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 1, label: 'Teslimat Bilgileri' },
  { id: 2, label: 'Ödeme Bilgileri' },
  { id: 3, label: 'Sipariş Özeti' }
]

// Kargo seçenekleri
const shippingOptions = [
  {
    id: 'standard',
    name: 'Standart Kargo',
    price: 49.90,
    description: '1-3 iş günü',
    icon: '🚚'
  },
  {
    id: 'express',
    name: 'Ekspres Kargo',
    price: 99.90,
    description: 'Ertesi gün teslimat',
    icon: '⚡'
  },
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
  const { items, getTotal, clearCart, loading } = useCart()
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
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
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
  const router = useRouter();

  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push('/cart');
    }
  }, [loading, items, router]);

  // Sipariş başarılıysa otomatik yönlendirme
  useEffect(() => {
    if (orderSuccess && orderNumber) {
      const timer = setTimeout(() => {
        router.push(`/order/${orderNumber}`)
      }, 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [orderSuccess, orderNumber, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Sepet yükleniyor...</div>;
  }
  if (items.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Yönlendiriliyor...</div>;
  }

  // Kargo ücretini hesapla
  const getShippingCost = () => {
    const subtotal = getTotal()
    const selectedOption = shippingOptions.find(option => option.id === selectedShipping)
    
    if (selectedOption?.id === 'free' && subtotal >= 2500) {
      return 0
    }
    
    return selectedOption?.price || 49.90
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

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true)
    try {
      // Teslimat adresini kaydet (veya ileride kullanıcıya bağla)
      const deliveryAddressRes = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...delivery,
          type: 'DELIVERY'
        })
      })
      const deliveryAddress = await deliveryAddressRes.json()
      let invoiceAddress = null
      if (showInvoiceAddress) {
        const invoiceAddressRes = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...invoice,
            type: 'INVOICE'
          })
        })
        invoiceAddress = await invoiceAddressRes.json()
      }
      // Sipariş ürünlerini hazırla
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color
      }))
      // Siparişi backend'e kaydet
      const orderBody: any = {
        addressId: deliveryAddress.id,
        invoiceAddressId: invoiceAddress ? invoiceAddress.id : null,
        shippingMethod: selectedShipping,
        paymentMethod: 'CREDIT_CARD',
        discount,
        shippingCost: getShippingCost(),
        note: '',
        items: orderItems,
        total: getTotal() - discount + getShippingCost(),
        // E-fatura snapshot alanları
        invoiceType: invoice.invoiceType,
        tcKimlikNo: invoice.tcKimlikNo,
        vergiNo: invoice.vergiNo,
        vergiDairesi: invoice.vergiDairesi,
        unvan: invoice.unvan
      }
      // Eğer kullanıcı giriş yapmamışsa guest bilgilerini ekle
      if (!window.localStorage.getItem('session_user')) {
        orderBody.guestName = delivery.name
        orderBody.guestSurname = delivery.surname
        orderBody.guestEmail = delivery.email
        orderBody.guestPhone = delivery.phone
      }
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody)
      })
      const order = await orderRes.json()
      setOrderNumber(order.id)
      setOrderSuccess(true)
      clearCart()
    } catch (error) {
      alert('Sipariş oluşturulurken bir hata oluştu!')
    } finally {
      setIsPlacingOrder(false)
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
      // Sipariş tutarı ve müşteri bilgileriyle backend'e istek at
      const res = await fetch('/api/paytr/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total * 100, // PayTR kuruş cinsinden ister
          email: delivery.email,
          user_ip: '127.0.0.1', // Test için sabit
          user_name: delivery.name + ' ' + delivery.surname,
          user_address: delivery.address,
          user_phone: delivery.phone
        })
      })
      const data = await res.json()
      if (data.success && data.token) {
        setPaytrUrl(data.paytr_url)
        setShowPaytrIframe(true)
      } else {
        alert('PayTR ödeme başlatılamadı!')
      }
    } catch (error) {
      alert('PayTR ödeme başlatılırken hata oluştu!')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // PayTR iframe ödeme başarılı simülasyonu
  const handlePaytrSuccess = async () => {
    setShowPaytrIframe(false)
    await handlePlaceOrder()
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
                <div className="space-y-3">
                  {shippingOptions.map((option) => {
                    const isFree = option.id === 'free' && subtotal >= 2500
                    const isSelected = selectedShipping === option.id
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
                          checked={selectedShipping === option.id}
                          onChange={(e) => setSelectedShipping(e.target.value)}
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

          {step === 3 && !orderSuccess && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
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
                  onClick={handlePaytrPayment}
                  className="btn-primary px-8 py-3 text-lg flex items-center justify-center"
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  ) : null}
                  Ödemeyi Tamamla
                </button>
              </div>
            </div>
          )}

          {/* PayTR Iframe Modal (Test Modu) */}
          {showPaytrIframe && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">PayTR Ödeme (Test Modu)</h2>
                <iframe
                  ref={paytrIframeRef}
                  src={paytrUrl || ''}
                  title="PayTR Iframe"
                  className="w-full h-64 border rounded mb-4"
                />
                <button
                  onClick={handlePaytrSuccess}
                  className="btn-primary w-full"
                >
                  Ödeme Başarılı (Simülasyon)
                </button>
                <button
                  onClick={() => setShowPaytrIframe(false)}
                  className="btn-secondary w-full mt-2"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Sipariş Başarılı Ekranı */}
          <div className="bg-white rounded-lg shadow-lg border border-green-200 p-8 flex flex-col items-center text-center animate-fade-in">
            <svg className="h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" /></svg>
            <h2 className="text-3xl font-bold text-green-700 mb-2">Siparişiniz Alındı!</h2>
            <p className="text-lg text-gray-700 mb-4">Sipariş numaranız: <span className="font-mono text-primary-600">{orderNumber}</span></p>
            <p className="text-gray-600 mb-6">Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.<br />Teşekkür ederiz!</p>
            {/* Guest için hesap oluşturma teklifi */}
            <GuestRegisterForm email={delivery.email} show={orderSuccess && !window.localStorage.getItem('session_user')} />
            <a href={`/order/${orderNumber}`} className="btn-primary px-8 py-3 text-lg mt-4">Sipariş Detayını Görüntüle</a>
            <a href="/" className="btn-secondary px-8 py-3 text-lg mt-2">Ana Sayfaya Dön</a>
            <p className="text-xs text-gray-400 mt-4">3 saniye içinde otomatik olarak sipariş detayına yönlendirileceksiniz.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// GuestRegisterForm bileşeni
type GuestRegisterFormProps = { email: string; show: boolean };
function GuestRegisterForm({ email, show }: GuestRegisterFormProps) {
  if (!show) return null;
  
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Kayıt başarısız')
      }
      setSuccess(true)
      // Otomatik login için sayfı yenile
      setTimeout(() => window.location.reload(), 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Hesap Oluşturun</h3>
      <p className="text-sm text-blue-800 mb-4">Siparişinizi ve geçmişinizi kolayca takip etmek için hesabınızı oluşturun.</p>
      <div className="mb-3 text-left">
        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
        <input type="email" value={email} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
      </div>
      <div className="mb-3 text-left">
        <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required minLength={6} />
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">Hesabınız oluşturuldu! Giriş yapılıyor...</div>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
      </button>
    </form>
  )
}
