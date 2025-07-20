'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Beklemede' },
  { value: 'CONFIRMED', label: 'Onaylandı' },
  { value: 'SHIPPED', label: 'Kargoda' },
  { value: 'DELIVERED', label: 'Teslim Edildi' }
]

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippingCompany, setShippingCompany] = useState('')
  const [shippingTrackingUrl, setShippingTrackingUrl] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        setStatus(data.status)
        setTrackingNumber(data.trackingNumber || '')
        setShippingCompany(data.shippingCompany || '')
        setShippingTrackingUrl(data.shippingTrackingUrl || '')
        setAdminNotes(data.adminNotes || '')
      } else {
        setError('Sipariş bulunamadı.')
      }
    } catch (err) {
      setError('Sipariş yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          trackingNumber, 
          shippingCompany,
          shippingTrackingUrl,
          adminNotes 
        })
      })
      if (!response.ok) {
        throw new Error('Sipariş güncellenemedi.')
      }
      setSuccess(true)
      fetchOrder()
    } catch (err) {
      setError('Sipariş güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertTriangle className="w-8 h-8 mb-2" />
        {error}
        <button onClick={() => router.back()} className="mt-4 text-primary-600 hover:underline">Geri Dön</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-primary-600 hover:underline mb-2">
        <ArrowLeft className="w-5 h-5" /> Siparişlere Dön
      </button>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sipariş Detayı</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Sipariş No</div>
            <div className="font-mono text-lg">#{order.id.slice(-8)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Durum</div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
              order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {STATUS_OPTIONS.find(opt => opt.value === order.status)?.label || order.status}
            </span>
          </div>
          <div>
            <div className="text-sm text-gray-500">Müşteri</div>
            <div className="font-medium">{order.user?.name} {order.user?.surname}</div>
            <div className="text-xs text-gray-500">{order.user?.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tutar</div>
            <div className="font-bold text-lg">₺{order.total.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Adres</div>
            <div className="text-xs text-gray-700">{order.address?.title} - {order.address?.city}, {order.address?.district}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Oluşturulma</div>
            <div className="text-xs text-gray-700">{new Date(order.createdAt).toLocaleString('tr-TR')}</div>
          </div>
          {order.trackingNumber && (
            <div>
              <div className="text-sm text-gray-500">Kargo Takip</div>
              <div className="text-xs text-gray-700">
                {order.shippingCompany && <span className="font-medium">{order.shippingCompany}</span>}
                {order.trackingNumber && <span className="ml-2">{order.trackingNumber}</span>}
                {order.shippingTrackingUrl && (
                  <a 
                    href={order.shippingTrackingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Takip Et →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📦 Sipariş Durumu Yönetimi</h3>
          <p className="text-sm text-blue-700 mb-4">
            Sipariş onayından teslimat sürecine kadar tüm aşamaları burada yönetebilirsiniz.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {STATUS_OPTIONS.map((statusOption, index) => (
              <div key={statusOption.value} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2 ${
                  STATUS_OPTIONS.findIndex(s => s.value === status) >= index 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-sm font-medium ${
                  STATUS_OPTIONS.findIndex(s => s.value === status) >= index 
                    ? 'text-green-700' 
                    : 'text-gray-500'
                }`}>
                  {statusOption.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleUpdate}>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumu Güncelleme</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sipariş Durumu</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                {status === 'PENDING' && '⏳ Sipariş onay bekliyor - müşteri ödeme yaptı'}
                {status === 'CONFIRMED' && '✅ Sipariş onaylandı - kargo için hazırlanıyor'}
                {status === 'SHIPPED' && '🚚 Sipariş kargoya verildi - müşteri bilgilendirildi'}
                {status === 'DELIVERED' && '🎉 Sipariş başarıyla teslim edildi'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚚 Kargo Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kargo Takip Numarası</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: 123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kargo Firması</label>
                <select
                  value={shippingCompany}
                  onChange={e => setShippingCompany(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Firma Seçin</option>
                  <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                  <option value="Aras Kargo">Aras Kargo</option>
                  <option value="MNG Kargo">MNG Kargo</option>
                  <option value="PTT Kargo">PTT Kargo</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Kargo Takip URL</label>
              <input
                type="url"
                value={shippingTrackingUrl}
                onChange={e => setShippingTrackingUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://kargo.example.com/takip/123456"
              />
              <p className="mt-2 text-xs text-gray-500">
                Müşteri bu linke tıklayarak kargo durumunu takip edebilecek
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Admin Notları</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Siparişle İlgili Notlar</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Sipariş ile ilgili özel notlar, müşteri talepleri, önemli bilgiler..."
              />
              <p className="mt-2 text-xs text-gray-500">
                Bu notlar sadece admin panelinde görünür, müşteri göremez
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Değişiklikleri Kaydet</h3>
                <p className="text-sm text-gray-600">Sipariş bilgilerini güncellemek için kaydet butonuna tıklayın</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Değişiklikleri Kaydet</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Success/Error Messages */}
            <div className="mt-4">
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-700 font-medium">Başarıyla güncellendi!</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border mb-6">
        <h3 className="text-md font-semibold text-primary-700 mb-2">Fatura Bilgileri</h3>
        {order.invoiceType === 'KURUMSAL' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <div><span className="font-medium">Fatura Tipi:</span> Kurumsal</div>
            <div><span className="font-medium">Vergi No:</span> {order.vergiNo || '-'}</div>
            <div><span className="font-medium">Vergi Dairesi:</span> {order.vergiDairesi || '-'}</div>
            <div><span className="font-medium">Şirket Unvanı:</span> {order.unvan || '-'}</div>
            <div><span className="font-medium">Ad Soyad:</span> {order.user?.name} {order.user?.surname}</div>
            <div><span className="font-medium">E-posta:</span> {order.user?.email}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <div><span className="font-medium">Fatura Tipi:</span> Bireysel</div>
            <div><span className="font-medium">TC Kimlik No:</span> {order.tcKimlikNo || '-'}</div>
            <div><span className="font-medium">Ad Soyad:</span> {order.user?.name} {order.user?.surname}</div>
            <div><span className="font-medium">E-posta:</span> {order.user?.email}</div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sipariş Ürünleri</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adet</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Varyant</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.product?.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₺{item.price.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.size || '-'} / {item.color || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
