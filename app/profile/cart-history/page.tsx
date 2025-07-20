"use client"

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShoppingCart, RefreshCcw, Calendar, Clock, Package, CheckCircle, ArrowRight, History } from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  product: {
    id: string;
    name: string;
    images: string;
  };
}

interface CartHistory {
  id: string;
  name: string;
  createdAt: string;
  cart: {
    id: string;
    items: CartItem[];
  };
}

export default function CartHistoryPage() {
  const [histories, setHistories] = useState<CartHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      const res = await fetch("/api/cart/history");
      if (!res.ok) throw new Error("Sepet geçmişi alınamadı");
      const data = await res.json();
      setHistories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (cartHistoryId: string) => {
    setActivating(cartHistoryId);
    try {
      const res = await fetch("/api/cart/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartHistoryId }),
      });
      if (!res.ok) throw new Error("Sepet tekrar aktifleştirilemedi");
      window.location.href = "/cart";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setActivating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Az önce";
    if (diffInHours < 24) return diffInHours + " saat önce";
    if (diffInHours < 48) return "Dün";
    if (diffInHours < 168) return Math.floor(diffInHours / 24) + " gün önce";
    return Math.floor(diffInHours / 168) + " hafta önce";
  };

  return (
    <div>
      <Header />
      
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzlDOTJBQyIgZmlsbC1vcGFjaXR5PSIwLjEiPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+CjwvZz4KPC9nPgo8L3N2Zz4=')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      <main className="relative min-h-screen pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li><a href="/" className="hover:text-white transition-colors">Ana Sayfa</a></li>
              <li>/</li>
              <li><a href="/profile" className="hover:text-white transition-colors">Profil</a></li>
              <li>/</li>
              <li className="text-white">Sepet Geçmişi</li>
            </ol>
          </nav>

          {/* Header Section */}
          <div className="mb-12">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <History className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Sepet Geçmişi</h1>
                    <p className="text-white/70">Daha önce kaydettiğiniz sepetlerinizi görüntüleyin</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/70">Son güncelleme: Şimdi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-24">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl inline-block">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDuration: '0.8s' }}></div>
                </div>
                <p className="mt-6 text-white/80 text-lg">Sepet geçmişi yükleniyor...</p>
                <p className="mt-2 text-white/60 text-sm">Lütfen bekleyiniz</p>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6 backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/30 rounded-full">
                  <Package className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            </div>
          ) : histories.length === 0 ? (
            <div className="text-center py-24">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl inline-block">
                <div className="mb-6">
                  <div className="p-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full inline-block">
                    <ShoppingCart className="w-16 h-16 text-white/60" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Sepet Geçmişi Boş</h3>
                <p className="text-white/70 text-lg mb-6">Henüz arşivlenmiş sepetiniz yok.</p>
                <a 
                  href="/products" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Alışverişe Başla
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {histories.map((history, index) => (
                <div 
                  key={history.id} 
                  className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:shadow-3xl group"
                  style={{ animationDelay: (index * 0.1) + 's' }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl group-hover:from-blue-500/40 group-hover:to-purple-500/40 transition-all duration-300">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                          {history.name}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-white/60 text-sm">{formatDate(history.createdAt)}</span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/60 text-sm">{getTimeAgo(history.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleActivate(history.id)}
                      disabled={activating === history.id}
                      className="group/btn relative overflow-hidden px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center space-x-2">
                        <RefreshCcw className={activating === history.id ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
                        <span>{activating === history.id ? "Aktif Ediliyor..." : "Tekrar Aktif Et"}</span>
                      </div>
                    </button>
                  </div>

                  {/* Products */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-white flex items-center">
                        <Package className="w-5 h-5 mr-2 text-white/70" />
                        Ürünler
                      </h4>
                      <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                        <span className="text-sm text-white/70">{history.cart.items.length} ürün</span>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {history.cart.items.map((item, itemIndex) => {
                        const images = JSON.parse(item.product.images || "[]");
                        const image = images[0] || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop";
                        return (
                          <div 
                            key={item.id} 
                            className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 group/item border border-white/10"
                            style={{ animationDelay: ((index * 0.1) + (itemIndex * 0.05)) + 's' }}
                          >
                            <div className="relative overflow-hidden rounded-xl">
                              <img
                                src={image}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover group-hover/item:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-white truncate group-hover/item:text-white/90 transition-colors">
                                {item.product.name}
                              </h5>
                              <div className="flex items-center space-x-3 mt-1">
                                <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                  {item.quantity} adet
                                </span>
                                {item.size && (
                                  <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                                    {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="inline-flex items-center px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
                                    {item.color}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="w-5 h-5 text-green-400 opacity-60 group-hover/item:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
