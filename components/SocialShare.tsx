'use client'

import { Facebook, Twitter, Instagram, Mail, Link } from 'lucide-react'

export default function SocialShare() {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = 'Bu harika ürünü ModaBase\'de buldum!'

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: 'bg-blue-400 hover:bg-blue-500'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: '#',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent('ModaBase Ürün Paylaşımı')}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ]

  const copyToClipboard = async () => {
    try {
      // SSR Safety: navigator kontrolü ekle
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link kopyalandı!')
      } else {
        // Fallback for older browsers or SSR
        alert('Link kopyalanamadı. Tarayıcınız desteklemiyor.')
      }
    } catch (err) {
      console.error('Clipboard hatası:', err)
      alert('Link kopyalanamadı!')
    }
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <h4 className="font-medium text-gray-900 mb-3">Arkadaşlarınızla Paylaşın</h4>
      <div className="flex items-center space-x-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full text-white transition-colors duration-200 ${link.color}`}
            title={`${link.name} ile paylaş`}
          >
            <link.icon className="h-5 w-5" />
          </a>
        ))}
        
        <button
          onClick={copyToClipboard}
          className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors duration-200"
          title="Linki kopyala"
        >
          <Link className="h-5 w-5" />
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Bu ürünü beğendiyseniz arkadaşlarınızla paylaşın
      </p>
    </div>
  )
}
