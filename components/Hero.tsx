'use client'

import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Moda Dünyasını
              <span className="block text-primary-200">Keşfedin</span>
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              En yeni koleksiyonlar, özel indirimler ve trend ürünler ModaBase'de sizleri bekliyor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/products" className="btn-primary flex items-center justify-center">
                Alışverişe Başla
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a href="/products" className="btn-secondary">
                Koleksiyonları İncele
              </a>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm">Marka</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm">Ürün</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-sm">Müşteri</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm">Destek</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-400/30 rounded-full translate-y-16 -translate-x-16"></div>
    </section>
  )
}
