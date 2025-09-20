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
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import AdvancedSEOGenerator from '@/components/AdvancedSEOGenerator'

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
  // SEO Alanları
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  altText?: string
  // Gelişmiş SEO
  brand?: string
  sku?: string
  gtin?: string
  mpn?: string
  condition?: string
  availability?: string
  material?: string
  color?: string
  size?: string
  weight?: string
  dimensions?: string
  warranty?: string
  countryOfOrigin?: string
  // Sosyal Medya
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  // Yapılandırılmış Veri
  structuredData?: string
  canonicalUrl?: string
  hreflang?: string
  // Analitik
  googleAnalyticsId?: string
  googleTagManagerId?: string
  facebookPixelId?: string
  // Arama Motoru
  robotsMeta?: string
  sitemapPriority?: number
  changeFrequency?: string
  lastModified?: string
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
  // Temel SEO alanları
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  altText: '',
  // Gelişmiş SEO alanları
  brand: 'ModaBase',
  sku: '',
  gtin: '',
  mpn: '',
  condition: 'new',
  availability: 'in_stock',
  material: '',
  color: '',
  size: '',
  weight: '',
  dimensions: '',
  warranty: '',
  countryOfOrigin: 'Türkiye',
  // Sosyal medya
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'product',
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  // Yapılandırılmış veri
  structuredData: '',
  canonicalUrl: '',
  hreflang: 'tr-TR',
  // Analitik
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  // Arama motoru
  robotsMeta: 'index,follow',
  sitemapPriority: 0.8,
  changeFrequency: 'weekly',
  lastModified: new Date().toISOString()
}

// Profesyonel Beden Kategorileri
const sizeCategories = {
  clothing: {
    name: 'Giyim Bedenleri',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL']
  },
  shoes: {
    name: 'Ayakkabı Bedenleri',
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48']
  },
  accessories: {
    name: 'Aksesuar Bedenleri',
    sizes: ['Tek Beden', 'S', 'M', 'L', 'XL', 'XXL']
  },
  jewelry: {
    name: 'Takı Bedenleri',
    sizes: ['16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28']
  }
}

