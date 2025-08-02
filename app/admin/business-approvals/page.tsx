'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building, 
  Mail, 
  Calendar,
  User,
  FileText
} from 'lucide-react'

interface BusinessApplication {
  id: string
  businessName: string
  businessType: string
  taxNumber: string
  email: string
  phone: string
  contactName: string
  contactSurname: string
  address: string
  city: string
  adminStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  appliedAt: string
  rejectionReason?: string
}

export default function BusinessApprovalsPage() {
  const [applications, setApplications] = useState<BusinessApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<BusinessApplication | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/business-applications')
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/business-applications/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      })

      if (response.ok) {
        await fetchApplications()
        setSelectedApp(null)
      }
    } catch (error) {
      console.error('Error approving application:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      alert('Lütfen red nedeni belirtin')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/business-applications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, reason: rejectionReason })
      })

      if (response.ok) {
        await fetchApplications()
        setSelectedApp(null)
        setRejectionReason('')
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
    } finally {
      setProcessing(false)
    }
  }

  const pendingApplications = applications.filter(app => app.adminStatus === 'PENDING')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Başvurular yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">İşletme Başvuru Onayları</h1>
              <p className="text-gray-600 mt-1">Bekleyen mağaza başvurularını inceleyin ve onaylayın</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {pendingApplications.length} Bekleyen
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pendingApplications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tüm başvurular değerlendirildi!</h3>
            <p className="text-gray-600">Şu anda bekleyen işletme başvurusu bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Applications List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Bekleyen Başvurular</h2>
              {pendingApplications.map((app) => (
                <div
                  key={app.id}
                  className={`bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedApp?.id === app.id
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{app.businessName}</h3>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{app.contactName} {app.contactSurname}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{app.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(app.appliedAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="text-orange-600 font-medium text-sm">Bekliyor</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Application Details */}
            <div className="sticky top-8">
              {selectedApp ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="border-b border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Başvuru Detayları</h2>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Business Info */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">İşletme Bilgileri</h3>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">İşletme Adı:</span>
                          <span className="font-medium">{selectedApp.businessName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">İşletme Türü:</span>
                          <span className="font-medium">{selectedApp.businessType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vergi No:</span>
                          <span className="font-medium">{selectedApp.taxNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">İletişim Bilgileri</h3>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Yetkili:</span>
                          <span className="font-medium">{selectedApp.contactName} {selectedApp.contactSurname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">E-posta:</span>
                          <span className="font-medium">{selectedApp.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Telefon:</span>
                          <span className="font-medium">{selectedApp.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Adres:</span>
                          <span className="font-medium text-right">{selectedApp.address}, {selectedApp.city}</span>
                        </div>
                      </div>
                    </div>

                    {/* Application Date */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Başvuru Bilgileri</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Başvuru Tarihi:</span>
                        <span className="font-medium">{new Date(selectedApp.appliedAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>

                    {/* Rejection Reason Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Red Nedeni (Opsiyonel)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Başvuru reddedilecekse nedeni belirtin..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(selectedApp.id)}
                        disabled={processing}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{processing ? 'İşleniyor...' : 'Onayla'}</span>
                      </button>
                      <button
                        onClick={() => handleReject(selectedApp.id)}
                        disabled={processing}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{processing ? 'İşleniyor...' : 'Reddet'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Detayları görmek için bir başvuru seçin</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
