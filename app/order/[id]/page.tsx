'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  XCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  discount?: number;
  shippingCost?: number;
  paymentMethod?: string;
  trackingNumber?: string;
  shippingCompany?: string;
  createdAt: string;
  updatedAt: string;
  guestName?: string;
  guestSurname?: string;
  guestEmail?: string;
  guestPhone?: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // PayTR'den gelen status parametresini kontrol et
  const paytrStatus = searchParams.get('status');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      console.log('🔍 Sipariş detayı aranıyor:', params.id);
      
      const response = await fetch(`/api/orders/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Sipariş bulundu:', data.id);
        setOrder(data);
      } else {
        console.log('❌ Sipariş bulunamadı:', data.error);
        setError(data.message || data.error || 'Sipariş bulunamadı');
      }
    } catch (error) {
      console.error('❌ Sipariş yükleme hatası:', error);
      setError('Sipariş yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Beklemede', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'AWAITING_PAYMENT':
        return { label: 'Ödeme Bekleniyor', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'PAID':
        return { label: 'Ödendi', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'CONFIRMED':
        return { label: 'Onaylandı', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'SHIPPED':
        return { label: 'Kargoda', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'DELIVERED':
        return { label: 'Teslim Edildi', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'FAILED':
        return { label: 'Başarısız', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
      case 'CANCELLED':
        return { label: 'İptal Edildi', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { label: 'Bilinmiyor', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Hata</h1>
              <p className="text-gray-600">{error || 'Sipariş bulunamadı'}</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* PayTR Status Alert */}
          {paytrStatus && (
            <div className={`mb-6 p-4 rounded-lg ${
              paytrStatus === 'success' 
                ? 'bg-green-100 border border-green-200 text-green-800' 
                : 'bg-red-100 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {paytrStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">
                  {paytrStatus === 'success' 
                    ? 'Ödeme başarıyla tamamlandı!' 
                    : 'Ödeme işlemi başarısız oldu.'}
                </span>
              </div>
            </div>
          )}

          {/* Sipariş Başlığı */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Sipariş #{order.id.slice(-8)}
            </h1>
            <div className={`flex items-center px-3 py-1 rounded-full ${statusConfig.bg}`}>
              <StatusIcon className={`h-4 w-4 mr-2 ${statusConfig.color}`} />
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Durum Açıklaması */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {order.status === 'PENDING' && '⏳ Siparişiniz onay bekliyor. Ödeme onaylandıktan sonra hazırlanmaya başlanacak.'}
              {order.status === 'AWAITING_PAYMENT' && '💰 Havale ödemesi bekleniyor. Lütfen belirtilen hesaba ödeme yapın ve dekont gönderin.'}
              {order.status === 'PAID' && '✅ Ödemeniz alındı. Siparişiniz hazırlanmaya başlanacak.'}
              {order.status === 'CONFIRMED' && '✅ Siparişiniz onaylandı. Hazırlanmaya başlanacak.'}
              {order.status === 'SHIPPED' && '🚚 Siparişiniz kargoya verildi. Takip numarası ile takip edebilirsiniz.'}
              {order.status === 'DELIVERED' && '🎉 Siparişiniz başarıyla teslim edildi. İyi alışverişler!'}
              {order.status === 'FAILED' && '❌ Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.'}
              {order.status === 'CANCELLED' && '🚫 Siparişiniz iptal edildi. Detaylar için müşteri hizmetleri ile iletişime geçin.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sipariş Detayları */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sipariş Özeti */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.size && `Beden: ${item.size}`}
                          {item.color && ` • Renk: ${item.color}`}
                        </p>
                        <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teslimat Bilgileri */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Bilgileri</h2>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    <span className="font-medium">Ad Soyad:</span> {order.guestName} {order.guestSurname}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">E-posta:</span> {order.guestEmail}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Telefon:</span> {order.guestPhone}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-gray-900">
                      <span className="font-medium">Kargo Takip:</span> {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fiyat Özeti */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fiyat Özeti</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-medium">₺{(order.total - (order.shippingCost || 0)).toFixed(2)}</span>
                </div>
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>İndirim:</span>
                    <span>-₺{order.discount.toFixed(2)}</span>
                  </div>
                )}
                {order.shippingCost && order.shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kargo:</span>
                    <span className="font-medium">₺{order.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Toplam:</span>
                    <span className="font-bold text-lg text-gray-900">₺{order.total.toFixed(2)}</span>
                  </div>
                </div>
                {order.paymentMethod && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Ödeme Yöntemi:</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
