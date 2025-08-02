'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Edit, Trash2, Home, Building, Check, Shield, Star, Crown, Mail, Phone, User, X, Save, ArrowLeft } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Address {
  id: string
  title: string
  name: string
  surname: string
  email: string
  phone: string
  city: string
  district: string
  neighborhood: string
  address: string
  type: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    surname: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    address: '',
    type: 'DELIVERY',
    isDefault: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses')
      if (!response.ok) {
        throw new Error('Adresler alınamadı')
      }
      const data = await response.json()
      setAddresses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAddress 
        ? `/api/addresses/${editingAddress.id}` 
        : '/api/addresses'
      const method = editingAddress ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Adres kaydedilemedi')
      }

      await fetchAddresses()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      title: address.title,
      name: address.name,
      surname: address.surname,
      email: address.email,
      phone: address.phone,
      city: address.city,
      district: address.district,
      neighborhood: address.neighborhood,
      address: address.address,
      type: address.type,
      isDefault: address.isDefault
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Adres silinemedi')
      }

      await fetchAddresses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingAddress(null)
    setFormData({
      title: '',
      name: '',
      surname: '',
      email: '',
      phone: '',
      city: '',
      district: '',
      neighborhood: '',
      address: '',
      type: 'DELIVERY',
      isDefault: false
    })
  }

  const getAddressIcon = (type: string) => {
    if (type === 'DELIVERY') {
      return <Home className="w-5 h-5 text-blue-600" />
    }
    return <Building className="w-5 h-5 text-purple-600" />
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-lg font-medium">Adresler yükleniyor...</p>
              <div className="mt-4 flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-pink-400 to-red-500 rounded-full blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-25 animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse delay-3000"></div>
        </div>

        <div className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li><a href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</a></li>
                <li>/</li>
                <li><a href="/profile" className="hover:text-blue-600 transition-colors">Profil</a></li>
                <li>/</li>
                <li className="text-gray-900 font-medium">Adres Yönetimi</li>
              </ol>
            </nav>

            {/* Premium Feature Badge */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Güvenli Adres Yönetimi</span>
                <div className="ml-2 flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-300 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                    Adres Yönetimi
                  </h1>
                  <p className="text-gray-600">Teslimat ve fatura adreslerinizi yönetin</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-500">256-bit SSL Güvenli</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5" />
                    <span>Yeni Adres Ekle</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-200 p-6 animate-shake">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Hata Oluştu</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Address Form */}
            {showForm && (
              <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform animate-slideIn">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {editingAddress ? <Edit className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                      </h2>
                      <p className="text-gray-600">Adres bilgilerinizi eksiksiz doldurun</p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Address Type & Title */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span>Adres Bilgileri</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                          <Star className="w-4 h-4 text-blue-600" />
                          <span>Adres Başlığı *</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                          placeholder="Ev, İş, Annem, vb."
                          required
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                          <Building className="w-4 h-4 text-purple-600" />
                          <span>Adres Tipi</span>
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                        >
                          <option value="DELIVERY">🏠 Teslimat Adresi</option>
                          <option value="INVOICE">🏢 Fatura Adresi</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <User className="w-5 h-5 text-green-600" />
                      <span>Kişisel Bilgiler</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>Ad *</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                          required
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span>Soyad *</span>
                        </label>
                        <input
                          type="text"
                          value={formData.surname}
                          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                          required
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-green-600" />
                          <span>E-posta</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                          placeholder="ornek@email.com"
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-orange-600" />
                          <span>Telefon *</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                          placeholder="0536 297 12 55"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <span>Konum Bilgileri</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">İl *</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                          placeholder="İstanbul"
                          required
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">İlçe *</label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                          placeholder="Kadıköy"
                          required
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mahalle</label>
                        <input
                          type="text"
                          value={formData.neighborhood}
                          onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                          placeholder="Moda Mahallesi"
                        />
                      </div>
                    </div>

                    <div className="mt-6 group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Açık Adres *</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:bg-white/80"
                        rows={4}
                        placeholder="Sokak, cadde, bina no, daire no vb. detaylı adres bilgileri..."
                        required
                      />
                    </div>
                  </div>

                  {/* Default Address Option */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                          formData.isDefault 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 border-yellow-500' 
                            : 'border-gray-300 group-hover:border-yellow-400'
                        }`}>
                          {formData.isDefault && (
                            <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">Varsayılan adres olarak ayarla</span>
                        <p className="text-xs text-gray-600">Bu adres siparişlerde otomatik seçilecek</p>
                      </div>
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="group relative overflow-hidden bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span>İptal</span>
                      </div>
                    </button>
                    <button
                      type="submit"
                      className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Save className="w-5 h-5" />
                        <span>{editingAddress ? 'Güncelle' : 'Kaydet'}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {/* Address Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        address.type === 'DELIVERY' 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                          : 'bg-gradient-to-br from-purple-500 to-pink-600'
                      }`}>
                        {getAddressIcon(address.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{address.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center space-x-1">
                          {address.type === 'DELIVERY' ? (
                            <>
                              <Home className="w-3 h-3" />
                              <span>Teslimat Adresi</span>
                            </>
                          ) : (
                            <>
                              <Building className="w-3 h-3" />
                              <span>Fatura Adresi</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {address.isDefault && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-md">
                        <Crown className="w-3 h-3" />
                        <span>Varsayılan</span>
                      </div>
                    )}
                  </div>

                  {/* Address Details */}
                  <div className="space-y-3 mb-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">İsim</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{address.name} {address.surname}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-gray-700">Telefon</span>
                        </div>
                        <p className="text-gray-900 text-sm font-semibold">{address.phone}</p>
                      </div>

                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-gray-700">Şehir</span>
                        </div>
                        <p className="text-gray-900 text-sm font-semibold">{address.city}</p>
                      </div>
                    </div>

                    {address.email && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Mail className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-700">E-posta</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{address.email}</p>
                      </div>
                    )}

                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">Adres</span>
                      </div>
                      <p className="text-gray-900 text-sm">
                        {address.district}, {address.city}
                        {address.neighborhood && `, ${address.neighborhood}`}
                      </p>
                      <p className="text-gray-700 text-sm mt-1">{address.address}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(address)}
                      className="group w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <Edit className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="group w-10 h-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {addresses.length === 0 && !showForm && (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-12 max-w-lg mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz adres eklenmemiş</h3>
                  <p className="text-gray-600 mb-8">İlk adresinizi ekleyerek güvenli alışverişe başlayın.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center space-x-3">
                      <Plus className="w-5 h-5" />
                      <span>İlk Adresinizi Ekleyin</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            )}
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
        @keyframes slideIn {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
