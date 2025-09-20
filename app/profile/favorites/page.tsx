"use client"

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Star, Trash2, Package, ArrowRight, Zap, Gift, Eye, Plus } from "lucide-react";

interface Favorite {
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

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Favoriler alınamadı");
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string, productId: string) => {
    setRemoving(favoriteId);
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Favori çıkarılamadı");
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
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
        const button = document.querySelector(`[data-product-id="${productId}"]`);
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
      <div className="fixed inset-0 bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iI0ZGNjk5NCIgZmlsbC1vcGFjaXR5PSIwLjA1Ij4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPgo8L2c+CjwvZz4KPC9zdmc+')] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        {/* Floating Hearts Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 2 + 's',
                animationDuration: (3 + Math.random() * 2) + 's'
              }}
            >
              <Heart className="w-4 h-4 text-pink-400/20 fill-current" />
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
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
              <li className="text-white">Favoriler</li>
            </ol>
          </nav>

          {/* Header Section */}
          <div className="mb-12">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg">
                    <Heart className="w-8 h-8 text-white fill-current" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Favorilerim</h1>
                    <p className="text-white/70">Beğendiğiniz ürünleri takip edin</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                    <Package className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">{favorites.length} ürün</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-pink-500/20 px-4 py-2 rounded-full">
                    <Gift className="w-4 h-4 text-pink-300" />
                    <span className="text-sm text-pink-300">Premium Favori</span>
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
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-400 animate-spin" style={{ animationDuration: '0.8s' }}></div>
                </div>
                <p className="mt-6 text-white/80 text-lg">Favoriler yükleniyor...</p>
                <p className="mt-2 text-white/60 text-sm">Lütfen bekleyiniz</p>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6 backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/30 rounded-full">
                  <Heart className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-24">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl inline-block">
                <div className="mb-6">
                  <div className="p-4 bg-gradient-to-r from-pink-500/30 to-rose-500/30 rounded-full inline-block">
                    <Heart className="w-16 h-16 text-white/60" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Favori Listeniz Boş</h3>
                <p className="text-white/70 text-lg mb-6">Henüz favori ürününüz yok. Keşfetmeye başlayın!</p>
                <a 
                  href="/products" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Ürünleri Keşfet
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite, index) => {
                const images = JSON.parse(favorite.product.images || "[]");
                const image = images[0] || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop";
                const discount = favorite.product.originalPrice && favorite.product.originalPrice > favorite.product.price
                  ? Math.round(((favorite.product.originalPrice - favorite.product.price) / favorite.product.originalPrice) * 100)
                  : 0;

                return (
                  <div 
                    key={favorite.id} 
                    className="backdrop-blur-xl bg-white/10 rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:shadow-3xl group hover:-translate-y-1"
                    style={{ animationDelay: (index * 0.1) + 's' }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={image}
                        alt={favorite.product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          <Zap className="w-3 h-3 inline mr-1" />
                          %{discount} İndirim
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFavorite(favorite.id, favorite.product.id)}
                        disabled={removing === favorite.id}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all duration-300 hover:scale-110"
                      >
                        {removing === favorite.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>

                      {/* Quick View Button */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a
                          href={`/product/${favorite.product.id}`}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-white mb-3 line-clamp-2 text-lg group-hover:text-white/90 transition-colors">
                        {favorite.product.name}
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
                        <span className="text-sm text-white/60 ml-2">(4.0) • 127 değerlendirme</span>
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl font-bold text-white">₺{favorite.product.price.toFixed(2)}</span>
                        {favorite.product.originalPrice && favorite.product.originalPrice > favorite.product.price && (
                          <span className="text-sm text-white/50 line-through">
                            ₺{favorite.product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 mb-4">
                        <button
                          onClick={() => handleAddToCart(favorite.product.id)}
                          disabled={addingToCart === favorite.product.id}
                          data-product-id={favorite.product.id}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 px-4 rounded-full text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            {addingToCart === favorite.product.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            <span>{addingToCart === favorite.product.id ? "Ekleniyor..." : "Sepete Ekle"}</span>
                          </div>
                        </button>
                        <a
                          href={`/product/${favorite.product.id}`}
                          className="flex-1 bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-full text-sm font-medium hover:bg-white/20 transition-all duration-300 text-center border border-white/20 hover:border-white/30"
                        >
                          Detaylar
                        </a>
                      </div>
                      
                      {/* Date Info */}
                      <div className="flex items-center justify-between text-xs text-white/60 bg-white/5 px-3 py-2 rounded-full">
                        <span>Eklenme: {getTimeAgo(favorite.createdAt)}</span>
                        <span>{formatDate(favorite.createdAt)}</span>
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
