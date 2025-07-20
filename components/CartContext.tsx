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
    // Diğer gerekli alanlar
  }
  size?: string
  color?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, options?: { size?: string; color?: string }) => void
  updateQuantity: (id: string, quantity: number, options?: { size?: string; color?: string }) => void
  clearCart: () => void
  getTotal: () => number
  getCount: () => number
  loading: boolean
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

  // Yardımcı: Kullanıcı girişli mi?
  const isLoggedIn = () => {
    // Basit kontrol: localStorage'da session_user veya benzeri bir anahtar var mı?
    if (typeof window !== 'undefined') {
      return !!window.localStorage.getItem('session_user')
    }
    return false
  }

  // İlk yüklemede sepeti yükle
  useEffect(() => {
    if (isLoggedIn()) {
      // Girişli ise backend'den çek
      fetch('/api/cart')
        .then(res => res.json())
        .then(data => {
          if (data && data.items) {
            setItems(data.items)
          }
        })
        .finally(() => setLoading(false))
    } else {
      // Girişsiz ise localStorage'dan çek
      const localCart = window.localStorage.getItem('cart')
      if (localCart) {
        let parsed = []
        try {
          parsed = JSON.parse(localCart)
        } catch (e) {
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
      setLoading(false)
    }
  }, [])

  // Sepeti localStorage'a kaydet (girişsiz)
  const saveCartToLocal = (cartItems: CartItem[]) => {
    window.localStorage.setItem('cart', JSON.stringify(cartItems))
  }

  // Sepete ürün ekle
  const addItem = async (item: CartItem) => {
    if (isLoggedIn()) {
      // Backend'e ekle
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })
      })
      const data = await res.json()
      if (data && data.items) {
        setItems(data.items)
      }
    } else {
      // LocalStorage'a ekle
      setItems(prev => {
        // Güvenli findIndex
        const idx = prev.findIndex(i => i && i.product && i.product.id === item.product.id && i.size === item.size && i.color === item.color)
        let newCart
        if (idx > -1) {
          newCart = [...prev]
          if (newCart[idx]) {
            newCart[idx].quantity += item.quantity
          }
        } else {
          newCart = [...prev, item]
        }
        saveCartToLocal(newCart)
        return newCart
      })
    }
  }

  // Sepetten ürün çıkar
  const removeItem = async (id: string, options?: { size?: string; color?: string }) => {
    if (isLoggedIn()) {
      // Backend'den çıkar
      const item = items.find(i => i.product.id === id && (!options?.size || i.size === options.size) && (!options?.color || i.color === options.color))
      if (!item) return
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      })
      setItems(items.filter(i => i.id !== item.id))
    } else {
      // LocalStorage'dan çıkar
      setItems(prev => {
        const newCart = prev.filter(i => !(i.product.id === id && (!options?.size || i.size === options.size) && (!options?.color || i.color === options.color)))
        saveCartToLocal(newCart)
        return newCart
      })
    }
  }

  // Sepet ürün adedini güncelle
  const updateQuantity = async (id: string, quantity: number, options?: { size?: string; color?: string }) => {
    if (isLoggedIn()) {
      const item = items.find(i => i.product.id === id && (!options?.size || i.size === options.size) && (!options?.color || i.color === options.color))
      if (!item) return
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, quantity })
      })
      const updated = await res.json()
      if (updated) {
        setItems(items.map(i => i.id === item.id ? { ...i, quantity: updated.quantity || i.quantity } : i))
      }
    } else {
      setItems(prev => {
        const newCart = prev.map(i =>
          i.product.id === id && (!options?.size || i.size === options.size) && (!options?.color || i.color === options.color)
            ? { ...i, quantity }
            : i
        )
        saveCartToLocal(newCart)
        return newCart
      })
    }
  }

  // Sepeti temizle (tüm ürünleri sil)
  const clearCart = async () => {
    if (isLoggedIn()) {
      for (const item of items) {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id })
        })
      }
      setItems([])
    } else {
      setItems([])
      saveCartToLocal([])
    }
  }

  const getTotal = () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const getCount = () => items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotal, getCount, loading }}
    >
      {children}
    </CartContext.Provider>
  )
}
