'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type CartItem = {
  id: string
  product: {
    id: string
    name: string
    image: string
    price: number
    originalPrice?: number
    stock?: number
    minStockLevel?: number
    // Diğer gerekli alanlar
  }
  size?: string
  color?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<{ success: boolean; error?: string }>
  removeItem: (id: string, options?: { size?: string; color?: string }) => Promise<{ success: boolean; error?: string }>
  updateQuantity: (id: string, quantity: number, options?: { size?: string; color?: string }) => Promise<{ success: boolean; error?: string }>
  clearCart: () => Promise<{ success: boolean; error?: string }>
  getTotal: () => number
  getCount: () => number
  getSubtotal: () => number
  getDiscount: () => number
  getShippingCost: () => number
  loading: boolean
  error: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false) // ✅ Hydration kontrolü

  // Yardımcı: Kullanıcı girişli mi? - SSR SAFE
  const isLoggedIn = () => {
    // 🔧 REACT OFFICIAL: useEffect içinde kullan, render'da değil
    try {
      return !!window.localStorage.getItem('session_user')
    } catch {
      return false // SSR'da false döner
    }
  }

  // ✅ Hydration sonrası state'i güncelle
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Stok kontrolü
  const validateStock = (quantity: number) => {
    // Mock stok kontrolü - gerçek uygulamada API'den gelecek
    const maxStock = 10
    if (quantity > maxStock) {
      return { valid: false, error: `Bu ürün için maksimum ${maxStock} adet sipariş verebilirsiniz.` }
    }
    return { valid: true }
  }

  // İlk yüklemede sepeti yükle
  useEffect(() => {
    // 🔧 REACT OFFICIAL: useEffect zaten client-side'da çalışır
    // typeof window kontrolü HYDRATION MISMATCH'e sebep oluyor!

    const loadCart = async () => {
      try {
        setError(null)
        if (isLoggedIn()) {
          // Girişli ise backend'den çek
          const response = await fetch('/api/cart')
          if (response.ok) {
            const data = await response.json()
            if (data && data.items) {
              setItems(data.items)
            }
          } else {
            console.error('Sepet yüklenemedi:', response.status)
            setError('Sepet yüklenirken hata oluştu')
          }
        } else {
          // Girişsiz ise localStorage'dan çek - SSR Safe
          try {
            const localCart = window.localStorage.getItem('cart')
            if (localCart) {
              let parsed = []
              try {
                parsed = JSON.parse(localCart)
              } catch (e) {
                console.error('LocalStorage sepet verisi bozuk:', e)
                parsed = []
              }
              // Filtrele: product ve product.id olmayanları çıkar
              const valid = Array.isArray(parsed) ? parsed.filter(i => i && i.product && i.product.id) : []
              if (valid.length !== parsed.length) {
                // Bozuk veri varsa temizle
                window.localStorage.setItem('cart', JSON.stringify(valid))
              }
              setItems(valid)
            }
          } catch (localStorageError) {
            // SSR'da localStorage yok, sessizce devam et
            console.log('localStorage not available (SSR)')
          }
        }
      } catch (error) {
        console.error('Sepet yükleme hatası:', error)
        setError('Sepet yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  // Sepeti localStorage'a kaydet (girişsiz) - SSR Safe
  const saveCartToLocal = (cartItems: CartItem[]) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('cart', JSON.stringify(cartItems))
      }
    } catch (error) {
      console.error('LocalStorage kaydetme hatası:', error)
      setError('Sepet kaydedilirken hata oluştu')
    }
  }

  // Sepete ürün ekle
  const addItem = async (item: CartItem): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      
      // Stok kontrolü
      const stockValidation = validateStock(item.quantity)
      if (!stockValidation.valid) {
        return { success: false, error: stockValidation.error || 'Stok kontrolü başarısız' }
      }

      if (isLoggedIn()) {
        // Backend'e ekle
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data && data.items) {
            setItems(data.items)
            return { success: true }
          }
        }
        
        return { success: false, error: 'Ürün sepete eklenirken hata oluştu' }
      } else {
        // LocalStorage'a ekle
        setItems(prev => {
          // Güvenli findIndex
          const idx = prev.findIndex(i => 
            i && i.product && i.product.id === item.product.id && 
            i.size === item.size && i.color === item.color
          )
          let newCart
          if (idx > -1) {
            newCart = [...prev]
            const existingItem = newCart[idx]
            if (existingItem) {
              existingItem.quantity += item.quantity
              // Stok kontrolü
              const stockValidation = validateStock(existingItem.quantity)
              if (!stockValidation.valid) {
                existingItem.quantity = 10 // Maksimum stok
              }
            }
          } else {
            newCart = [...prev, item]
          }
          saveCartToLocal(newCart)
          return newCart
        })
        return { success: true }
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error)
      return { success: false, error: 'Ürün sepete eklenirken hata oluştu' }
    }
  }

  // Sepetten ürün çıkar
  const removeItem = async (id: string, options?: { size?: string; color?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      
      if (isLoggedIn()) {
        // Backend'den çıkar
        const item = items.find(i => 
          i.product.id === id && 
          (!options?.size || i.size === options.size) && 
          (!options?.color || i.color === options.color)
        )
        if (!item) {
          return { success: false, error: 'Ürün bulunamadı' }
        }
        
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id })
        })
        
        if (response.ok) {
          setItems(items.filter(i => i.id !== item.id))
          return { success: true }
        }
        
        return { success: false, error: 'Ürün sepetten çıkarılırken hata oluştu' }
      } else {
        // LocalStorage'dan çıkar
        setItems(prev => {
          const newCart = prev.filter(i => 
            !(i.product.id === id && 
              (!options?.size || i.size === options.size) && 
              (!options?.color || i.color === options.color))
          )
          saveCartToLocal(newCart)
          return newCart
        })
        return { success: true }
      }
    } catch (error) {
      console.error('Sepetten çıkarma hatası:', error)
      return { success: false, error: 'Ürün sepetten çıkarılırken hata oluştu' }
    }
  }

  // Sepet ürün adedini güncelle
  const updateQuantity = async (id: string, quantity: number, options?: { size?: string; color?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      
      if (quantity < 1) {
        return { success: false, error: 'Miktar en az 1 olmalıdır' }
      }
      
      // Stok kontrolü
      const stockValidation = validateStock(quantity)
      if (!stockValidation.valid) {
        return { success: false, error: stockValidation.error || 'Stok kontrolü başarısız' }
      }

      if (isLoggedIn()) {
        const item = items.find(i => 
          i.product.id === id && 
          (!options?.size || i.size === options.size) && 
          (!options?.color || i.color === options.color)
        )
        if (!item) {
          return { success: false, error: 'Ürün bulunamadı' }
        }
        
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id, quantity })
        })
        
        if (response.ok) {
          const updated = await response.json()
          if (updated) {
            setItems(items.map(i => 
              i.id === item.id ? { ...i, quantity: updated.quantity || i.quantity } : i
            ))
            return { success: true }
          }
        }
        
        return { success: false, error: 'Miktar güncellenirken hata oluştu' }
      } else {
        setItems(prev => {
          const newCart = prev.map(i =>
            i.product.id === id && 
            (!options?.size || i.size === options.size) && 
            (!options?.color || i.color === options.color)
              ? { ...i, quantity }
              : i
          )
          saveCartToLocal(newCart)
          return newCart
        })
        return { success: true }
      }
    } catch (error) {
      console.error('Miktar güncelleme hatası:', error)
      return { success: false, error: 'Miktar güncellenirken hata oluştu' }
    }
  }

  // Sepeti temizle (tüm ürünleri sil)
  const clearCart = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      
      if (isLoggedIn()) {
        // Backend'den tüm ürünleri sil
        const deletePromises = items.map(item =>
          fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id })
          })
        )
        
        await Promise.all(deletePromises)
        setItems([])
        return { success: true }
      } else {
        setItems([])
        saveCartToLocal([])
        return { success: true }
      }
    } catch (error) {
      console.error('Sepet temizleme hatası:', error)
      return { success: false, error: 'Sepet temizlenirken hata oluştu' }
    }
  }

  const getTotal = () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  
  // ✅ Hydration-safe getCount - SSR'da her zaman 0, client'ta gerçek değer
  const getCount = () => {
    if (!isHydrated) return 0 // Server render'da her zaman 0
    return items.reduce((sum, i) => sum + i.quantity, 0)
  }
  
  const getSubtotal = () => getTotal()
  const getDiscount = () => 0 // Kupon indirimi burada hesaplanacak
  
  // Dinamik kargo ücreti hesaplama
  const getShippingCost = () => {
    const subtotal = getTotal()
    
    // 2500₺ üzeri alışverişlerde ücretsiz kargo
    if (subtotal >= 2500) return 0
    
    // Standart kargo ücreti (en uygun PTT fiyatı - %10 KDV dahil)
    return 76.89
  }

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        getTotal, 
        getCount, 
        getSubtotal, 
        getDiscount, 
        getShippingCost,
        loading, 
        error 
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
