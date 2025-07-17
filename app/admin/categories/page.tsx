'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, Edit, Trash2, Loader2, X, CheckCircle, Search, 
  Grid, List, Image as ImageIcon, FolderOpen, Tag, 
  TrendingUp, Package, ArrowUp, ArrowDown, RefreshCw, AlertCircle
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  _count?: {
    products: number
  }
}

const initialForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
  parentId: ''
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [mainCategories, setMainCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Yeni state'ler
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'products' | 'created'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [dragOver, setDragOver] = useState(false)

  const stats = {
    total: categories.length,
    withProducts: categories.filter(c => c._count && c._count.products > 0).length,
    empty: categories.filter(c => !c._count || c._count.products === 0).length,
    totalProducts: categories.reduce((sum, c) => sum + (c._count?.products || 0), 0)
  }

  useEffect(() => {
    fetchCategories()
    fetchMainCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchMainCategories = async () => {
    try {
      const response = await fetch('/api/categories?main=true')
      if (response.ok) {
        const data = await response.json()
        setMainCategories(data)
      }
    } catch (error) {
      console.error('Ana kategoriler yüklenirken hata:', error)
    }
  }

  const openModal = (category?: Category) => {
    setError('')
    setSuccess('')
    setImageFile(null)
    setImagePreview('')
    
    if (category) {
      setEditId(category.id)
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || ''
      })
      if (category.image) {
        setImagePreview(category.image)
      }
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
    setImageFile(null)
    setImagePreview('')
  }

  const handleFormChange = (e: any) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    
    // Slug otomatik oluştur
    if (name === 'name') {
      let slug = value.toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      // Eğer slug boş ise varsayılan bir değer ver
      if (!slug) {
        slug = 'kategori-' + Date.now()
      }
      
      setForm((prev: any) => ({ ...prev, slug }))
    }
  }

  const handleImageUpload = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageUpload(files[0] || null)
    }
  }

  const handleSave = async (e: any) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let imageUrl = form.image

      // Resim yükleme
      if (imageFile !== null) {
        const reader = new FileReader()
        reader.onload = async () => {
          const base64 = reader.result as string
          imageUrl = base64

          // Kategori kaydetme
          await saveCategory(imageUrl)
        }
        reader.readAsDataURL(imageFile as File)
      } else {
        await saveCategory(imageUrl)
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
      setSaving(false)
    }
  }

  const saveCategory = async (imageUrl: string) => {
    try {
      const categoryData = { ...form, image: imageUrl }
      let response
      
      if (editId) {
        response = await fetch(`/api/admin/categories/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        })
      } else {
        response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        })
      }
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'İşlem başarısız')
      }
      
      setSuccess('Kategori başarıyla kaydedildi!')
      fetchCategories()
      setTimeout(() => closeModal(), 1000)
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return
    
    setDeleteId(id)
    setError('')
    setSuccess('')
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Silinemedi')
      }
      setSuccess('Kategori silindi!')
      fetchCategories()
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setDeleteId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return
    if (!confirm(`${selectedCategories.length} kategoriyi silmek istediğinizden emin misiniz?`)) return

    setLoading(true)
    try {
      for (const id of selectedCategories) {
        await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      }
      setSuccess(`${selectedCategories.length} kategori silindi!`)
      setSelectedCategories([])
      fetchCategories()
    } catch (err: any) {
      setError('Toplu silme işlemi başarısız')
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'products':
          aValue = a._count?.products || 0
          bValue = b._count?.products || 0
          break
        case 'created':
          aValue = a.id
          bValue = b.id
          break
        default:
          aValue = a.name
          bValue = b.name
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const toggleCategorySelection = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) 
        ? prev.filter(categoryId => categoryId !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-gray-600 mt-1">Ürün kategorilerini yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCategories()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Yeni Kategori
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Toplam Kategori</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Ürünlü Kategori</p>
              <p className="text-2xl font-bold">{stats.withProducts}</p>
            </div>
            <Package className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Boş Kategori</p>
              <p className="text-2xl font-bold">{stats.empty}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Toplam Ürün</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">İsme göre</option>
              <option value="products">Ürün sayısına göre</option>
              <option value="created">Oluşturulma tarihine göre</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCategories.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedCategories.length} kategori seçildi
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Toplu Sil
            </button>
            <button
              onClick={() => setSelectedCategories([])}
              className="px-3 py-1 text-gray-600 hover:text-gray-900 text-sm"
            >
              Seçimi Temizle
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Kategoriler yükleniyor...</p>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm ? 'Kategori bulunamadı' : 'Henüz kategori yok'}
            </h3>
            <p className="text-gray-500 text-center mb-6">
              {searchTerm 
                ? 'Arama kriterlerinize uygun kategori bulunamadı' 
                : 'İlk kategorinizi oluşturmak için başlayın'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                İlk Kategoriyi Oluştur
              </button>
            )}
          </div>
        ) : (
          <div className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategorySelection(category.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(category)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteId === category.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {deleteId === category.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tag className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{category.slug}</p>
                      {category.description && (
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{category.description}</p>
                      )}
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{category._count?.products || 0} ürün</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedCategories.length === filteredCategories.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories(filteredCategories.map(c => c.id))
                            } else {
                              setSelectedCategories([])
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Görsel</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">İsim</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Slug</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Açıklama</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ürün Sayısı</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => toggleCategorySelection(category.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Tag className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{category.name}</td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-sm">{category.slug}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm max-w-xs truncate">
                          {category.description || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <Package className="w-3 h-3" />
                            {category._count?.products || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(category)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              disabled={deleteId === category.id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              {deleteId === category.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className="fixed bottom-4 right-4 z-50">
          {success && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol kolon */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Adı *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Kategori adını girin"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="kategori-slug"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Kategori açıklaması..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ana Kategori
                    </label>
                    <select
                      name="parentId"
                      value={form.parentId}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Ana Kategori (Kendi başına)</option>
                      {mainCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sağ kolon */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Görseli
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragOver
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('')
                              setImageFile(null)
                              setForm({ ...form, image: '' })
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-8">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Resmi sürükleyin veya seçin
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG, GIF - Max 5MB
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Veya Görsel URL'si
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={form.image}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {error && (
                    <span className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </span>
                  )}
                  {success && (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {success}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {editId ? 'Güncelle' : 'Oluştur'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
