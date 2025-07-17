'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: {
    name: string
  }
}

interface ProductDetailsProps {
  product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState('description')

  const tabs = [
    { id: 'description', label: 'Açıklama' },
    { id: 'specifications', label: 'Özellikler' },
    { id: 'care', label: 'Bakım' },
    { id: 'size-guide', label: 'Beden Tablosu' }
  ]

  const tabContent = {
    description: (
      <div className="space-y-4 text-gray-600">
        <p>
          {product.description}
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Rahat ve şık tasarım</li>
          <li>Günlük kullanım için ideal</li>
          <li>Kaliteli kumaş</li>
          <li>Uzun ömürlü kullanım</li>
          <li>Makinede yıkama uygun</li>
        </ul>
      </div>
    ),
    specifications: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Kategori</span>
              <span className="text-gray-600">{product.category.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Fiyat</span>
              <span className="text-gray-600">₺{product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Kesim</span>
              <span className="text-gray-600">Rahat</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Boy</span>
              <span className="text-gray-600">Standart</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Yıkama</span>
              <span className="text-gray-600">Makinede 30°C</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Ütüleme</span>
              <span className="text-gray-600">Orta sıcaklık</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Üretim</span>
              <span className="text-gray-600">Türkiye</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Garanti</span>
              <span className="text-gray-600">2 Yıl</span>
            </div>
          </div>
        </div>
      </div>
    ),
    care: (
      <div className="space-y-4 text-gray-600">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Yıkama Talimatları</h4>
          <ul className="space-y-1 text-sm">
            <li>• 30°C'de makinede yıkayın</li>
            <li>• Renkli çamaşırlarla yıkayın</li>
            <li>• Ağartıcı kullanmayın</li>
            <li>• Kurutma makinesinde kurutmayın</li>
          </ul>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Ütüleme</h4>
          <ul className="space-y-1 text-sm">
            <li>• Orta sıcaklıkta ütüleyin</li>
            <li>• Ütüleme sırasında buhar kullanabilirsiniz</li>
            <li>• Desenli yüzeyi ütülerken dikkatli olun</li>
          </ul>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Saklama</h4>
          <ul className="space-y-1 text-sm">
            <li>• Kuru ve serin yerde saklayın</li>
            <li>• Direkt güneş ışığından koruyun</li>
            <li>• Askıda saklamak tercih edilir</li>
          </ul>
        </div>
      </div>
    ),
    'size-guide': (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-700">Beden</th>
                <th className="text-left py-2 font-medium text-gray-700">Göğüs (cm)</th>
                <th className="text-left py-2 font-medium text-gray-700">Bel (cm)</th>
                <th className="text-left py-2 font-medium text-gray-700">Kalça (cm)</th>
                <th className="text-left py-2 font-medium text-gray-700">Boy (cm)</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">XS</td>
                <td className="py-2">78-82</td>
                <td className="py-2">60-64</td>
                <td className="py-2">84-88</td>
                <td className="py-2">155-160</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">S</td>
                <td className="py-2">82-86</td>
                <td className="py-2">64-68</td>
                <td className="py-2">88-92</td>
                <td className="py-2">160-165</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">M</td>
                <td className="py-2">86-90</td>
                <td className="py-2">68-72</td>
                <td className="py-2">92-96</td>
                <td className="py-2">165-170</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">L</td>
                <td className="py-2">90-94</td>
                <td className="py-2">72-76</td>
                <td className="py-2">96-100</td>
                <td className="py-2">170-175</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">XL</td>
                <td className="py-2">94-98</td>
                <td className="py-2">76-80</td>
                <td className="py-2">100-104</td>
                <td className="py-2">175-180</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">
          * Ölçüler yaklaşık değerlerdir. Doğru beden seçimi için ölçülerinizi kontrol edin.
        </p>
      </div>
    )
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabContent[activeTab as keyof typeof tabContent]}
      </div>
    </section>
  )
}
