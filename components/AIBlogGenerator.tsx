'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface AIBlogGeneratorProps {
  onBlogCreated?: (blog: any) => void
}

const categories = [
  'Kadın Giyimi',
  'Erkek Giyimi', 
  'Çocuk Giyimi',
  'Aksesuar',
  'Spor Giyimi',
  'Ev Tekstili',
  'Moda Trendleri',
  'Sürdürülebilir Moda',
  'Kumaş Rehberi'
]

const suggestedTopics = [
      '2025 Kış Moda Trendleri',
  'Sürdürülebilir Tekstil Üretimi',
  'Organik Kumaşların Faydaları',
  'Ev Tekstili Bakım Rehberi',
  'Spor Giyiminde Teknoloji',
  'Kadın Giyimde Kombinleme Sanatı',
  'Erkek Giyimde Profesyonel Görünüm',
  'Çocuk Giyiminde Konfor ve Güvenlik',
  'Aksesuar Seçiminde Altın Kurallar',
  'Kumaş Türleri ve Özellikleri'
]

export default function AIBlogGenerator({ onBlogCreated }: AIBlogGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatedBlog, setGeneratedBlog] = useState<any>(null)

  const handleGenerate = async () => {
    if (!topic.trim() || !category) {
      setError('Lütfen konu ve kategori seçin')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setGeneratedBlog(null)

    try {
      const response = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topic.trim(),
          category
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setGeneratedBlog(data.post)
        setTopic('')
        setCategory('')
        onBlogCreated?.(data.post)
      } else {
        setError(data.error || 'Blog yazısı oluşturulamadı')
      }
    } catch (error) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestedTopic = (suggestedTopic: string) => {
    setTopic(suggestedTopic)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">AI Blog Yazısı Oluşturucu</h2>
      </div>

      {/* Form */}
      <div className="space-y-4 mb-6">
        {/* Konu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blog Konusu
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Örn: 2025 Kış Moda Trendleri"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Kategori seçin</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Önerilen Konular */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Önerilen Konular
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((suggestedTopic) => (
              <button
                key={suggestedTopic}
                onClick={() => handleSuggestedTopic(suggestedTopic)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                {suggestedTopic}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim() || !category}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI Blog Yazısı Oluşturuluyor...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              AI ile Blog Yazısı Oluştur
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Generated Blog */}
      {generatedBlog && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Oluşturulan Blog Yazısı:</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Başlık:</span> {generatedBlog.title}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Kategori:</span> {generatedBlog.category}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Okuma Süresi:</span> {generatedBlog.readTime} dakika
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Özet:</span> {generatedBlog.excerpt}
            </p>
            <div className="flex gap-2 mt-3">
              <a
                href={generatedBlog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Görüntüle
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
                   <div className="mt-6 p-4 bg-blue-50 rounded-lg">
               <h4 className="font-medium text-blue-900 mb-2">🤖 AI Blog Yazısı Oluşturucu Hakkında</h4>
               <ul className="text-sm text-blue-800 space-y-1">
                 <li>• Akıllı template sistemi ile kaliteli içerik üretir</li>
                 <li>• SEO dostu başlıklar ve içerikler oluşturur</li>
                 <li>• 800-1200 kelime arası detaylı yazılar</li>
                 <li>• Otomatik slug ve meta veri oluşturur</li>
                 <li>• Unsplash'ten uygun görseller seçer</li>
                 <li>• Ücretsiz ve hızlı çalışır</li>
               </ul>
             </div>
    </div>
  )
} 