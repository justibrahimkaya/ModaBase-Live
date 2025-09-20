'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Search, Filter, Download, RefreshCw, Plus, 
  Eye, Calendar, DollarSign, Clock, CheckCircle,
  XCircle, AlertCircle, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Users,
  FileCheck, Crown, Sparkles, ExternalLink,
  Banknote, PieChart
} from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  einvoiceStatus?: string;
  einvoicePdfUrl?: string;
  user?: {
    name: string;
    email: string;
  };
  guestName?: string;
  guestEmail?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  totalRevenue: number;
  thisMonthInvoices: number;
  thisMonthRevenue: number;
  averageInvoiceValue: number;
  successRate: number;
}

export default function AdminInvoicesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    totalRevenue: 0,
    thisMonthInvoices: 0,
    thisMonthRevenue: 0,
    averageInvoiceValue: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [creatingInvoice, setCreatingInvoice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [dropdownOrderId, setDropdownOrderId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOrderId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/invoices', {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Faturalar yüklenemedi');
      }

      const data = await response.json();
      setOrders(data);
      calculateStats(data);
    } catch (error) {
      console.error('Fatura listesi hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoicesData: Order[]) => {
    const total = invoicesData.length;
    const paid = invoicesData.filter(o => o.einvoiceStatus === 'SUCCESS').length;
    const unpaid = invoicesData.filter(o => !o.einvoiceStatus || o.einvoiceStatus !== 'SUCCESS').length;
    const revenue = invoicesData.reduce((sum, o) => sum + o.total, 0);
    const avgValue = revenue / total || 0;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthData = invoicesData.filter(o => new Date(o.createdAt) >= thisMonth);
    const thisMonthCount = thisMonthData.length;
    const thisMonthRev = thisMonthData.reduce((sum, o) => sum + o.total, 0);
    
    const successRate = total > 0 ? (paid / total) * 100 : 0;
    
    setStats({
      totalInvoices: total,
      paidInvoices: paid,
      unpaidInvoices: unpaid,
      totalRevenue: revenue,
      thisMonthInvoices: thisMonthCount,
      thisMonthRevenue: thisMonthRev,
      averageInvoiceValue: avgValue,
      successRate
    });
  };

  const createInvoice = async (orderId: string) => {
    console.log('🚀 E-fatura oluşturma başlatıldı:', orderId);
    setCreatingInvoice(orderId);
    
    try {
      console.log('📡 API isteği gönderiliyor...');
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderId })
      });

      console.log('📥 API yanıt alındı:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Hatası:', errorData);
        throw new Error(errorData.error || 'E-fatura oluşturulamadı');
      }

      const result = await response.json();
      console.log('✅ E-fatura başarıyla oluşturuldu:', result);
      
      // Success notification
      alert(`✅ E-fatura başarıyla oluşturuldu!\nDosya: ${result.fileName}\nSipariş: #${result.orderNumber}`);
      
      fetchInvoices(); // Refresh list
    } catch (error) {
      console.error('❌ E-fatura oluşturma hatası:', error);
      alert(`❌ E-fatura oluşturma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setCreatingInvoice(null);
    }
  };

  // Portal yönlendirme fonksiyonu
  const redirectToPortal = async (orderId: string) => {
    console.log('🌐 E.arşiv portalına yönlendirme başlatılıyor:', orderId);
    setCreatingInvoice(orderId);
    
    try {
      const response = await fetch('/api/admin/invoices/redirect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Portal yönlendirme hazırlanamadı');
      }

      const result = await response.json();
      console.log('✅ Portal yönlendirme hazırlandı:', result);
      
      // Portal'a yönlendir
      if (result.redirectData?.portalUrl) {
        // Callback URL'i localStorage'a kaydet (güvenlik için) - SSR Safe
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('earsiv_callback', result.redirectData.callbackUrl);
          localStorage.setItem('earsiv_order_id', orderId);
        }
        
        // Portal'a yönlendir
        if (typeof window !== 'undefined') {
          window.open(result.redirectData.portalUrl, '_blank');
        }
        
        // Kullanıcıyı bilgilendir
        alert('🌐 E.arşiv portalı yeni sekmede açıldı. Portal\'da faturayı oluşturduktan sonra bu sayfaya geri döneceksiniz.');
      }
      
    } catch (error) {
      console.error('❌ Portal yönlendirme hatası:', error);
      alert(`❌ Portal yönlendirme başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setCreatingInvoice(null);
    }
  };

  const downloadInvoice = (pdfUrl: string, orderId: string) => {
    console.log('📥 Fatura indiriliyor:', { pdfUrl, orderId });
    
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `fatura-${orderId.slice(-8)}.pdf`;
      link.target = '_blank'; // ✅ Yeni sekmede aç
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Fatura indirme işlemi başlatıldı');
    } catch (error) {
      console.error('❌ Fatura indirme hatası:', error);
      alert('Fatura indirilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Export all invoices to CSV
  const exportInvoices = () => {
    try {
      const csvHeaders = ['Sipariş No', 'Müşteri Adı', 'Email', 'Tutar', 'Tarih', 'E-Fatura Durumu', 'PDF URL'];
      const csvData = filteredOrders.map(order => [
        order.id,
        order.user?.name || order.guestName || 'Misafir',
        order.user?.email || order.guestEmail || '',
        order.total.toFixed(2),
        new Date(order.createdAt).toLocaleDateString('tr-TR'),
        order.einvoiceStatus || 'Oluşturulmadı',
        order.einvoicePdfUrl || ''
      ]);

      const csvContent = [csvHeaders.join(','), ...csvData.map(row => 
        row.map(field => `"${field}"`).join(',')
      )].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `e-faturalar-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      alert('Dışa aktarma işlemi başarısız oldu!');
    }
  };

  // Create new invoice manually
  const handleNewInvoice = async () => {
    if (!selectedOrderId) {
      alert('Lütfen bir sipariş seçin!');
      return;
    }

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderId: selectedOrderId })
      });

      if (!response.ok) {
        throw new Error('E-fatura oluşturulamadı');
      }

      alert('E-fatura başarıyla oluşturuldu!');
      setShowNewInvoiceModal(false);
      setSelectedOrderId('');
      fetchInvoices();
    } catch (error) {
      console.error('E-fatura oluşturma hatası:', error);
      alert('E-fatura oluşturma işlemi başarısız oldu!');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
                         order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                         order.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
                         order.guestName?.toLowerCase().includes(search.toLowerCase()) ||
                         order.guestEmail?.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = !statusFilter || order.einvoiceStatus === statusFilter
    
    const matchesDate = !dateFilter || (() => {
      const orderDate = new Date(order.createdAt)
      const today = new Date()
      
      switch(dateFilter) {
        case 'today':
          return orderDate.toDateString() === today.toDateString()
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return orderDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return orderDate >= monthAgo
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesDate
  });

  const getStatusConfig = (status?: string) => {
    switch(status) {
      case 'SUCCESS':
        return { 
          label: 'Başarılı', 
          color: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-700',
          icon: CheckCircle
        }
      case 'PENDING':
        return { 
          label: 'Beklemede', 
          color: 'from-yellow-500 to-orange-500',
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-700',
          icon: Clock
        }
      case 'ERROR':
        return { 
          label: 'Hata', 
          color: 'from-red-500 to-rose-500',
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-700',
          icon: XCircle
        }
      default:
        return { 
          label: 'Oluşturulmadı', 
          color: 'from-gray-500 to-slate-500',
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-700',
          icon: AlertCircle
        }
    }
  }

  const StatCard = ({ title, value, change, icon: Icon, color, isPositive = true }: {
    title: string
    value: string | number
    change?: string
    icon: any
    color: string
    isPositive?: boolean
  }) => (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600">E-Faturalar yükleniyor...</p>
          <p className="text-sm text-gray-500">Lütfen bekleyiniz</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                E-Fatura Yönetimi
              </h1>
              <p className="text-gray-600 mt-1">Tüm e-faturaları görüntüleyin ve yönetin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtreler
            </button>
            <button
              onClick={fetchInvoices}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
            <button 
              onClick={exportInvoices}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Dışa Aktar
            </button>
            <button 
              onClick={() => setShowNewInvoiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Yeni Fatura
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam E-Fatura"
            value={stats.totalInvoices}
            change={`+${stats.thisMonthInvoices} bu ay`}
            icon={FileCheck}
            color="from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Başarılı Faturalar"
            value={stats.paidInvoices}
            change={`%${stats.successRate.toFixed(1)} başarı`}
            icon={CheckCircle}
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Toplam Gelir"
            value={`₺${stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
            change={`₺${stats.thisMonthRevenue.toLocaleString('tr-TR')} bu ay`}
            icon={DollarSign}
            color="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Ortalama Fatura"
            value={`₺${stats.averageInvoiceValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
            change={`${stats.unpaidInvoices} beklemede`}
            icon={PieChart}
            color="from-purple-500 to-pink-600"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-Fatura Durumu</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="SUCCESS">Başarılı</option>
                  <option value="PENDING">Beklemede</option>
                  <option value="ERROR">Hata</option>
                  <option value="">Oluşturulmadı</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Tüm Tarihler</option>
                  <option value="today">Bugün</option>
                  <option value="week">Son 7 Gün</option>
                  <option value="month">Son 30 Gün</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Sipariş no, müşteri..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold text-gray-900">E-Fatura Listesi</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {filteredOrders.length} fatura
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Canlı Veriler</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sipariş No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    E-Fatura Durumu
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz E-Fatura Bulunamadı</h3>
                        <p className="text-gray-500 text-sm">Siparişler oluşturulduğunda e-faturalar burada görünecek.</p>
                        <div className="mt-4">
                          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                            <Plus className="w-4 h-4" />
                            İlk Faturanızı Oluşturun
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.einvoiceStatus)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <tr 
                        key={order.id} 
                        className="hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                #{order.id.slice(-3)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">#{order.id.slice(-8)}</div>
                              <div className="text-xs text-gray-500">ID: {order.id}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {order.user?.name || order.guestName || 'Misafir Müşteri'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.user?.email || order.guestEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                              <Banknote className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                ₺{order.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-xs text-gray-500">TL</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleTimeString('tr-TR')}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {order.einvoiceStatus === 'SUCCESS' && order.einvoicePdfUrl ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadInvoice(order.einvoicePdfUrl!, order.id)
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                                title="Faturayı İndir"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    createInvoice(order.id)
                                  }}
                                  disabled={creatingInvoice === order.id}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                  title="Otomatik E-fatura Oluştur"
                                >
                                  {creatingInvoice === order.id ? (
                                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Plus className="w-4 h-4" />
                                  )}
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    redirectToPortal(order.id)
                                  }}
                                  disabled={creatingInvoice === order.id}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                  title="E.arşiv Portal'ında Fatura Kes (Profesyonel)"
                                >
                                  {creatingInvoice === order.id ? (
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <ExternalLink className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/admin/orders/${order.id}`)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Sipariş Detayı"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDropdownOrderId(dropdownOrderId === order.id ? null : order.id);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              
                              {dropdownOrderId === order.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        createInvoice(order.id);
                                        setDropdownOrderId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      E-Fatura Oluştur
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/admin/orders/${order.id}`);
                                        setDropdownOrderId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Siparişi Görüntüle
                                    </button>
                                    {order.einvoicePdfUrl && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          downloadInvoice(order.einvoicePdfUrl!, order.id);
                                          setDropdownOrderId(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        PDF İndir
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Toplam <span className="font-medium">{filteredOrders.length}</span> e-fatura gösteriliyor
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sayfa</span>
                  <select className="px-2 py-1 text-sm border border-gray-300 rounded bg-white">
                    <option>1</option>
                  </select>
                  <span className="text-sm text-gray-500">/ 1</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Invoice Modal */}
        {showNewInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Yeni E-Fatura Oluştur</h3>
                <p className="text-gray-600 mt-1">Hangi sipariş için e-fatura oluşturmak istiyorsunuz?</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sipariş Seçin
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sipariş seçin...</option>
                    {orders
                      .filter(order => !order.einvoiceStatus || order.einvoiceStatus !== 'SUCCESS')
                      .map(order => (
                        <option key={order.id} value={order.id}>
                          #{order.id.slice(-8)} - {order.user?.name || order.guestName || 'Misafir'} - ₺{order.total.toFixed(2)}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {selectedOrderId && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Seçili Sipariş:</span> #{selectedOrderId.slice(-8)}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowNewInvoiceModal(false);
                    setSelectedOrderId('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleNewInvoice}
                  disabled={!selectedOrderId}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  E-Fatura Oluştur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
