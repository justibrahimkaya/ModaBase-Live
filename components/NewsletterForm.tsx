'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    // Burada email subscribe API'nizi çağırabilirsiniz
    setTimeout(() => {
      setMessage('Başarıyla abone oldunuz!')
      setEmail('')
      setLoading(false)
    }, 1000)
  }

  return (
    <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="sr-only">E-posta adresiniz</label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresinizi girin"
        className="flex-1 px-6 py-4 rounded-xl border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        aria-label="E-posta adresi"
        required
        disabled={loading}
      />
      <button 
        type="submit" 
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Gönderiliyor...' : 'Abone Ol'}
      </button>
      {message && (
        <p className="text-center text-green-400 text-sm mt-2">{message}</p>
      )}
    </form>
  )
}