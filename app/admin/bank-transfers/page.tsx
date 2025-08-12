'use client'

import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react' // ❌ Business auth kullanıyoruz
import { useRouter } from 'next/navigation'

interface TransferNotification {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  transferAmount: number
  transferDate: string
  transferNote?: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  adminNote?: string
  confirmedAt?: string
  iban: string
  accountHolder: string
  bankName: string
  createdAt: string
}

export default function BankTransfersPage() {
  // ❌ NextAuth devre dışı - Business authentication kullanıyoruz
  // const { data: session, status } = useSession()
  const router = useRouter()
  const [transfers, setTransfers] = useState<TransferNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransfer, setSelectedTransfer] = useState<TransferNotification | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)

  // ✅ Business authentication admin layout'da hallediliyor
  useEffect(() => {

    fetchTransfers()
  }, [router])

  const fetchTransfers = async () => {
    try {
      const response = await fetch('/api/admin/bank-transfers')
      if (response.ok) {
        const data = await response.json()
        setTransfers(data.transfers)
      }
    } catch (error) {
      console.error('Havale bildirimleri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (transferId: string, newStatus: 'CONFIRMED' | 'REJECTED') => {
    setProcessing(true)
    try {
      const response = await fetch('/api/payment/bank-transfer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferId,
          status: newStatus,
          adminNote
        })
      })

      if (response.ok) {
        await fetchTransfers()
        setShowModal(false)
        setSelectedTransfer(null)
        setAdminNote('')
        alert(`Havale ${newStatus === 'CONFIRMED' ? 'onaylandı' : 'reddedildi'}`)
      } else {
        throw new Error('Havale durumu güncellenemedi')
      }
    } catch (error) {
      console.error('Havale durumu güncelleme hatası:', error)
      alert('Havale durumu güncellenirken hata oluştu')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Bekliyor</span>
      case 'CONFIRMED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Onaylandı</span>
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Reddedildi</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Havale Bildirimleri</h1>
            <div className="text-sm text-gray-500">
              Toplam: {transfers.length} bildirim
            </div>
          </div>

          {transfers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">Henüz havale bildirimi bulunmuyor.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <li key={transfer.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {transfer.customerName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Sipariş: #{transfer.orderId.slice(-8)} | {transfer.customerEmail}
                            </p>
                            <p className="text-sm text-gray-500">
                              Telefon: {transfer.customerPhone}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ₺{transfer.transferAmount.toFixed(2)}
                            </div>
                            {getStatusBadge(transfer.status)}
                          </div>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Havale Tarihi:</span> {new Date(transfer.transferDate).toLocaleDateString('tr-TR')}
                          </div>
                          <div>
                            <span className="font-medium">Bildirim Tarihi:</span> {new Date(transfer.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        
                        {transfer.transferNote && (
                          <div className="mt-2">
                            <span className="font-medium text-sm text-gray-600">Açıklama:</span>
                            <span className="text-sm text-gray-500 ml-1">{transfer.transferNote}</span>
                          </div>
                        )}
                        
                        {transfer.adminNote && (
                          <div className="mt-2">
                            <span className="font-medium text-sm text-gray-600">Admin Notu:</span>
                            <span className="text-sm text-gray-500 ml-1">{transfer.adminNote}</span>
                          </div>
                        )}
                      </div>
                      
                      {transfer.status === 'PENDING' && (
                        <div className="ml-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTransfer(transfer)
                              setShowModal(true)
                            }}
                            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            İşlem Yap
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Onay/Red Modal */}
      {showModal && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Havale İşlemi
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Müşteri:</strong> {selectedTransfer.customerName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Tutar:</strong> ₺{selectedTransfer.transferAmount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>IBAN:</strong> {selectedTransfer.iban}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notu (Opsiyonel)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Havale onayı/reddi için not..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedTransfer(null)
                  setAdminNote('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={processing}
              >
                İptal
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedTransfer.id, 'REJECTED')}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={processing}
              >
                {processing ? 'İşleniyor...' : 'Reddet'}
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedTransfer.id, 'CONFIRMED')}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                disabled={processing}
              >
                {processing ? 'İşleniyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 