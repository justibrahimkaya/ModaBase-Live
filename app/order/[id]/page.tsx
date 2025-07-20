'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  product: {
    images: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  shippingCost?: number;
  shippingMethod?: string;
  trackingNumber?: string;
  shippingCompany?: string;
  shippingTrackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  note?: string;
  einvoiceStatus?: string;
  einvoicePdfUrl?: string;
  user?: {
    name: string;
    email: string;
  };
  guestName?: string;
  guestEmail?: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const orderId = params.id as string;

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Sipariş bulunamadı');
      }

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Sipariş yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'İşleme Alındı'
        };
      case 'PROCESSING':
        return {
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: 'Hazırlanıyor'
        };
      case 'SHIPPED':
        return {
          icon: Truck,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          text: 'Kargoda'
        };
      case 'DELIVERED':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Teslim Edildi'
        };
      case 'CANCELLED':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'İptal Edildi'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: status
        };
    }
  };

  const downloadInvoice = (pdfUrl: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `fatura-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sipariş yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sipariş Bulunamadı</h2>
          <p className="text-gray-600">Aradığınız sipariş bulunamadı veya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sipariş Detayı</h1>
          <p className="text-gray-600 mt-2">Sipariş #{order.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana Bilgiler */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sipariş Durumu */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Sipariş Durumu</h2>
                <div className={`flex items-center px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
                  <statusInfo.icon className={`h-4 w-4 mr-2 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Sipariş Tarihi:</span>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Toplam Tutar:</span>
                  <p className="font-medium">{order.total.toFixed(2)} ₺</p>
                </div>
                {order.shippingCost && (
                  <div>
                    <span className="text-gray-500">Kargo Ücreti:</span>
                    <p className="font-medium">{order.shippingCost.toFixed(2)} ₺</p>
                  </div>
                )}
                {order.shippingMethod && (
                  <div>
                    <span className="text-gray-500">Kargo Yöntemi:</span>
                    <p className="font-medium">{order.shippingMethod}</p>
                  </div>
                )}
              </div>

              {order.trackingNumber && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Kargo Takip</p>
                      <p className="text-sm text-blue-700">Takip No: {order.trackingNumber}</p>
                    </div>
                    {order.shippingTrackingUrl && (
                      <a
                        href={order.shippingTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Takip Et →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ürünler */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Edilen Ürünler</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        src={JSON.parse(item.product.images)[0] || '/placeholder.png'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-500">
                        Adet: {item.quantity} × {item.price.toFixed(2)} ₺
                        {item.size && ` | Beden: ${item.size}`}
                        {item.color && ` | Renk: ${item.color}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} ₺
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* E-Fatura */}
            {order.einvoiceStatus === 'SUCCESS' && order.einvoicePdfUrl && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">E-Fatura</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Siparişiniz için e-fatura hazırlanmıştır.
                </p>
                <button
                  onClick={() => downloadInvoice(order.einvoicePdfUrl!)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  E-Fatura İndir
                </button>
              </div>
            )}

            {/* Müşteri Bilgileri */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Ad Soyad:</span>
                  <p className="font-medium">
                    {order.user?.name || order.guestName || 'Misafir Müşteri'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">E-posta:</span>
                  <p className="font-medium">
                    {order.user?.email || order.guestEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Notlar */}
            {order.note && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Notu</h3>
                <p className="text-sm text-gray-600">{order.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
