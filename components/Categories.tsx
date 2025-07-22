'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  _count: {
    products: number
  }
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMainCategories()
  }, [])

  const fetchMainCategories = async () => {
    try {
      const response = await fetch('/api/categories?main=true&includeBusiness=true')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kategoriler
            </h2>
            <p className="text-lg text-gray-600">
              İhtiyacınız olan her şeyi bulabileceğiniz geniş kategori seçenekleri
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Kategoriler
          </h2>
          <p className="text-lg text-gray-600">
            İhtiyacınız olan her şeyi bulabileceğiniz geniş kategori seçenekleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <a href={`/products?category=${category.slug}`}>
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'}
                    alt={category.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90 mb-4">{category._count.products} ürün</p>
                  <div className="flex items-center text-sm font-medium hover:text-primary-300 transition-colors">
                    Keşfet
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="/products" className="btn-primary">
            Tüm Kategorileri Görüntüle
          </a>
        </div>
      </div>
    </section>
  )
}