// Profesyonel Renk Paleti - Genişletilmiş
const colorPalettes = {
  basic: {
    name: 'Temel Renkler',
    colors: [
      { name: 'Siyah', code: '#000000', hex: '#000000' },
      { name: 'Beyaz', code: '#FFFFFF', hex: '#FFFFFF' },
      { name: 'Gri', code: '#808080', hex: '#808080' },
      { name: 'Açık Gri', code: '#D3D3D3', hex: '#D3D3D3' },
      { name: 'Koyu Gri', code: '#404040', hex: '#404040' },
      { name: 'Kırmızı', code: '#FF0000', hex: '#FF0000' },
      { name: 'Mavi', code: '#0000FF', hex: '#0000FF' },
      { name: 'Yeşil', code: '#008000', hex: '#008000' },
      { name: 'Sarı', code: '#FFFF00', hex: '#FFFF00' },
      { name: 'Turuncu', code: '#FFA500', hex: '#FFA500' },
      { name: 'Mor', code: '#800080', hex: '#800080' },
      { name: 'Pembe', code: '#FFC0CB', hex: '#FFC0CB' },
      { name: 'Kahverengi', code: '#8B4513', hex: '#8B4513' },
      { name: 'Açık Kahve', code: '#D2691E', hex: '#D2691E' },
      { name: 'Koyu Kahve', code: '#654321', hex: '#654321' }
    ]
  },
  // ✨ YENİ: CAMEL AİLESİ - ÇOK ÖNEMLİ TRİKO/TEKSTİL RENKLERİ
  camel: {
    name: 'Camel & Doğal Tonlar',
    colors: [
      { name: 'Camel', code: '#C19A6B', hex: '#C19A6B' },
      { name: 'Tan', code: '#D2B48C', hex: '#D2B48C' },
      { name: 'Taupe', code: '#483C32', hex: '#483C32' },
      { name: 'Sand', code: '#C2B280', hex: '#C2B280' },
      { name: 'Fawn', code: '#E5AA70', hex: '#E5AA70' },
      { name: 'Buff', code: '#F0DC82', hex: '#F0DC82' },
      { name: 'Nude', code: '#E3BC9A', hex: '#E3BC9A' },
      { name: 'Ivory', code: '#FFFFF0', hex: '#FFFFF0' },
      { name: 'Alabaster', code: '#EAEAE2', hex: '#EAEAE2' },
      { name: 'Pearl', code: '#EAE0C8', hex: '#EAE0C8' },
      { name: 'Stone', code: '#928E85', hex: '#928E85' },
      { name: 'Oyster', code: '#DAD4B0', hex: '#DAD4B0' },
      { name: 'Mushroom', code: '#ADABA3', hex: '#ADABA3' },
      { name: 'Wheat', code: '#F5DEB3', hex: '#F5DEB3' }
    ]
  },
  // ✨ YENİ: TOPRAK TONLARI - TRİKO KLASİKLERİ  
  earth: {
    name: 'Toprak Tonları',
    colors: [
      { name: 'Terracotta', code: '#E2725B', hex: '#E2725B' },
      { name: 'Clay', code: '#B66A50', hex: '#B66A50' },
      { name: 'Rust', code: '#B7410E', hex: '#B7410E' },
      { name: 'Copper', code: '#B87333', hex: '#B87333' },
      { name: 'Bronze', code: '#CD7F32', hex: '#CD7F32' },
      { name: 'Mahogany', code: '#C04000', hex: '#C04000' },
      { name: 'Chestnut', code: '#954535', hex: '#954535' },
      { name: 'Auburn', code: '#A52A2A', hex: '#A52A2A' },
      { name: 'Sienna', code: '#A0522D', hex: '#A0522D' },
      { name: 'Umber', code: '#635147', hex: '#635147' },
      { name: 'Cocoa', code: '#D2691E', hex: '#D2691E' },
      { name: 'Cinnamon', code: '#D2691E', hex: '#D2691E' }
    ]
  },
  // ✨ YENİ: GENİŞLETİLMİŞ MAVİ TONLAR
  blue_extended: {
    name: 'Mavi Tonları',
    colors: [
      { name: 'Navy', code: '#000080', hex: '#000080' },
      { name: 'Teal', code: '#008080', hex: '#008080' },
      { name: 'Aqua', code: '#00FFFF', hex: '#00FFFF' },
      { name: 'Cerulean', code: '#007BA7', hex: '#007BA7' },
      { name: 'Azure', code: '#007FFF', hex: '#007FFF' },
      { name: 'Steel Blue', code: '#4682B4', hex: '#4682B4' },
      { name: 'Powder Blue', code: '#B0E0E6', hex: '#B0E0E6' },
      { name: 'Denim Blue', code: '#1560BD', hex: '#1560BD' },
      { name: 'Cobalt', code: '#0047AB', hex: '#0047AB' },
      { name: 'Prussian Blue', code: '#003153', hex: '#003153' },
      { name: 'Peacock Blue', code: '#005F69', hex: '#005F69' },
      { name: 'Indigo', code: '#4B0082', hex: '#4B0082' }
    ]
  },
  // ✨ YENİ: GENİŞLETİLMİŞ YEŞİL TONLAR
  green_extended: {
    name: 'Yeşil Tonları', 
    colors: [
      { name: 'Sage', code: '#9CAF88', hex: '#9CAF88' },
      { name: 'Moss', code: '#8A9A5B', hex: '#8A9A5B' },
      { name: 'Forest Green', code: '#228B22', hex: '#228B22' },
      { name: 'Hunter Green', code: '#355E3B', hex: '#355E3B' },
      { name: 'Jade', code: '#00A86B', hex: '#00A86B' },
      { name: 'Olive', code: '#808000', hex: '#808000' },
      { name: 'Pine', code: '#01796F', hex: '#01796F' },
      { name: 'Emerald', code: '#50C878', hex: '#50C878' },
      { name: 'Mint', code: '#3EB489', hex: '#3EB489' },
      { name: 'Sea Green', code: '#2E8B57', hex: '#2E8B57' },
      { name: 'Chartreuse', code: '#7FFF00', hex: '#7FFF00' },
      { name: 'Lime', code: '#00FF00', hex: '#00FF00' }
    ]
  },
  // ✨ YENİ: MOR AİLESİ - LÜKS RENKLER
  purple_family: {
    name: 'Mor & Eflatun',
    colors: [
      { name: 'Lavender', code: '#E6E6FA', hex: '#E6E6FA' },
      { name: 'Lilac', code: '#C8A2C8', hex: '#C8A2C8' },
      { name: 'Mauve', code: '#E0B0FF', hex: '#E0B0FF' },
      { name: 'Plum', code: '#DDA0DD', hex: '#DDA0DD' },
      { name: 'Violet', code: '#8A2BE2', hex: '#8A2BE2' },
      { name: 'Amethyst', code: '#9966CC', hex: '#9966CC' },
      { name: 'Orchid', code: '#DA70D6', hex: '#DA70D6' },
      { name: 'Eggplant', code: '#614051', hex: '#614051' },
      { name: 'Grape', code: '#6F2DA8', hex: '#6F2DA8' },
      { name: 'Periwinkle', code: '#CCCCFF', hex: '#CCCCFF' }
    ]
  },
  // ✨ YENİ: PEMBE & KIRMIZI TONLAR
  pink_red_extended: {
    name: 'Pembe & Kırmızı',
    colors: [
      { name: 'Coral', code: '#FF7F50', hex: '#FF7F50' },
      { name: 'Salmon', code: '#FA8072', hex: '#FA8072' },
      { name: 'Blush', code: '#DE5D83', hex: '#DE5D83' },
      { name: 'Wine', code: '#722F37', hex: '#722F37' },
      { name: 'Burgundy', code: '#800020', hex: '#800020' },
      { name: 'Crimson', code: '#DC143C', hex: '#DC143C' },
      { name: 'Scarlet', code: '#FF2400', hex: '#FF2400' },
      { name: 'Ruby', code: '#E0115F', hex: '#E0115F' },
      { name: 'Rose', code: '#FF007F', hex: '#FF007F' },
      { name: 'Fuchsia', code: '#FF00FF', hex: '#FF00FF' }
    ]
  },
  // ✨ YENİ: SOFİSTİKE GRİLER
  gray_sophisticated: {
    name: 'Sofistike Griler',
    colors: [
      { name: 'Charcoal', code: '#36454F', hex: '#36454F' },
      { name: 'Pewter', code: '#96A8A1', hex: '#96A8A1' },
      { name: 'Dove Grey', code: '#6E6E6E', hex: '#6E6E6E' },
      { name: 'Ash', code: '#B2BEB5', hex: '#B2BEB5' },
      { name: 'Slate', code: '#708090', hex: '#708090' },
      { name: 'Silver', code: '#C0C0C0', hex: '#C0C0C0' },
      { name: 'Platinum', code: '#E5E4E2', hex: '#E5E4E2' },
      { name: 'Smoke', code: '#738276', hex: '#738276' }
    ]
  },
  // ✨ YENİ: DUSTY TONLAR (2024-2025 TRENDİ)
  dusty_tones: {
    name: 'Dusty Tonlar (Trend)',
    colors: [
      { name: 'Dusty Rose', code: '#DCAE96', hex: '#DCAE96' },
      { name: 'Dusty Pink', code: '#D19FE8', hex: '#D19FE8' },
      { name: 'Dusty Blue', code: '#6B8DB5', hex: '#6B8DB5' },
      { name: 'Dusty Green', code: '#8FBC94', hex: '#8FBC94' },
      { name: 'Dusty Lavender', code: '#AC9BCC', hex: '#AC9BCC' },
      { name: 'Dusty Coral', code: '#F2A490', hex: '#F2A490' },
      { name: 'Dusty Sage', code: '#A8AF8E', hex: '#A8AF8E' },
      { name: 'Dusty Taupe', code: '#AB9A8A', hex: '#AB9A8A' }
    ]
  },
  fashion: {
    name: 'Moda Renkleri',
    colors: [
      { name: 'Navy', code: '#000080', hex: '#000080' },
      { name: 'Bordo', code: '#800020', hex: '#800020' },
      { name: 'Bej', code: '#F5F5DC', hex: '#F5F5DC' },
      { name: 'Haki', code: '#806B2A', hex: '#806B2A' },
      { name: 'Lavanta', code: '#E6E6FA', hex: '#E6E6FA' },
      { name: 'Mercan', code: '#FF7F50', hex: '#FF7F50' },
      { name: 'Turkuaz', code: '#40E0D0', hex: '#40E0D0' },
      { name: 'Altın', code: '#FFD700', hex: '#FFD700' },
      { name: 'Gümüş', code: '#C0C0C0', hex: '#C0C0C0' },
      { name: 'Rose Gold', code: '#B76E79', hex: '#B76E79' },
      { name: 'Füme', code: '#708090', hex: '#708090' },
      { name: 'Açık Füme', code: '#B0C4DE', hex: '#B0C4DE' },
      { name: 'Koyu Füme', code: '#2F4F4F', hex: '#2F4F4F' },
      { name: 'Cappuccino', code: '#C19A6B', hex: '#C19A6B' }
    ]
  },
  seasonal: {
    name: 'Sezon Renkleri',
    colors: [
      { name: 'Pastel Mavi', code: '#ADD8E6', hex: '#ADD8E6' },
      { name: 'Pastel Pembe', code: '#FFB6C1', hex: '#FFB6C1' },
      { name: 'Mint Yeşili', code: '#98FF98', hex: '#98FF98' },
      { name: 'Somon', code: '#FA8072', hex: '#FA8072' },
      { name: 'Limon', code: '#FFFACD', hex: '#FFFACD' },
      { name: 'Lavanta', code: '#E6E6FA', hex: '#E6E6FA' },
      { name: 'Şeftali', code: '#FFCBA4', hex: '#FFCBA4' },
      { name: 'Açık Sarı', code: '#FFFFE0', hex: '#FFFFE0' },
      { name: 'Açık Yeşil', code: '#90EE90', hex: '#90EE90' },
      { name: 'Açık Mor', code: '#DDA0DD', hex: '#DDA0DD' },
      { name: 'Açık Gri', code: '#D3D3D3', hex: '#D3D3D3' },
      { name: 'Açık Kahve', code: '#D2691E', hex: '#D2691E' },
      { name: 'Açık Füme', code: '#B0C4DE', hex: '#B0C4DE' },
      { name: 'Açık Lavanta', code: '#E6E6FA', hex: '#E6E6FA' },
      { name: 'Açık Turkuaz', code: '#AFEEEE', hex: '#AFEEEE' }
    ]
  },
  neutral: {
    name: 'Nötr Renkler',
    colors: [
      { name: 'Beyaz', code: '#FFFFFF', hex: '#FFFFFF' },
      { name: 'Krem', code: '#FFFDD0', hex: '#FFFDD0' },
      { name: 'Bej', code: '#F5F5DC', hex: '#F5F5DC' },
      { name: 'Açık Bej', code: '#F5F5DC', hex: '#F5F5DC' },
      { name: 'Koyu Bej', code: '#DEB887', hex: '#DEB887' },
      { name: 'Gri', code: '#808080', hex: '#808080' },
      { name: 'Açık Gri', code: '#D3D3D3', hex: '#D3D3D3' },
      { name: 'Koyu Gri', code: '#404040', hex: '#404040' },
      { name: 'Füme', code: '#708090', hex: '#708090' },
      { name: 'Açık Füme', code: '#B0C4DE', hex: '#B0C4DE' },
      { name: 'Koyu Füme', code: '#2F4F4F', hex: '#2F4F4F' },
      { name: 'Kahve', code: '#8B4513', hex: '#8B4513' },
      { name: 'Açık Kahve', code: '#D2691E', hex: '#D2691E' },
      { name: 'Koyu Kahve', code: '#654321', hex: '#654321' },
      { name: 'Siyah', code: '#000000', hex: '#000000' }
    ]
  }
}



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
  
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Akıllı varyant sistemi için state'ler
  const [selectedColors, setSelectedColors] = useState<Array<{ name: string; code: string; hex: string }>>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [currentColorForSizes, setCurrentColorForSizes] = useState<{ name: string; code: string; hex: string } | null>(null)
  
  // Resim yükleme modal için state'ler - ULTRA GÜVENLİ başlangıç
  const [imageSlots, setImageSlots] = useState<Array<{ id: number; image: string; loading: boolean; error: string }>>(() => {
    console.log('🔄 imageSlots state başlatılıyor...')
    try {
      const initialSlots = Array.from({ length: 8 }, (_, index) => ({
        id: index + 1,
        image: '',
        loading: false,
        error: ''
      }))
      console.log('✅ imageSlots başlatıldı:', initialSlots.length, 'slot')
      return initialSlots
    } catch (error) {
      console.error('❌ imageSlots başlatma hatası:', error)
      // Fallback - güvenli varsayılan değer
      return [
        { id: 1, image: '', loading: false, error: '' },
        { id: 2, image: '', loading: false, error: '' },
        { id: 3, image: '', loading: false, error: '' },
        { id: 4, image: '', loading: false, error: '' },
        { id: 5, image: '', loading: false, error: '' },
        { id: 6, image: '', loading: false, error: '' },
        { id: 7, image: '', loading: false, error: '' },
        { id: 8, image: '', loading: false, error: '' }
      ]
    }
  })

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      if (mounted) {
        await fetchProducts()
        await fetchCategories()
      }
    }
    
    loadData()
    
    return () => {
      mounted = false
    }
  }, [])

  // imageSlots state'ini koru - ULTRA GÜVENLİ
  useEffect(() => {
    console.log('🔄 imageSlots useEffect çalıştı')
    
    try {
      console.log('imageSlots güncel durum:', imageSlots)
      console.log('imageSlots tipi:', typeof imageSlots)
      console.log('imageSlots Array.isArray:', Array.isArray(imageSlots))
      
      // Eğer imageSlots undefined ise yeniden başlat
      if (!imageSlots || !Array.isArray(imageSlots)) {
        console.log('⚠️ imageSlots geçersiz, yeniden başlatılıyor...')
        const newSlots = Array.from({ length: 8 }, (_, index) => ({
          id: index + 1,
          image: '',
          loading: false,
          error: ''
        }))
        setImageSlots(newSlots)
        console.log('✅ imageSlots yeniden başlatıldı')
      }
    } catch (error) {
      console.error('❌ imageSlots useEffect hatası:', error)
      // Güvenli fallback
      const fallbackSlots = [
        { id: 1, image: '', loading: false, error: '' },
        { id: 2, image: '', loading: false, error: '' },
        { id: 3, image: '', loading: false, error: '' },
        { id: 4, image: '', loading: false, error: '' },
        { id: 5, image: '', loading: false, error: '' },
        { id: 6, image: '', loading: false, error: '' },
        { id: 7, image: '', loading: false, error: '' },
        { id: 8, image: '', loading: false, error: '' }
      ]
      setImageSlots(fallbackSlots)
      console.log('🔄 Güvenli fallback imageSlots ayarlandı')
    }
  }, [imageSlots])

  useEffect(() => {
    if (products.length > 0 || searchTerm || selectedCategory) {
      filterProducts()
    }
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      // Hem sistem hem de işletme kategorilerini getir
      const [systemResponse, businessResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/admin/categories/business').catch(() => null) // İşletme kategorileri yoksa hata verme
      ])
      
      let allCategories: Category[] = []
      
      if (systemResponse.ok) {
        const systemCategories = await systemResponse.json()
        allCategories = [...systemCategories]
      }
      
      if (businessResponse?.ok) {
        const businessCategories = await businessResponse.json()
        allCategories = [...allCategories, ...businessCategories]
      }
      
      setCategories(allCategories)
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    }
  }

  const filterProducts = () => {
    if (!Array.isArray(products)) {
      setFilteredProducts([])
      return
    }
    
    let filtered = [...products]
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(product => product?.categoryId === selectedCategory)
    }
    
    setFilteredProducts(filtered)
  }

  const openModal = (product?: Product) => {
    setError('')
    setSuccess('')
    if (product) {
      setEditId(product.id)
      
      // Form verilerini doldur
      const productImages = JSON.parse(product.images || '[]')
      setForm({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        images: productImages,
        stock: product.stock.toString(),
        minStockLevel: product.minStockLevel?.toString() || '5',
        maxStockLevel: product.maxStockLevel?.toString() || '',
        categoryId: product.categoryId,
        variants: product.variants || [],
        // SEO alanları - Düzenleme modunda mevcut verileri yükle
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        keywords: product.keywords || '',
        altText: product.altText || '',
        // Gelişmiş SEO alanları
        brand: product.brand || 'ModaBase',
        sku: product.sku || '',
        gtin: product.gtin || '',
        mpn: product.mpn || '',
        condition: product.condition || 'new',
        availability: product.availability || 'in_stock',
        material: product.material || '',
        color: product.color || '',
        size: product.size || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        warranty: product.warranty || '',
        countryOfOrigin: product.countryOfOrigin || 'Türkiye',
        // Sosyal medya
        ogTitle: product.ogTitle || '',
        ogDescription: product.ogDescription || '',
        ogImage: product.ogImage || '',
        ogType: product.ogType || 'product',
        twitterCard: product.twitterCard || 'summary_large_image',
        twitterTitle: product.twitterTitle || '',
        twitterDescription: product.twitterDescription || '',
        twitterImage: product.twitterImage || '',
        // Yapılandırılmış veri
        structuredData: product.structuredData || '',
        canonicalUrl: product.canonicalUrl || '',
        hreflang: product.hreflang || 'tr-TR',
        // Analitik
        googleAnalyticsId: product.googleAnalyticsId || '',
        googleTagManagerId: product.googleTagManagerId || '',
        facebookPixelId: product.facebookPixelId || '',
        // Arama motoru
        robotsMeta: product.robotsMeta || 'index,follow',
        sitemapPriority: product.sitemapPriority || 0.8,
        changeFrequency: product.changeFrequency || 'weekly',
        lastModified: product.lastModified || new Date().toISOString()
      })
      
      // ✨ FIX: Mevcut ürün resimlerini imageSlots'a yükle
      console.log('📸 Mevcut ürün resimleri yükleniyor:', productImages.length)
      const updatedSlots = Array.from({ length: 8 }, (_, index) => ({
        id: index + 1,
        image: productImages[index] || '',
        loading: false,
        error: ''
      }))
      
      setImageSlots(updatedSlots)
      console.log('✅ imageSlots güncellendi:', updatedSlots.filter(slot => slot.image).length, 'resim yüklendi')
      
    } else {
      setEditId(null)
      setForm(initialForm)
      
      // Yeni ürün için boş imageSlots
      const emptySlots = Array.from({ length: 8 }, (_, index) => ({
        id: index + 1,
        image: '',
        loading: false,
        error: ''
      }))
      setImageSlots(emptySlots)
    }
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditId(null)
    setForm(initialForm)
    setError('')
    setSuccess('')
    
    // ✨ FIX: imageSlots'u da resetle
    const emptySlots = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      image: '',
      loading: false,
      error: ''
    }))
    setImageSlots(emptySlots)
    console.log('🔄 Modal kapatıldı, imageSlots resetlendi')
  }

  const handleFormChange = (e: any) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    
    // Auto-generate slug from name
    if (name === 'name') {
      // Türkçe karakterleri İngilizce karakterlere dönüştür
      const turkishToEnglish: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g', 
        'ı': 'i', 'I': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u'
      }
      
      let result = value
      for (const [turkish, english] of Object.entries(turkishToEnglish)) {
        result = result.replace(new RegExp(turkish, 'g'), english)
      }
      
      const slug = result.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      setForm((prev: any) => ({ ...prev, slug }))
      
      // ✨ AUTO-GENERATED SLUG İÇİN VALIDATION YAPMA - sadece manual değişiklik için
      return
    }
    
    // ✨ Slug validation - sadece manuel slug değişiklikleri için
    if (name === 'slug') {
      // Hemen temizle if slug is being manually edited
      if (error && error.includes('slug')) {
        setError('')
      }
      
      // Check for duplicates - improved editId comparison
      const slugExists = products.find(p => {
        // Hem string hem number karşılaştırması
        const currentEditId = editId?.toString()
        const productId = p.id?.toString()
        
        console.log('🔍 Slug kontrol:', {
          inputSlug: value,
          productSlug: p.slug,
          editId: currentEditId,
          productId: productId,
          isEditing: !!editId
        })
        
        return p.slug === value && productId !== currentEditId
      })
      
      if (slugExists) {
        setError(`⚠️ "${value}" slug'u zaten kullanılıyor. Lütfen farklı bir slug seçin.`)
      }
    }
  }

  const handleSEOGenerated = (seoData: any) => {
    setForm((prev: any) => ({
      ...prev,
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      keywords: seoData.keywords.join(', '),
      altText: seoData.altText,
      slug: seoData.urlSlug,
      // Gelişmiş SEO alanları
      brand: seoData.brand,
      sku: seoData.sku,
      gtin: seoData.gtin,
      mpn: seoData.mpn,
      condition: seoData.condition,
      availability: seoData.availability,
      material: seoData.material,
      color: seoData.color,
      size: seoData.size,
      weight: seoData.weight,
      dimensions: seoData.dimensions,
      warranty: seoData.warranty,
      countryOfOrigin: seoData.countryOfOrigin,
      // Sosyal medya
      ogTitle: seoData.ogTitle,
      ogDescription: seoData.ogDescription,
      ogImage: seoData.ogImage,
      ogType: seoData.ogType,
      twitterCard: seoData.twitterCard,
      twitterTitle: seoData.twitterTitle,
      twitterDescription: seoData.twitterDescription,
      twitterImage: seoData.twitterImage,
      // Yapılandırılmış veri
      structuredData: seoData.structuredData,
      canonicalUrl: seoData.canonicalUrl,
      hreflang: seoData.hreflang,
      // Analitik
      googleAnalyticsId: seoData.googleAnalyticsId,
      googleTagManagerId: seoData.googleTagManagerId,
      facebookPixelId: seoData.facebookPixelId,
      // Arama motoru
      robotsMeta: seoData.robotsMeta,
      sitemapPriority: seoData.sitemapPriority,
      changeFrequency: seoData.changeFrequency,
      lastModified: seoData.lastModified
    }))
  }

  // Resim sıkıştırma fonksiyonu - çok agresif optimizasyon
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()
      
      img.onload = () => {
        try {
          // Daha büyük boyutlar - daha iyi kalite
          const maxWidth = 800
          const maxHeight = 800
          
          let { width, height } = img
          
          // En-boy oranını koru
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          if (!ctx) {
            reject(new Error('Canvas context oluşturulamadı'))
            return
          }
          
          ctx.drawImage(img, 0, 0, width, height)
          
          // Daha yüksek kalitede JPEG sıkıştır (0.8 kalite - %80)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          
          // Boyut kontrolü - 2MB limit (500KB'dan 2MB'a çıkarıldı)
          if (compressedDataUrl.length > 2 * 1024 * 1024) {
            console.warn(`Resim çok büyük: ${compressedDataUrl.length} bytes`)
            // Daha düşük kalitede tekrar dene
            const lowQualityDataUrl = canvas.toDataURL('image/jpeg', 0.6)
            resolve(lowQualityDataUrl)
          } else {
            resolve(compressedDataUrl)
          }
        } catch (error) {
          reject(new Error(`Resim işleme hatası: ${error}`))
        }
      }
      
      img.onerror = () => reject(new Error('Resim yüklenemedi'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Resim yükleme işlemi - optimize edilmiş kalite
  // Modal için resim yükleme fonksiyonu
  const handleSlotImageUpload = async (slotId: number, file: File) => {
    console.log(`📸 Slot ${slotId} için resim yükleme başladı:`, file.name, file.size, 'bytes')
    
    // Güvenli state güncelleme
    setImageSlots(prev => {
      if (!prev || !Array.isArray(prev)) {
        console.error('❌ imageSlots undefined, yeniden başlatılıyor')
        return Array.from({ length: 8 }, (_, index) => ({
          id: index + 1,
          image: '',
          loading: index + 1 === slotId,
          error: ''
        }))
      }
      
      return prev.map(slot => 
        slot && slot.id === slotId 
          ? { ...slot, loading: true, error: '' }
          : slot
      )
    })

    try {
      // Dosya boyutu kontrolü - 10MB limit (5MB'dan 10MB'a çıkarıldı)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Dosya çok büyük. Maksimum 10MB olmalıdır.')
      }

      console.log(`Slot ${slotId} için resim sıkıştırılıyor: ${file.name}`)
      const compressedImage = await compressImage(file)
      console.log(`Slot ${slotId} resmi sıkıştırıldı: ${compressedImage.length} bytes`)
      console.log(`Slot ${slotId} resim önizleme: ${compressedImage.substring(0, 100)}...`)

      // Resmi slot'a ekle
      setImageSlots(prev => {
        const updated = prev.map(slot => 
          slot.id === slotId 
            ? { ...slot, image: compressedImage, loading: false, error: '' }
            : slot
        )
        console.log(`✅ Slot ${slotId} güncellendi, yeni imageSlots:`, updated)
        return updated
      })

    } catch (error) {
      console.error(`Slot ${slotId} resim yükleme hatası:`, error)
      setImageSlots(prev => prev.map(slot => 
        slot.id === slotId 
          ? { ...slot, loading: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
          : slot
      ))
    }
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

  // Akıllı renk seçimi - renk seçildiğinde beden seçici açılır
  const selectColor = (color: { name: string; code: string; hex: string }) => {
    setCurrentColorForSizes(color)
    setShowSizeSelector(true)
    setSelectedSizes([]) // Beden seçimini sıfırla
  }

  // Beden seçimi - seçilen renk için bedenler eklenir
  const selectSizesForColor = (sizes: string[]) => {
    if (!currentColorForSizes) return

    const newVariants = sizes.map(size => ({
      size,
      color: currentColorForSizes.name,
      colorCode: currentColorForSizes.code,
      stock: 0,
      price: 0,
      sku: '',
      isActive: true
    }))

    setForm({ ...form, variants: [...form.variants, ...newVariants] })
    
    // Seçilen rengi listeye ekle
    setSelectedColors(prev => [...prev, currentColorForSizes])
    
    // Beden seçiciyi kapat
    setShowSizeSelector(false)
    setCurrentColorForSizes(null)
    setSelectedSizes([])
  }

  // Eski sistem için geriye uyumluluk
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

  // Kaydetme işlemi - Next.js 15 chunked upload sistemi
  const handleSave = async (e?: React.FormEvent) => {
    // ✅ CRITICAL FİX: Form submit'i durdur
    if (e) {
      e.preventDefault()
      console.log('✅ preventDefault çağrıldı - sayfa yenilenmeyecek')
    }
    
    console.log('🚀 handleSave başlatıldı')
    console.log('📊 Form durumu:', { name: form.name, slug: form.slug, price: form.price, categoryId: form.categoryId })
    
    if (!form.name || !form.slug || !form.price || !form.categoryId) {
      setError('Lütfen tüm zorunlu alanları doldurun.')
      return
    }

    // ULTRA GÜVENLİ imageSlots kontrolü - TRY CATCH ile
    console.log('🔍 ULTRA DEBUG: imageSlots kontrolü')
    console.log('🖼️ imageSlots state:', imageSlots)
    console.log('🖼️ imageSlots type:', typeof imageSlots)
    console.log('🖼️ imageSlots length:', imageSlots?.length || 'undefined')
    
    let safeImageSlots: Array<{ id: number; image: string; loading: boolean; error: string }> = []
    
    // ✅ CRITICAL FİX: imageSlots state'ini güvenli şekilde kopyala
    try {
      if (imageSlots && Array.isArray(imageSlots) && imageSlots.length > 0) {
        safeImageSlots = imageSlots.map(slot => ({
          id: slot?.id || 0,
          image: slot?.image || '',
          loading: slot?.loading || false,
          error: slot?.error || ''
        }))
        console.log('✅ imageSlots state\'inden güvenli kopyalama yapıldı:', safeImageSlots.length)
      } else {
        console.log('❌ imageSlots state boş veya geçersiz, boş array kullanılıyor')
        safeImageSlots = []
      }
    } catch (imageError) {
      console.error('❌ imageSlots kopyalama hatası:', imageError)
      safeImageSlots = []
    }
    
    try {
      console.log('imageSlots tipi:', typeof imageSlots)
      console.log('imageSlots değeri:', imageSlots)
      console.log('imageSlots Array.isArray:', Array.isArray(imageSlots))
      
      if (!imageSlots) {
        console.error('❌ imageSlots null/undefined')
        throw new Error('imageSlots null/undefined')
      }
      
      if (!Array.isArray(imageSlots)) {
        console.error('❌ imageSlots array değil:', imageSlots)
        throw new Error('imageSlots array değil')
      }
      
      console.log('✅ imageSlots geçerli, uzunluk:', imageSlots.length)
      safeImageSlots = imageSlots
      
    } catch (error) {
      console.error('❌ imageSlots güvenlik hatası:', error)
      // Boş array kullan, boş slotlar DEĞİL!
      safeImageSlots = []
      console.log('🔄 Boş array kullanılıyor (default slotlar DEĞİL)')
    }
    
    // Her slot'u detaylı kontrol et - GÜVENLİ
    safeImageSlots.forEach((slot, index) => {
      console.log(`Slot ${index + 1} detayı:`, {
        slot: slot,
        slotType: typeof slot,
        isNull: slot === null,
        isUndefined: slot === undefined,
        hasId: slot?.id,
        hasImage: !!slot?.image,
        imageLength: slot?.image?.length || 0,
        hasError: !!slot?.error,
        loading: slot?.loading
      })
    })

    // ULTRA GÜVENLİ filtreleme - safeImageSlots kullan
    const validImages = safeImageSlots
      .filter(slot => {
        const isValid = slot && typeof slot === 'object' && slot.image && !slot.error
        console.log(`Slot ${slot?.id} filtreleme:`, { slot, isValid })
        return isValid
      })
      .map(slot => slot.image as string)

    console.log('🖼️ DEBUG: Geçerli resimler:')
    console.log('Geçerli resim sayısı:', validImages.length)
    validImages.forEach((img, index) => {
      console.log(`Geçerli resim ${index + 1}:`, img.length, 'bytes')
    })

    // Eğer hiç resim yoksa, imageSlots'tan default olmayanları al
    if (validImages.length === 0) {
      console.log('⚠️ ValidImages boş, imageSlots kontrol ediliyor...')
      console.log('Current imageSlots:', imageSlots)
      
      // imageSlots'tan resim olmayan slotları filtrele
      const allSlotImages = imageSlots
        .filter(slot => slot.image && slot.image !== '' && !slot.error)
        .map(slot => slot.image)
      
      console.log('Filtered slot images:', allSlotImages)
      
      if (allSlotImages.length > 0) {
        validImages.push(...allSlotImages)
        console.log('✅ imageSlots\'tan', allSlotImages.length, 'resim alındı')
      } else {
        // Hiç resim yoksa en az 8 default resim ekle
        for (let i = 0; i < 8; i++) {
          validImages.push('/default-product.svg')
        }
        console.log('⚠️ Hiç resim yok, 8 default resim eklendi')
      }
    }

    setSaving(true)
    setError('')

    try {
      console.log('🚀 Next.js 15 ürün kaydetme başlatıldı...')
      console.log('📊 Form verisi:', form)
      console.log('🖼️ Resim sayısı:', validImages.length)
      
      // Resimleri optimize et - Next.js 15 için daha esnek limit
      const optimizedImages = validImages.map((img: string, index: number) => {
        console.log(`Resim ${index + 1} boyutu:`, img.length, 'bytes')
        // 10MB'dan büyükse resmi sıkıştır veya default kullan
        if (img.length > 10 * 1024 * 1024) {
          console.log('⚠️ Resim çok büyük, default resim kullanılıyor:', img.length, 'bytes')
          return '/default-product.svg'
        }
        return img
      })

      console.log('🖼️ DEBUG: Optimize edilmiş resimler:')
      optimizedImages.forEach((img, index) => {
        console.log(`Optimize resim ${index + 1}:`, img.length, 'bytes')
      })

      // Payload boyutunu kontrol et
      // VARYANT DEBUG - Frontend
      console.log('🔍 FRONTEND VARYANT DEBUG:')
      console.log('form.variants tipi:', typeof form.variants)
      console.log('form.variants değeri:', form.variants)
      console.log('form.variants uzunluk:', form.variants?.length || 0)
      
      if (form.variants && form.variants.length > 0) {
        console.log('✅ Frontend\'de varyantlar var:')
        form.variants.forEach((variant: any, index: number) => {
          console.log(`Frontend Varyant ${index + 1}:`, {
            size: variant.size,
            color: variant.color,
            colorCode: variant.colorCode,
            stock: variant.stock,
            price: variant.price,
            sku: variant.sku,
            isActive: variant.isActive
          })
        })
      } else {
        console.log('❌ Frontend\'de hiç varyant yok!')
      }
      
      const payload = {
        ...form,
        images: JSON.stringify(optimizedImages),
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        stock: parseInt(form.stock) || 0,
        minStockLevel: parseInt(form.minStockLevel) || 5,
        maxStockLevel: form.maxStockLevel ? parseInt(form.maxStockLevel) : null,
        variants: form.variants || []
      }

      const payloadSize = JSON.stringify(payload).length
      console.log('📦 Payload boyutu:', payloadSize, 'bytes')
      console.log('📦 Payload preview:', JSON.stringify(payload, null, 2).substring(0, 1000))
      
      // 100MB'dan büyükse hata ver
      if (payloadSize > 100 * 1024 * 1024) {
        console.log('❌ Payload çok büyük:', payloadSize, 'bytes')
        setError('Ürün verisi çok büyük. Lütfen daha az resim ekleyin veya resimleri küçültün.')
        setSaving(false)
        return
      }

      // Next.js 15 optimized API isteği - EDIT vs CREATE logic
      console.log('🌐 Next.js 15 API isteği gönderiliyor...')
      console.log('🔄 editId kontrolü:', editId)
      console.log('🔄 İşlem tipi:', editId ? 'EDIT (PUT)' : 'CREATE (POST)')
      
      const isEdit = !!editId
      const url = isEdit ? `/api/admin/products/${editId}` : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'
      
      console.log('🎯 API URL:', url)
      console.log('🎯 HTTP Method:', method)
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-NextJS-Version': '15',
        },
        body: JSON.stringify(payload)
      })

      console.log('📥 API yanıtı:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Hatası (raw):', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (parseError) {
          console.error('❌ Error JSON parse failed:', parseError)
          errorData = { error: 'API yanıtı geçersiz' }
        }
        
        throw new Error(errorData.error || `Ürün ${isEdit ? 'güncellenemedi' : 'eklenemedi'}`)
      }

      const responseData = await response.json()
      console.log('✅ API Başarılı:', responseData)

      // Başarı mesajı
      setSuccess(`Ürün başarıyla ${isEdit ? 'güncellendi' : 'eklendi'}!`)
      
      // Modal'ı kapat
      setTimeout(() => {
        closeModal()
        setSuccess('')
      }, 2000)
      
      // Form'u temizle
      setForm({
        name: '',
        slug: '',
        description: '',
        price: '',
        originalPrice: '',
        stock: '0',
        minStockLevel: '5',
        maxStockLevel: '',
        categoryId: '',
        variants: []
      })
      
      // Resim slot'larını temizle
      setImageSlots(Array(8).fill(null).map((_, index) => ({ 
        id: index + 1, 
        image: '', 
        loading: false, 
        error: '' 
      })))
      
      // Ürün listesini yenile
      fetchProducts()
      
    } catch (error) {
      console.error('❌ Ürün kaydetme hatası:', error)
      setError(error instanceof Error ? error.message : 'Ürün eklenirken bir hata oluştu')
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
    // Güvenli JSON parse - eğer parse fail olursa boş array döner
    let images: string[] = []
    try {
      images = JSON.parse(product.images || '[]')
      if (!Array.isArray(images)) {
        images = []
      }
    } catch (error) {
      console.warn('Product images JSON parse hatası:', error)
      images = []
    }
    const stockStatus = getStockStatus(product.stock, product.minStockLevel)
    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
    const totalVariants = product.variants?.length || 0
    
    return (
      <div className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
          {images.length > 0 && images[0] ? (
            <div className="relative h-full">
              <img
                src={images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.log('Resim yüklenemedi:', images[0])
                  e.currentTarget.src = 'https://via.placeholder.com/400x400/cccccc/666666?text=Resim'
                }}
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
                onClick={() => {
                  setPreviewImages(images)
                  setCurrentImageIndex(0)
                  setPreviewImage(images.length > 0 ? (images[0] || null) : null)
                }}
                className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
                title={`${images.length} resim görüntüle`}
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
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
                  {/* Advanced SEO Section */}
                  <AdvancedSEOGenerator
                    productName={form.name}
                    category={categories.find(cat => cat.id === form.categoryId)?.name || ''}
                    brand="ModaBase"
                    {...(parseFloat(form.price) > 0 && { price: parseFloat(form.price) })}
                    description={form.description || ''}
                    images={Array.isArray(form.images) ? form.images : []}
                    onSEOGenerated={handleSEOGenerated}
                  />

                  {/* SEO Önizleme */}
                  {form.metaTitle && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Önizleme</h3>
                      <div className="space-y-4">
                        {/* Google Arama Sonucu Önizleme */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Google Arama Sonucu</h4>
                          <div className="space-y-1">
                            <div className="text-blue-600 text-sm truncate">
                              {form.canonicalUrl || `https://www.modabase.com.tr/product/${form.slug}`}
                            </div>
                            <div className="text-lg text-blue-600 font-medium">
                              {form.metaTitle || 'Ürün başlığı'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {form.metaDescription || 'Ürün açıklaması'}
                            </div>
                          </div>
                        </div>

                        {/* Facebook Paylaşım Önizleme */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Facebook Paylaşım</h4>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-900">
                              {form.ogTitle || form.metaTitle || 'Ürün başlığı'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {form.ogDescription || form.metaDescription || 'Ürün açıklaması'}
                            </div>
                            {form.ogImage && (
                              <img 
                                src={form.ogImage} 
                                alt="OG Image" 
                                className="w-full h-32 object-cover rounded"
                              />
                            )}
                          </div>
                        </div>

                        {/* SEO Bilgileri */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">SEO Bilgileri</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Marka:</span>
                              <span className="ml-2 font-medium">{form.brand || 'Belirtilmemiş'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">SKU:</span>
                              <span className="ml-2 font-medium">{form.sku || 'Belirtilmemiş'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Durum:</span>
                              <span className="ml-2 font-medium">{form.condition || 'Belirtilmemiş'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Stok:</span>
                              <span className="ml-2 font-medium">{form.availability || 'Belirtilmemiş'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Ürün Fotoğrafları</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (!form.images || !Array.isArray(form.images) || form.images.length === 0)
                            ? 'bg-red-100 text-red-700' 
                            : form.images.length >= 8 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {form.images && Array.isArray(form.images) ? form.images.length : 0}/8
                        </span>
                        {(!form.images || !Array.isArray(form.images) || form.images.length === 0) && (
                          <span className="text-red-600 text-xs">* Zorunlu</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Image Upload Grid - 8 Slots */}
                    <div className="mb-6">
                      <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((slotId) => {
                          const slot = imageSlots.find(s => s.id === slotId) || {
                            id: slotId,
                            image: '',
                            loading: false,
                            error: ''
                          }
                          const hasImage = slot.image && !slot.error
                          
                          return (
                            <div key={slotId} className="relative">
                              <div className={`aspect-square rounded-lg border-2 border-dashed transition-all duration-200 ${
                                hasImage 
                                  ? 'border-green-300 bg-green-50' 
                                  : slot.error 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                              }`}>
                                
                                {/* Image Preview */}
                                {hasImage && (
                                  <div className="relative w-full h-full">
                                    <img
                                      src={slot.image}
                                      alt={`Slot ${slotId}`}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setImageSlots(prev => prev.map(s => 
                                          s.id === slotId ? { ...s, image: '', error: '' } : s
                                        ))
                                      }}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                      title="Resmi Kaldır"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                                
                                {/* Upload Button */}
                                {!hasImage && (
                                  <div className="flex flex-col items-center justify-center h-full p-2">
                                    {slot.loading ? (
                                      <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                                        <span className="text-xs text-gray-600">Yükleniyor...</span>
                                      </div>
                                    ) : (
                                      <>
                                        <input
                                          type="file"
                                          id={`image-upload-${slotId}`}
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            console.log('🔴 FILE INPUT CHANGED!')
                                            const file = e.target.files?.[0]
                                            console.log('🔴 Selected file:', file)
                                            if (file) {
                                              console.log('🔴 Calling handleSlotImageUpload for slot:', slotId)
                                              handleSlotImageUpload(slotId, file)
                                            } else {
                                              console.log('🔴 No file selected')
                                            }
                                          }}
                                        />
                                        <label
                                          htmlFor={`image-upload-${slotId}`}
                                          className="cursor-pointer flex flex-col items-center"
                                        >
                                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-1">
                                            <ImageIcon className="w-4 h-4 text-white" />
                                          </div>
                                          <span className="text-xs text-gray-600 text-center">
                                            Slot {slotId}
                                          </span>
                                        </label>
                                      </>
                                    )}
                                  </div>
                                )}
                                
                                {/* Error Message */}
                                {slot.error && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-red-100 text-red-700 text-xs p-1 rounded-b-lg">
                                    {slot.error}
                                  </div>
                                )}
                              </div>
                              
                              {/* Slot Number */}
                              <div className="absolute -top-2 -left-2 bg-gray-800 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-medium">
                                {slotId}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Info Text */}
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          JPG, PNG, WebP formatları desteklenir (Maks. 5MB per resim)
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Her slot için ayrı resim yükleyebilirsiniz (minimum 1, maksimum 8)
                        </p>
                      </div>
                    </div>
                    
                    {/* Final Image Preview Grid */}
                    {(() => {
                      const validImages = imageSlots
                        .filter(slot => slot.image && !slot.error)
                        .map(slot => slot.image as string)
                      
                      return validImages.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-semibold text-gray-900">Yüklenen Resimler</h4>
                            <span className="text-sm text-gray-600">
                              {validImages.length}/8 resim
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {validImages.map((image: string, index: number) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={image}
                                    alt={`Product ${index + 1}`}
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
                                        onClick={() => {
                                          // Ana fotoğraf yapma işlemi
                                          const newImages = [...validImages]
                                          const mainImage = newImages[index]
                                          if (mainImage) {
                                            newImages.splice(index, 1)
                                            newImages.unshift(mainImage)
                                          }
                                          
                                          // Slot'ları güncelle
                                          const newSlots = [...imageSlots]
                                          newSlots.forEach((slot, slotIndex) => {
                                            const image = newImages[slotIndex]
                                            if (slotIndex < newImages.length && image) {
                                              slot.image = image
                                            }
                                          })
                                          setImageSlots(newSlots)
                                        }}
                                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                                        title="Ana Fotoğraf Yap"
                                      >
                                        <Star className="w-4 h-4" />
                                      </button>
                                    )}
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
                        </div>
                      )
                    })()}
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
                
                {/* Profesyonel Varyant Ekleme Sistemi */}
                <div className="space-y-6 mb-6">
                  {/* Beden Seçimi */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Beden Seçimi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(sizeCategories).map(([key, category]) => (
                        <div key={key} className="space-y-3">
                          <h5 className="font-medium text-gray-700 text-sm">{category.name}</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {category.sizes.map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => addSizeVariants([size])}
                                className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 rounded-lg transition-all duration-200 hover:border-blue-300"
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Akıllı Renk Seçimi */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Renk Seçimi</h4>
                    
                    {/* Seçilen Renkler */}
                    {selectedColors.length > 0 && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-900 mb-2">Seçilen Renkler:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedColors.map((color, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-blue-300"
                              style={{ backgroundColor: color.hex }}
                            >
                              <span className="text-xs font-medium text-white drop-shadow-lg">
                                {color.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedColors(prev => prev.filter((_, i) => i !== index))
                                  // Bu renge ait varyantları da kaldır
                                  setForm({
                                    ...form,
                                    variants: form.variants.filter((v: ProductVariant) => v.color !== color.name)
                                  })
                                }}
                                className="text-white hover:text-red-200 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {Object.entries(colorPalettes).map(([key, palette]) => (
                        <div key={key} className="space-y-3">
                          <h5 className="font-medium text-gray-700 text-sm">{palette.name}</h5>
                          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                            {palette.colors.map((color) => {
                              const isSelected = selectedColors.some(c => c.name === color.name)
                              return (
                                <button
                                  key={color.name}
                                  type="button"
                                  onClick={() => selectColor(color)}
                                  disabled={isSelected}
                                  className={`group relative p-3 rounded-lg border-2 transition-all duration-200 ${
                                    isSelected 
                                      ? 'border-green-400 bg-green-100 opacity-60 cursor-not-allowed' 
                                      : 'border-gray-200 hover:border-blue-400'
                                  }`}
                                  style={{ backgroundColor: color.hex }}
                                  title={isSelected ? `${color.name} - Zaten seçildi` : `${color.name} - Beden seçmek için tıklayın`}
                                >
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-200"></div>
                                  <span className="text-xs font-medium text-white drop-shadow-lg">
                                    {color.name}
                                  </span>
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Beden Seçici Modal */}
                  {showSizeSelector && currentColorForSizes && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            <span 
                              className="inline-block w-6 h-6 rounded-lg border-2 border-gray-300 mr-3"
                              style={{ backgroundColor: currentColorForSizes.hex }}
                            ></span>
                            {currentColorForSizes.name} için Beden Seçin
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSizeSelector(false)
                              setCurrentColorForSizes(null)
                              setSelectedSizes([])
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {Object.entries(sizeCategories).map(([key, category]) => (
                            <div key={key} className="space-y-3">
                              <h5 className="font-medium text-gray-700 text-sm">{category.name}</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {category.sizes.map((size) => (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() => {
                                      if (selectedSizes.includes(size)) {
                                        setSelectedSizes(prev => prev.filter(s => s !== size))
                                      } else {
                                        setSelectedSizes(prev => [...prev, size])
                                      }
                                    }}
                                    className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 ${
                                      selectedSizes.includes(size)
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-300'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            {selectedSizes.length} beden seçildi
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowSizeSelector(false)
                                setCurrentColorForSizes(null)
                                setSelectedSizes([])
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              İptal
                            </button>
                            <button
                              type="button"
                              onClick={() => selectSizesForColor(selectedSizes)}
                              disabled={selectedSizes.length === 0}
                              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Ekle ({selectedSizes.length})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hızlı Kombinasyon */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Kombinasyon</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          const sizes = ['S', 'M', 'L', 'XL']
                          const colors = [
                            { name: 'Siyah', code: '#000000' },
                            { name: 'Beyaz', code: '#FFFFFF' },
                            { name: 'Gri', code: '#808080' }
                          ]
                          addSizeVariants(sizes)
                          addColorVariants(colors)
                        }}
                        className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">Klasik Kombinasyon</div>
                          <div className="text-xs text-gray-500 mt-1">S-M-L-XL + Siyah-Beyaz-Gri</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const sizes = ['36', '37', '38', '39', '40', '41', '42', '43']
                          const colors = [
                            { name: 'Siyah', code: '#000000' },
                            { name: 'Beyaz', code: '#FFFFFF' },
                            { name: 'Navy', code: '#000080' }
                          ]
                          addSizeVariants(sizes)
                          addColorVariants(colors)
                        }}
                        className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">Ayakkabı Kombinasyonu</div>
                          <div className="text-xs text-gray-500 mt-1">36-43 + Siyah-Beyaz-Navy</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const sizes = ['Tek Beden']
                          const colors = colorPalettes.fashion.colors.slice(0, 6)
                          addSizeVariants(sizes)
                          addColorVariants(colors)
                        }}
                        className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">Aksesuar Kombinasyonu</div>
                          <div className="text-xs text-gray-500 mt-1">Tek Beden + Moda Renkleri</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Profesyonel Varyant Listesi */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Ürün Varyantları ({form.variants.length})</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Toplam Stok:</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {form.variants.reduce((sum: number, v: ProductVariant) => sum + (v.stock || 0), 0)}
                      </span>
                    </div>
                  </div>
                  
                  {form.variants.map((variant: ProductVariant, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center">
                        {/* Beden */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Beden</label>
                          <input
                            type="text"
                            value={variant.size || ''}
                            onChange={(e) => updateVariant(index, 'size', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                            placeholder="S, M, L, 38..."
                          />
                        </div>
                        
                        {/* Renk */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Renk</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={variant.color || ''}
                              onChange={(e) => updateVariant(index, 'color', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Kırmızı, Mavi..."
                            />
                            <div
                              className="w-8 h-8 rounded-lg border-2 border-gray-200"
                              style={{ backgroundColor: variant.colorCode || '#000000' }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Renk Kodu */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Renk Kodu</label>
                          <input
                            type="color"
                            value={variant.colorCode || '#000000'}
                            onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                            className="w-full h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                          />
                        </div>
                        
                        {/* Stok */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Stok</label>
                          <input
                            type="number"
                            value={variant.stock || 0}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="0"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {variant.stock > 10 ? '✅ Stokta' : variant.stock > 0 ? '⚠️ Az Stok' : '❌ Tükendi'}
                          </div>
                        </div>
                        
                        {/* Fiyat */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Fiyat (₺)</label>
                          <input
                            type="number"
                            value={variant.price || ''}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            step="0.01"
                            min="0"
                            placeholder="Farklı fiyat"
                          />
                          {variant.price && variant.price !== form.price && (
                            <div className="text-xs text-orange-600 mt-1">
                              Ana fiyattan farklı: {form.price - variant.price > 0 ? '-' : '+'}₺{Math.abs(form.price - variant.price).toFixed(2)}
                            </div>
                          )}
                        </div>
                        
                        {/* SKU */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">SKU</label>
                          <input
                            type="text"
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Otomatik oluşturulacak"
                          />
                        </div>
                        
                        {/* İşlemler */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newVariants = [...form.variants]
                              newVariants[index] = { ...newVariants[index], isActive: !newVariants[index].isActive }
                              setForm({ ...form, variants: newVariants })
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              variant.isActive 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                            }`}
                            title={variant.isActive ? 'Aktif' : 'Pasif'}
                          >
                            {variant.isActive ? '✓' : '✗'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {form.variants.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Henüz varyant eklenmemiş</p>
                      <p className="text-sm text-gray-400 mt-1">Yukarıdaki seçeneklerden beden ve renk ekleyin</p>
                    </div>
                  )}
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
      

        

      {/* Image Gallery Modal */}
      {previewImage && previewImages.length > 0 && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            {/* Close Button */}
            <button
              onClick={() => {
                setPreviewImage(null)
                setPreviewImages([])
                setCurrentImageIndex(0)
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-10">
              {currentImageIndex + 1} / {previewImages.length}
            </div>
            
            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={previewImages[currentImageIndex]}
                alt={`Resim ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  console.log('Resim yüklenemedi:', previewImages[currentImageIndex])
                  e.currentTarget.src = 'https://via.placeholder.com/400x400/cccccc/666666?text=Resim'
                }}
              />
              
              {/* Navigation Buttons */}
              {previewImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : previewImages.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < previewImages.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {previewImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
                {previewImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-blue-500 scale-110' 
                        : 'border-transparent hover:border-white/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/64x64/cccccc/666666?text=Resim'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
