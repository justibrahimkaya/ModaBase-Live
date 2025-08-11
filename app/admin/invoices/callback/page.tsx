// =======================================================
// E.ARŞİV PORTAL GERİ DÖNÜŞ SAYFASI
// =======================================================

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface InvoiceCallbackResult {
  success: boolean;
  message: string;
  invoiceData?: any;
}

export default function InvoiceCallbackPage() {
  const [result, setResult] = useState<InvoiceCallbackResult | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const invoiceId = searchParams.get('invoice_id'); // Portal'dan gelen fatura ID
    const status = searchParams.get('status'); // Portal'dan gelen durum

    if (!orderId) {
      setResult({
        success: false,
        message: 'Sipariş ID bulunamadı'
      });
      setLoading(false);
      return;
    }

    // Portal'dan dönüş işlemini gerçekleştir
    handlePortalCallback(orderId, invoiceId, status);
  }, [searchParams]);

  const handlePortalCallback = async (orderId: string, invoiceId: string | null, status: string | null) => {
    try {
      console.log('🔄 Portal geri dönüş işleniyor...', { orderId, invoiceId, status });

      const response = await fetch('/api/admin/invoices/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          invoiceId,
          status
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message || 'Fatura başarıyla işlendi',
          invoiceData: data.invoiceData
        });

        // 3 saniye sonra faturalar sayfasına yönlendir
        setTimeout(() => {
          router.push('/admin/invoices');
        }, 3000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Fatura işleme hatası'
        });
      }

    } catch (error) {
      console.error('❌ Callback işleme hatası:', error);
      setResult({
        success: false,
        message: 'Fatura işlenirken hata oluştu'
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🔄 E.arşiv fatura işleniyor...
          </h2>
          <p className="text-gray-600">
            Portal'dan gelen fatura bilgileri sisteme kaydediliyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        {result?.success ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ✅ Fatura Başarıyla Oluşturuldu!
            </h2>
            <p className="text-gray-600 mb-4">
              {result.message}
            </p>
            {result.invoiceData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-700">
                  <p><strong>Fatura No:</strong> {result.invoiceData.invoiceNumber}</p>
                  <p><strong>E.arşiv ID:</strong> {result.invoiceData.earsivId}</p>
                  <p><strong>Durum:</strong> {result.invoiceData.status}</p>
                </div>
              </div>
            )}
            <div className="text-sm text-gray-500">
              3 saniye sonra faturalar sayfasına yönlendirileceksiniz...
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ❌ Fatura İşleme Hatası
            </h2>
            <p className="text-gray-600 mb-4">
              {result?.message}
            </p>
            <button
              onClick={() => router.push('/admin/invoices')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Faturalar Sayfasına Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 