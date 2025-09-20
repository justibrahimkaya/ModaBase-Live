'use client'

import { ShoppingBag } from 'lucide-react'

interface CategoryImageProps {
  image?: string | null
  name: string
}

export default function CategoryImage({ image, name }: CategoryImageProps) {
  if (!image) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ height: '180px' }}>
        <ShoppingBag className="w-12 h-12 text-gray-400" />
      </div>
    )
  }

  return (
    <img
      src={image.startsWith('data:') || image.startsWith('http') || image.startsWith('/') 
        ? image 
        : '/default-product.svg'}
      alt={name}
      className="w-full h-full object-cover"
      style={{ width: '100%', height: '180px' }}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/default-product.svg';
      }}
    />
  )
}
