'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle,
  Reply,
  Eye,
  User,
  Calendar
} from 'lucide-react'

interface ContactMessage {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'PENDING' | 'READ' | 'REPLIED' | 'CLOSED'
  adminReply?: string
  adminId?: string
  repliedAt?: string
  createdAt: string
  admin?: {
    id: string
    name: string
    email: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [pagination.page, statusFilter])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      // İşletme ID'sini almak için gerçek auth kullanılmalı
      // Şimdilik demo amaçlı sabit bir business ID kullanıyoruz
      const businessId = 'demo-business-id' // Bu kısmı gerçek business ID ile değiştirin
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
        businessId: businessId
      })

      // İşletme admin API'sini kullan
      const response = await fetch(`/api/admin/messages?${params}`)
      const data = await response.json()

      if (data.messages) {
        setMessages(data.messages)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' })
      })

      if (response.ok) {
        fetchMessages()
      }
    } catch (error) {
      console.error('Mesaj okundu olarak işaretlenirken hata:', error)
    }
  }

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setReplyLoading(true)
    try {
      const response = await fetch(`/api/contact/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reply: replyText,
          recipientEmail: selectedMessage.email
        })
      })

      if (response.ok) {
        setReplyText('')
        setSelectedMessage(null)
        fetchMessages()
        alert('Cevabınız başarıyla gönderildi!')
      } else {
        alert('Cevap gönderilirken hata oluştu!')
      }
    } catch (error) {
      console.error('Cevap gönderilirken hata:', error)
      alert('Cevap gönderilirken hata oluştu!')
    } finally {
      setReplyLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'READ': return 'bg-blue-100 text-blue-800'
      case 'REPLIED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Bekliyor'
      case 'READ': return 'Okundu'
      case 'REPLIED': return 'Cevaplandı'
      case 'CLOSED': return 'Kapatıldı'
      default: return status
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            İletişim Mesajları
          </h1>
          <p className="text-gray-600 mt-1">
            Müşteri mesajlarını görüntüleyin ve cevaplayın
          </p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="PENDING">Bekliyor</option>
            <option value="READ">Okundu</option>
            <option value="REPLIED">Cevaplandı</option>
            <option value="CLOSED">Kapatıldı</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Toplam Mesaj', value: pagination.total, color: 'bg-blue-500', icon: MessageSquare },
          { label: 'Bekliyor', value: messages.filter(m => m.status === 'PENDING').length, color: 'bg-yellow-500', icon: Clock },
          { label: 'Cevaplandı', value: messages.filter(m => m.status === 'REPLIED').length, color: 'bg-green-500', icon: CheckCircle },
          { label: 'Bu Sayfa', value: messages.length, color: 'bg-purple-500', icon: Eye }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gönderen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Konu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Henüz mesaj bulunmuyor
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {message.firstName} {message.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {message.email}
                          </div>
                          {message.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {message.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{message.subject}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {message.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                        {getStatusText(message.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Görüntüle
                        </button>
                        {message.status === 'PENDING' && (
                          <button
                            onClick={() => markAsRead(message.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Okundu
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Toplam {pagination.total} mesajdan {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="px-3 py-1 text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Mesaj Detayı</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ad Soyad</label>
                    <p className="text-gray-900">{selectedMessage.firstName} {selectedMessage.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">E-posta</label>
                    <p className="text-gray-900">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Telefon</label>
                    <p className="text-gray-900">{selectedMessage.phone || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Durum</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMessage.status)}`}>
                      {getStatusText(selectedMessage.status)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Konu</label>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Mesaj</label>
                  <div className="bg-gray-50 p-4 rounded-lg mt-1">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {selectedMessage.adminReply && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Admin Cevabı</label>
                    <div className="bg-blue-50 p-4 rounded-lg mt-1">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.adminReply}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedMessage.repliedAt && `Cevaplandı: ${new Date(selectedMessage.repliedAt).toLocaleString('tr-TR')}`}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedMessage.status !== 'REPLIED' && selectedMessage.status !== 'CLOSED' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cevap Yaz</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={5}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Müşteriye göndermek istediğiniz cevabı yazın..."
                    />
                    <button
                      onClick={sendReply}
                      disabled={!replyText.trim() || replyLoading}
                      className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Reply className="w-4 h-4" />
                      {replyLoading ? 'Gönderiliyor...' : 'Cevabı Gönder'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}