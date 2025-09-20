'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  // Eğer resim yoksa varsayılan resim kullan - Güvenli kontrol
  const productImages = (images && Array.isArray(images) && images.length > 0) ? images.map((src, index) => ({
    id: index,
    src: (src && (src.startsWith('data:') || src.startsWith('http') || src.startsWith('/'))) ? src : '/default-product.svg',
    alt: `Ürün Görseli ${index + 1}`
  })) : [{
    id: 0,
    src: '/default-product.svg',
    alt: 'Varsayılan Ürün Görseli'
  }]

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={productImages[selectedImage]?.src || productImages[0]?.src}
            alt={productImages[selectedImage]?.alt || productImages[0]?.alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-product.svg';
            }}
          />
        </div>
        
        {/* Zoom Button */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <ZoomIn className="h-5 w-5 text-gray-600" />
        </button>

        {/* Navigation Arrows */}
        {productImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {productImages.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {selectedImage + 1} / {productImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {productImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {productImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImage === index
                  ? 'border-primary-600 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-product.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={productImages[selectedImage]?.src || productImages[0]?.src}
              alt={productImages[selectedImage]?.alt || productImages[0]?.alt}
              className="w-full h-auto max-h-[90vh] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-product.svg';
              }}
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
