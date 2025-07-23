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



export default function ProductOptions({
  variants,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  quantity,
  setQuantity
}: ProductOptionsProps) {
  // Varyantlardan gerçek bedenleri çıkar
  const availableSizes = variants
    .filter(v => v.size && v.stock > 0)
    .map(v => v.size!)
    .filter((size, index, arr) => arr.indexOf(size) === index) // Tekrarları kaldır
    .sort()

  // Varyantlardan gerçek renkleri çıkar
  const availableColors = variants
    .filter(v => v.color && v.stock > 0)
    .map(v => ({
      name: v.color!,
      code: v.colorCode || '',
      hex: v.colorCode || '#cccccc' // Varsayılan renk
    }))
    .filter((color, index, arr) => arr.findIndex(c => c.name === color.name) === index) // Tekrarları kaldır

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
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                selectedSize === size
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {selectedSize && (
          <p className="text-sm text-green-600 mt-2">
            ✓ {selectedSize} bedeni seçildi
          </p>
        )}
      </div>

      {/* Color Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Renk</h3>
        <div className="flex space-x-3">
          {availableColors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                selectedColor === color.name
                  ? 'border-primary-600 ring-2 ring-primary-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
            </button>
          ))}
        </div>
        {selectedColor && (
          <p className="text-sm text-green-600 mt-2">
            ✓ {selectedColor} rengi seçildi
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
              <p>Beden: {selectedSize}</p>
            )}
            {selectedColor && (
              <p>Renk: {selectedColor}</p>
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
