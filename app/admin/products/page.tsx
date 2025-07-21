'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  X, 
  CheckCircle, 
  Package,
  Upload,
  Search,
  Eye,
  Image as ImageIcon,
  AlertCircle,
  AlertTriangle,
  DollarSign,
  Package2,
  Grid,
  List,
  RefreshCw,
  Filter,
  Star,
  TrendingUp,
  BarChart3,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import SEOGenerator from '@/components/SEOGenerator'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  images: string
  stock: number
  minStockLevel: number
  maxStockLevel?: number
  categoryId: string
  category?: { name: string }
  variants?: ProductVariant[]
  createdAt?: string
  updatedAt?: string
}

interface ProductVariant {
  id?: string
  size?: string
  color?: string
  colorCode?: string
  stock: number
  price?: number
  sku?: string
  isActive?: boolean
}

interface Category {
  id: string
  name: string
}

const initialForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  originalPrice: '',
  images: [] as string[],
  stock: '',
  minStockLevel: '5',
  maxStockLevel: '',
  categoryId: '',
  variants: [] as ProductVariant[],
  // SEO alanları
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  altText: ''
}

const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
const commonColors = [
  { name: 'Kırmızı', code: '#FF0000' },
  { name: 'Mavi', code: '#0000FF' },
  { name: 'Yeşil', code: '#008000' },
  { name: 'Siyah', code: '#000000' },
  { name: 'Beyaz', code: '#FFFFFF' },
  { name: 'Gri', code: '#808080' },
  { name: 'Sarı', code: '#FFFF00' },
  { name: 'Pembe', code: '#FFC0CB' },
  { name: 'Turuncu', code: '#FFA500' },
  { name: 'Mor', code: '#800080' },
  { name: 'Kahverengi', code: '#A52A2A' },
  { name: 'Lacivert', code: '#000080' }
]

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [imageUploading, setImageUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch {}
  }

  const filterProducts = () => {
    let filtered = products
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }
    
    setFilteredProducts(filtered)
  }

  const openModal = (product?: Product) => {
    setError('')
    setSuccess('')
    if (product) {
      setEditId(product.id)
      setForm({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        images: JSON.parse(product.images || '[]'),
        stock: product.stock.toString(),
        minStockLevel: product.minStockLevel?.toString() || '5',
        maxStockLevel: product.maxStockLevel?.toString() || '',
        categoryId: product.categoryId,
        variants: product.variants || []
      })
    } else {
      setEditId(null)
      setForm(initialForm)
    }
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditId(null)
    setForm(initialForm)
    setError('')
    setSuccess('')
  }

  const handleFormChange = (e: any) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      setForm((prev: any) => ({ ...prev, slug }))
    }
  }

  const handleSEOGenerated = (seoData: any) => {
    setForm((prev: any) => ({
      ...prev,
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      keywords: seoData.keywords.join(', '),
      altText: seoData.altText,
      slug: seoData.urlSlug
    }))
  }

  const handleImageUpload = async (files: FileList | File[]) => {
    setImageUploading(true)
    try {
      const fileArray = Array.from(files)
      const newImages: string[] = []
      
      // Maksimum fotoğraf sayısı kontrolü
      if (form.images.length + fileArray.length > 8) {
        setError(`En fazla 8 fotoğraf yükleyebilirsiniz. Şu anda ${form.images.length} fotoğraf var.`)
        setImageUploading(false)
        return
      }
      
      for (const file of fileArray) {
        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
          setError('Sadece resim dosyaları yükleyebilirsiniz.')
          continue
        }
        
        // Dosya boyutu kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} dosyası çok büyük. Maksimum 5MB olmalıdır.`)
          continue
        }
        
        // Desteklenen format kontrolü
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          setError(`${file.name} formatı desteklenmiyor. Sadece JPG, PNG ve WebP formatları kabul edilir.`)
          continue
        }
        
          // Convert to base64 for demo purposes
          const reader = new FileReader()
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = (e) => {
              resolve(e.target?.result as string)
            }
            reader.readAsDataURL(file)
          })
          
          const base64 = await base64Promise
          newImages.push(base64)
      }
      
      if (newImages.length > 0) {
      setForm({ ...form, images: [...form.images, ...newImages] })
        setError('') // Başarılı yüklemede hata mesajını temizle
      }
    } catch (error) {
      setError('Fotoğraflar yüklenirken hata oluştu')
    } finally {
      setImageUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = form.images.filter((_: any, i: number) => i !== index)
    setForm({ ...form, images: newImages })
  }

  // Ana fotoğraf yapma fonksiyonu
  const makeMainImage = (index: number) => {
    if (index === 0) return // Zaten ana fotoğraf
    
    const newImages = [...form.images]
    const mainImage = newImages[index]
    newImages.splice(index, 1) // Seçilen fotoğrafı kaldır
    newImages.unshift(mainImage) // Başa ekle
    setForm({ ...form, images: newImages })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Maksimum fotoğraf sayısı kontrolü
    if (form.images.length >= 8) {
      setError('Maksimum fotoğraf sayısına ulaştınız. Daha fazla fotoğraf eklemek için mevcut fotoğrafları silin.')
      return
    }
    
    const files = Array.from(e.dataTransfer.files)
    handleImageUpload(files)
  }

  // Variant management functions
  const addVariant = () => {
    const newVariant: ProductVariant = {
      size: '',
      color: '',
      colorCode: '',
      stock: 0,
      price: 0,
      sku: '',
      isActive: true
    }
    setForm({ ...form, variants: [...form.variants, newVariant] })
  }

  const removeVariant = (index: number) => {
    const newVariants = form.variants.filter((_: any, i: number) => i !== index)
    setForm({ ...form, variants: newVariants })
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...form.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setForm({ ...form, variants: newVariants })
  }

  const addSizeVariants = (selectedSizes: string[]) => {
    const newVariants = selectedSizes.map(size => ({
      size,
      color: '',
      colorCode: '',
      stock: 0,
      price: 0,
      sku: '',
      isActive: true
    }))
    setForm({ ...form, variants: [...form.variants, ...newVariants] })
  }

  const addColorVariants = (selectedColors: { name: string; code: string }[]) => {
    const newVariants = selectedColors.map(color => ({
      size: '',
      color: color.name,
      colorCode: color.code,
      stock: 0,
      price: 0,
      sku: '',
      isActive: true
    }))
    setForm({ ...form, variants: [...form.variants, ...newVariants] })
  }

  const handleSave = async (e: any) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      // Minimum fotoğraf kontrolü
      if (form.images.length === 0) {
        setError('En az 1 fotoğraf yüklemelisiniz.')
        setSaving(false)
        return
      }
      
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        images: JSON.stringify(form.images),
        stock: parseInt(form.stock, 10),
        minStockLevel: parseInt(form.minStockLevel, 10),
        maxStockLevel: form.maxStockLevel ? parseInt(form.maxStockLevel, 10) : undefined,
        categoryId: form.categoryId,
        variants: form.variants.map((variant: ProductVariant) => ({
          ...variant,
          stock: parseInt(variant.stock?.toString() || '0', 10),
          price: variant.price ? parseFloat(variant.price.toString()) : undefined
        }))
      }
      
      let response
      if (editId) {
        response = await fetch(`/api/admin/products/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'İşlem başarısız')
      }
      
      setSuccess('Ürün başarıyla kaydedildi!')
      fetchProducts()
      setTimeout(() => closeModal(), 1000)
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    
    setDeleteId(id)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Silinemedi')
      }
      
      setSuccess('Ürün başarıyla silindi!')
      fetchProducts()
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setDeleteId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedProducts.length} ürünü silmek istediğinizden emin misiniz?`)) return
    
    try {
      for (const id of selectedProducts) {
        await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      }
      setSuccess('Seçilen ürünler silindi!')
      setSelectedProducts([])
      fetchProducts()
    } catch (error) {
      setError('Toplu silme işlemi başarısız')
    }
  }

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    )
  }

  const getStockStatus = (stock: number, minStockLevel: number) => {
    if (stock === 0) return { status: 'out', color: 'text-red-600 bg-red-50', text: 'Stok Yok' }
    if (stock <= minStockLevel) return { status: 'low', color: 'text-yellow-600 bg-yellow-50', text: 'Kritik Seviye' }
    return { status: 'ok', color: 'text-green-600 bg-green-50', text: 'Stokta' }
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const images = JSON.parse(product.images || '[]')
    const stockStatus = getStockStatus(product.stock, product.minStockLevel)
    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
    const totalVariants = product.variants?.length || 0
    
    return (
      <div className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
          {images.length > 0 ? (
            <div className="relative h-full">
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  +{images.length - 1}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </div>
          )}
          
          {/* Variants Badge */}
          {totalVariants > 0 && (
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {totalVariants} varyant
            </div>
          )}
          
          {/* Stock Status */}
          <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.text}
          </div>
          
          {/* Quick Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => openModal(product)}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewImage(images[0])}
                className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                disabled={deleteId === product.id}
              >
                {deleteId === product.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {product.name}
            </h3>
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => toggleProductSelection(product.id)}
              className="text-blue-500 focus:ring-blue-500 rounded"
            />
          </div>
          
          <div className="text-xs text-gray-500 mb-2">
            {product.category?.name}
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₺{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₺{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Package2 className="w-3 h-3" />
              Stok: {product.stock}
            </span>
            <span>ID: {product.id.slice(-6)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Ultra Modern Header */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <Sparkles className="h-3 w-3 text-white animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Ürün Yönetimi
                </h1>
                <p className="text-lg text-gray-300 mt-1">
                  <span className="font-semibold text-blue-300">{filteredProducts.length} ürün</span> • 
                  <span className="font-semibold text-red-300 ml-1">{products.filter(p => p.stock === 0).length} stok bitti</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="group relative flex items-center px-4 py-3 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
                {viewMode === 'grid' ? 'Liste' : 'Izgara'}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                onClick={fetchProducts}
                className="group relative flex items-center px-4 py-3 text-sm font-medium text-blue-300 bg-blue-500/20 border border-blue-400/40 rounded-xl hover:text-blue-200 hover:bg-blue-500/30 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                onClick={() => openModal()}
                className="group relative flex items-center px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ürün
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
                  <Package2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-400 text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12%
                  </div>
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">Toplam Ürün</h3>
              <p className="text-3xl font-bold text-white">{products.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-400 text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8%
                  </div>
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">Aktif Kategoriler</h3>
              <p className="text-3xl font-bold text-white">{categories.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-orange-400 text-sm">
                    Dikkat!
                  </div>
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">Düşük Stok</h3>
              <p className="text-3xl font-bold text-white">{products.filter(p => p.stock <= p.minStockLevel).length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">
                    Toplam
                  </div>
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">Ürün Değeri</h3>
              <p className="text-3xl font-bold text-white">₺{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}</p>
            </div>
          </div>
          
          {/* Modern Filters */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ürün adı veya açıklama ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[200px]"
                  >
                    <option value="" className="text-gray-900">Tüm Kategoriler</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="text-gray-900">{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                {selectedProducts.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="group relative flex items-center px-4 py-4 text-sm font-medium text-red-300 bg-red-500/20 border border-red-400/40 rounded-xl hover:text-red-200 hover:bg-red-500/30 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Seçilenleri Sil ({selectedProducts.length})
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/10">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-gray-300">Ürünler yükleniyor...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm || selectedCategory ? 'Arama sonucu bulunamadı' : 'Henüz ürün yok'}
              </h3>
              <p className="text-gray-300 mb-4">
                {searchTerm || selectedCategory ? 'Arama kriterlerinizi değiştirin' : 'İlk ürünü ekleyerek başlayın'}
              </p>
              {!searchTerm && !selectedCategory && (
                <button
                  onClick={() => openModal()}
                  className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl"
                >
                  Ürün Ekle
                </button>
              )}
            </div>
          ) : (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
        
        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <form className="p-6 space-y-8" onSubmit={handleSave}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ürün Adı *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Ürün adını girin"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          URL Slug *
                        </label>
                        <input
                          type="text"
                          name="slug"
                          value={form.slug}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="url-slug-format"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleFormChange}
                          rows={4}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Ürün açıklamasını girin"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Kategori *
                        </label>
                        <select
                          name="categoryId"
                          value={form.categoryId}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          required
                        >
                          <option value="">Kategori Seçin</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fiyat ve Stok</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Satış Fiyatı *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              name="price"
                              value={form.price}
                              onChange={handleFormChange}
                              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Eski Fiyat (İndirim)
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              name="originalPrice"
                              value={form.originalPrice}
                              onChange={handleFormChange}
                              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Stok Miktarı *
                          </label>
                          <div className="relative">
                            <Package2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              name="stock"
                              value={form.stock}
                              onChange={handleFormChange}
                              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="0"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Min. Stok Seviyesi
                          </label>
                          <input
                            type="number"
                            name="minStockLevel"
                            value={form.minStockLevel}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="5"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Images */}
                <div className="space-y-6">
                  {/* SEO Section */}
                  <SEOGenerator
                    productName={form.name}
                    category={categories.find(cat => cat.id === form.categoryId)?.name || ''}
                    brand="ModaBase"
                    {...(parseFloat(form.price) > 0 && { price: parseFloat(form.price) })}
                    {...(form.description && { description: form.description })}
                    onSEOGenerated={handleSEOGenerated}
                  />
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Ürün Fotoğrafları</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          form.images.length === 0 
                            ? 'bg-red-100 text-red-700' 
                            : form.images.length >= 8 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {form.images.length}/8
                        </span>
                        {form.images.length === 0 && (
                          <span className="text-red-600 text-xs">* Zorunlu</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Image Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                        form.images.length >= 8 
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => {
                        if (form.images.length < 8) {
                          document.getElementById('image-upload')?.click()
                        }
                      }}
                    >
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      />
                      
                      {imageUploading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                          <span className="ml-2 text-gray-600">Yükleniyor...</span>
                        </div>
                      ) : form.images.length >= 8 ? (
                        <div>
                          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Maksimum fotoğraf sayısına ulaştınız
                          </p>
                          <p className="text-sm text-gray-500">
                            Daha fazla fotoğraf eklemek için mevcut fotoğrafları silin
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Fotoğrafları buraya sürükleyin veya tıklayın
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            JPG, PNG, WebP formatları desteklenir (Maks. 5MB)
                          </p>
                          <p className="text-xs text-gray-400">
                            {8 - form.images.length} fotoğraf daha ekleyebilirsiniz
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Image Preview Grid */}
                    {form.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {form.images.map((image: string, index: number) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={image}
                                alt={`Product ${index + 1}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(image)}
                                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                                  title="Büyüt"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {index !== 0 && (
                                  <button
                                    type="button"
                                    onClick={() => makeMainImage(index)}
                                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                                    title="Ana Fotoğraf Yap"
                                  >
                                    <Star className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                Ana Fotoğraf
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Variants Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ürün Varyantları</h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Varyant Ekle
                  </button>
                </div>
                
                {/* Quick Add Buttons */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hızlı Beden Ekleme</label>
                    <select
                      multiple
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value)
                        addSizeVariants(selected)
                      }}
                    >
                      {commonSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hızlı Renk Ekleme</label>
                    <select
                      multiple
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => {
                          const color = commonColors.find(c => c.name === option.value)
                          return color || { name: option.value, code: '' }
                        })
                        addColorVariants(selected)
                      }}
                    >
                      {commonColors.map(color => (
                        <option key={color.name} value={color.name}>{color.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Variants List */}
                <div className="space-y-3">
                  {form.variants.map((variant: ProductVariant, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Beden</label>
                          <input
                            type="text"
                            value={variant.size || ''}
                            onChange={(e) => updateVariant(index, 'size', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="S, M, L, 38..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Renk</label>
                          <input
                            type="text"
                            value={variant.color || ''}
                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Kırmızı, Mavi..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Renk Kodu</label>
                          <input
                            type="color"
                            value={variant.colorCode || '#000000'}
                            onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                            className="w-full h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Stok</label>
                          <input
                            type="number"
                            value={variant.stock || 0}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Fiyat</label>
                          <input
                            type="number"
                            value={variant.price || ''}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            step="0.01"
                            min="0"
                            placeholder="Farklı fiyat"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{error}</span>
                      <button
                        type="button"
                        onClick={() => setError('')}
                        className="ml-2 text-red-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{success}</span>
                      <button
                        type="button"
                        onClick={() => setSuccess('')}
                        className="ml-2 text-green-400 hover:text-green-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {editId ? 'Güncelle' : 'Kaydet'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <Image
              src={previewImage}
              alt="Preview"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
