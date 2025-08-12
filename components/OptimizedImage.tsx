'use client'

import { useState } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  sizes?: string
  quality?: number
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 400,
  priority = false,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  quality = 85,
  onError
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Validate image URL
  const isValidImage = src && (src.startsWith('http') || src.startsWith('/')) && !src.startsWith('data:')

  if (!isValidImage || error) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Resim Yüklenemedi</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        priority={priority}
        className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
          onError?.()
        }}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
      />
    </div>
  )
}
