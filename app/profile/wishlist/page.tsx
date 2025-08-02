"use client"

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clock, Star, Trash2, Heart, Package, ArrowRight, Timer, Bookmark, Plus, Eye, Zap } from "lucide-react";

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string;
  };
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addingToFavorites, setAddingToFavorites] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Daha sonra al listesi alınamadı");
      const data = await res.json();
      setWishlist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId: string, productId: string) => {
    setRemoving(wishlistId);
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Ürün listeden çıkarılamadı");
      setWishlist(wishlist.filter(item => item.id !== wishlistId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        // Modern toast notification yerine bir animasyon gösterebiliriz
        const button = document.querySelector(`[data-cart-product-id="${productId}"]`);
        if (button) {
          button.classList.add('animate-pulse');
          setTimeout(() => button.classList.remove('animate-pulse'), 1000);
        }
      }
    } catch (err) {
      alert("Sepete eklenirken hata oluştu");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleAddToFavorites = async (productId: string) => {
    setAddingToFavorites(productId);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        // Modern toast notification yerine bir animasyon gösterebiliriz
        const button = document.querySelector(`[data-fav-product-id="${productId}"]`);
        if (button) {
          button.classList.add('animate-pulse');
          setTimeout(() => button.classList.remove('animate-pulse'), 1000);
        }
      }
    } catch (err) {
      alert("Favorilere eklenirken hata oluştu");
    } finally {
      setAddingToFavorites(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Bugün";
    if (diffInDays === 1) return "Dün";
    if (diffInDays < 7) return diffInDays + " gün önce";
    if (diffInDays < 30) return Math.floor(diffInDays / 7) + " hafta önce";
    return Math.floor(diffInDays / 30) + " ay önce";
  };

  return (
    <div>
      <Header />
      
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzYzNzNGRiIgZmlsbC1vcGFjaXR5PSIwLjA1Ij4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPgo8L2c+CjwvZz4KPC9zdmc+')] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        {/* Floating Clock Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-slow"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 4 + 's',
                animationDuration: (4 + Math.random() * 3) + 's'
              }}
            >
              <Clock className="w-3 h-3 text-indigo-400/15" />
            </div>
          ))}
        </div>
        {/* Floating Bookmark Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: (3 + Math.random() * 2) + 's'
              }}
            >
              <Bookmark className="w-4 h-4 text-blue-400/20 fill-current" />
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for floating animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(90deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>

      <main className="relative min-h-screen pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li><a href="/" className="hover:text-white transition-colors">Ana Sayfa</a></li>
              <li>/</li>
              <li><a href="/profile" className="hover:text-white transition-colors">Profil</a></li>
              <li>/</li>
              <li className="text-white">Daha Sonra Al</li>
            </ol>
          </nav>

          {/* Header Section */}
          <div className="mb-12">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
                    <Timer className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Daha Sonra Al</h1>
                    <p className="text-white/70">Zamanınız olmadığında buraya kaydedin</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                    <Package className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">{wishlist.length} ürün</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-indigo-500/20 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4 text-indigo-300" />
                    <span className="text-sm text-indigo-300">Zamanında Hatırla</span>
                  </div>
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
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" style={{ animationDuration: '0.8s' }}></div>
                </div>
                <p className="mt-6 text-white/80 text-lg">Daha sonra al listesi yükleniyor...</p>
                <p className="mt-2 text-white/60 text-sm">Lütfen bekleyiniz</p>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6 backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/30 rounded-full">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-24">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl inline-block">
                <div className="mb-6">
                  <div className="p-4 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 rounded-full inline-block">
                    <Clock className="w-16 h-16 text-white/60" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Daha Sonra Al Listesi Boş</h3>
                <p className="text-white/70 text-lg mb-6">Henüz daha sonra al listesinde ürününüz yok. Keşfetmeye başlayın!</p>
                <a 
                  href="/products" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full font-medium hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Ürünleri Keşfet
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item, index) => {
                const images = JSON.parse(item.product.images || "[]");
                const image = images[0] || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop";
                const discount = item.product.originalPrice && item.product.originalPrice > item.product.price
                  ? Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)
                  : 0;

                return (
                  <div 
                    key={item.id} 
                    className="backdrop-blur-xl bg-white/10 rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:shadow-3xl group hover:-translate-y-1"
                    style={{ animationDelay: (index * 0.1) + 's' }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={image}
                        alt={item.product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          <Zap className="w-3 h-3 inline mr-1" />
                          %{discount} İndirim
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id, item.product.id)}
                        disabled={removing === item.id}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all duration-300 hover:scale-110"
                      >
                        {removing === item.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>

                      {/* Quick View Button */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a
                          href={`/product/${item.product.id}`}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </div>

                      {/* Time Badge */}
                      <div className="absolute bottom-4 left-4 bg-indigo-500/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full shadow-lg">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {getTimeAgo(item.createdAt)}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-white mb-3 line-clamp-2 text-lg group-hover:text-white/90 transition-colors">
                        {item.product.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < 4 ? 'text-yellow-400 fill-current' : 'text-white/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-white/60 ml-2">(4.0) • 89 değerlendirme</span>
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl font-bold text-white">₺{item.product.price.toFixed(2)}</span>
                        {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                          <span className="text-sm text-white/50 line-through">
                            ₺{item.product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="space-y-2 mb-4">
                        <button
                          onClick={() => handleAddToCart(item.product.id)}
                          disabled={addingToCart === item.product.id}
                          data-cart-product-id={item.product.id}
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 px-4 rounded-full text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            {addingToCart === item.product.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            <span>{addingToCart === item.product.id ? "Ekleniyor..." : "Sepete Ekle"}</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleAddToFavorites(item.product.id)}
                          disabled={addingToFavorites === item.product.id}
                          data-fav-product-id={item.product.id}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-full text-sm font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            {addingToFavorites === item.product.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Heart className="h-4 w-4" />
                            )}
                            <span>{addingToFavorites === item.product.id ? "Ekleniyor..." : "Favorilere Ekle"}</span>
                          </div>
                        </button>
                        <a
                          href={`/product/${item.product.id}`}
                          className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-full text-sm font-medium hover:bg-white/20 transition-all duration-300 text-center border border-white/20 hover:border-white/30 block"
                        >
                          Detaylı İncele
                        </a>
                      </div>
                      
                      {/* Date Info */}
                      <div className="flex items-center justify-between text-xs text-white/60 bg-white/5 px-3 py-2 rounded-full">
                        <span>Eklenme: {getTimeAgo(item.createdAt)}</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
