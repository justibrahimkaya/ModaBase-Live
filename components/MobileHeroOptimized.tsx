'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Sparkles, ShoppingBag, Gift, TrendingUp, Zap } from 'lucide-react'

export default function MobileHeroOptimized() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = [
    {
      id: 1,
      title: "Yeni Koleksiyon",
      subtitle: "2025 İlkbahar",
      description: "Trend parçalarla stilini tamamla",
      cta: "Koleksiyonu Keşfet",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center",
      color: "from-purple-600 to-pink-600"
    },
    {
      id: 2,
      title: "Özel İndirim",
      subtitle: "%50'ye Varan",
      description: "Sınırlı süre fırsatlar",
      cta: "Fırsatları Gör",
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop&crop=center",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 3,
      title: "Ücretsiz Kargo",
      subtitle: "2500₺ Üzeri",
      description: "Hızlı ve güvenli teslimat",
      cta: "Alışverişe Başla",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center",
      color: "from-green-500 to-emerald-500"
    }
  ]

  // Auto slide change
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    
    return () => clearInterval(timer)
  }, [slides.length])

  const currentSlideData = slides[currentSlide] || slides[0]

  if (!currentSlideData) {
    return null
  }

  return (
    <section className="relative h-screen max-h-[700px] min-h-[500px] overflow-hidden bg-gray-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={currentSlideData?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center"}
          alt={currentSlideData?.title || "Hero Image"}
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData?.color || 'from-purple-600 to-pink-600'} opacity-30`}></div>
      </div>
      
      {/* Content */}
      <div className="relative h-full flex items-center px-4 sm:px-6">
        <div className="w-full max-w-sm mx-auto text-center text-white">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              Özel Teklif
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 leading-tight">
            {currentSlideData?.title}
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-yellow-400">
            {currentSlideData?.subtitle}
          </h2>
          
          {/* Description */}
          <p className="text-lg mb-8 text-white/90 leading-relaxed">
            {currentSlideData?.description}
          </p>
          
          {/* CTA Button */}
          <a 
            href="/products"
            className={`
              inline-flex items-center justify-center w-full max-w-xs gap-3 px-8 py-4 
              bg-gradient-to-r ${currentSlideData?.color || 'from-purple-600 to-pink-600'} text-white font-semibold 
              rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
              transform hover:scale-105 touch-manipulation
            `}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{currentSlideData?.cta}</span>
            <ArrowRight className="w-5 h-5" />
          </a>
          
          {/* Quick Action Buttons */}
          <div className="flex gap-3 mt-6 justify-center">
            <a
              href="/products?discount=true"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-all"
            >
              <Gift className="w-4 h-4" />
              Fırsatlar
            </a>
            <a
              href="/products?new=true"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-all"
            >
              <Zap className="w-4 h-4" />
              Yeni
            </a>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white w-6' 
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>
      
      {/* Quick Stats - Mobile Optimized */}
      <div className="absolute bottom-20 left-4 right-4">
        <div className="grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="text-center">
            <TrendingUp className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-white font-bold text-sm">500+</div>
            <div className="text-white/70 text-xs">Marka</div>
          </div>
          <div className="text-center">
            <ShoppingBag className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-white font-bold text-sm">50K+</div>
            <div className="text-white/70 text-xs">Müşteri</div>
          </div>
          <div className="text-center">
            <Sparkles className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-white font-bold text-sm">24/7</div>
            <div className="text-white/70 text-xs">Destek</div>
          </div>
        </div>
      </div>
    </section>
  )
} 