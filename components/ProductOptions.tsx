'use client'

import { Minus, Plus } from 'lucide-react'

interface ProductVariant {
  id: string
  productId: string
  size: string | null
  color: string | null
  colorCode: string | null
  stock: number
  price: number | null
  sku: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface ProductOptionsProps {
  variants: ProductVariant[]
  selectedSize: string
  setSelectedSize: (size: string) => void
  selectedColor: string
  setSelectedColor: (color: string) => void
  quantity: number
  setQuantity: (quantity: number) => void
}

// Standart beden listesi
const allSizes = [
  { id: 'xs', name: 'XS' },
  { id: 's', name: 'S' },
  { id: 'm', name: 'M' },
  { id: 'l', name: 'L' },
  { id: 'xl', name: 'XL' },
  { id: 'xxl', name: 'XXL' }
]

// Standart renk listesi
const allColors = [
  { id: 'blue', name: 'Mavi', hex: '#3b82f6' },
  { id: 'red', name: 'Kırmızı', hex: '#ef4444' },
  { id: 'green', name: 'Yeşil', hex: '#10b981' },
  { id: 'yellow', name: 'Sarı', hex: '#f59e0b' },
  { id: 'black', name: 'Siyah', hex: '#000000' },
  { id: 'white', name: 'Beyaz', hex: '#ffffff' }
]

export default function ProductOptions({
  variants,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  quantity,
  setQuantity
}: ProductOptionsProps) {
  // Mevcut varyantlardan bedenleri çıkar
  const availableSizes = allSizes.map(size => ({
    ...size,
    available: variants.some(v => v.size?.toLowerCase() === size.id && v.stock > 0)
  }))

  // Mevcut varyantlardan renkleri çıkar
  const availableColors = allColors.map(color => ({
    ...color,
    available: variants.some(v => v.color?.toLowerCase() === color.id && v.stock > 0)
  }))

  // Seçili varyantın stok miktarını bul
  const selectedVariant = variants.find(v => 
    v.size?.toLowerCase() === selectedSize && 
    v.color?.toLowerCase() === selectedColor
  )

  const increaseQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
    setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Beden</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700">
            Beden tablosu
          </button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {availableSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => size.available && setSelectedSize(size.id)}
              disabled={!size.available}
              className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                selectedSize === size.id
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : size.available
                  ? 'border-gray-300 hover:border-gray-400 text-gray-700'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {size.name}
            </button>
          ))}
        </div>
        {selectedSize && (
          <p className="text-sm text-green-600 mt-2">
            ✓ {availableSizes.find(s => s.id === selectedSize)?.name} bedeni seçildi
          </p>
        )}
      </div>

      {/* Color Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Renk</h3>
        <div className="flex space-x-3">
          {availableColors.map((color) => (
            <button
              key={color.id}
              onClick={() => color.available && setSelectedColor(color.id)}
              disabled={!color.available}
              className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                selectedColor === color.id
                  ? 'border-primary-600 ring-2 ring-primary-200'
                  : color.available
                  ? 'border-gray-300 hover:border-gray-400'
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {!color.available && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-0.5 bg-gray-400 rotate-45"></div>
                </div>
              )}
            </button>
          ))}
        </div>
        {selectedColor && (
          <p className="text-sm text-green-600 mt-2">
            ✓ {availableColors.find(c => c.id === selectedColor)?.name} rengi seçildi
          </p>
        )}
      </div>

      {/* Quantity Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Adet</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-16 text-center font-medium text-gray-900">
            {quantity}
          </span>
          <button
            onClick={increaseQuantity}
            disabled={selectedVariant ? quantity >= selectedVariant.stock : false}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {selectedVariant 
            ? `Stokta ${selectedVariant.stock} adet kaldı`
            : 'Beden ve renk seçiniz'
          }
        </p>
      </div>

      {/* Selection Summary */}
      {(selectedSize || selectedColor) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Seçimleriniz</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {selectedSize && (
              <p>Beden: {availableSizes.find(s => s.id === selectedSize)?.name}</p>
            )}
            {selectedColor && (
              <p>Renk: {availableColors.find(c => c.id === selectedColor)?.name}</p>
            )}
            <p>Adet: {quantity}</p>
            {selectedVariant && (
              <p className="text-green-600 font-medium">
                Stok: {selectedVariant.stock} adet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
