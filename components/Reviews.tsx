'use client'

import { useState } from 'react'
import { Star, ThumbsUp, MessageCircle } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    name: string | null
    surname: string | null
  }
}

interface ReviewsProps {
  reviews: Review[]
}

export default function Reviews({ reviews }: ReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([])

  const handleHelpful = (reviewId: string) => {
    setHelpfulReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  // Güvenli reviews kontrolü
  const safeReviews = reviews && Array.isArray(reviews) ? reviews : []

  // Ortalama rating hesapla
  const averageRating = safeReviews.length > 0
    ? safeReviews.reduce((sum, review) => sum + review.rating, 0) / safeReviews.length
    : 0

  // Rating dağılımını hesapla
  const ratingDistribution = {
    5: safeReviews.filter(r => r.rating === 5).length,
    4: safeReviews.filter(r => r.rating === 4).length,
    3: safeReviews.filter(r => r.rating === 3).length,
    2: safeReviews.filter(r => r.rating === 2).length,
    1: safeReviews.filter(r => r.rating === 1).length
  }

  const displayedReviews = showAllReviews ? safeReviews : safeReviews.slice(0, 3)

  return (
    <section id="reviews" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Müşteri Değerlendirmeleri</h2>
        <button className="text-primary-600 hover:text-primary-700 font-medium">
          Değerlendirme Yaz
        </button>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
                      <p className="text-sm text-gray-600">{safeReviews.length} değerlendirme</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution]
              const percentage = safeReviews.length > 0 ? (count / safeReviews.length) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm text-gray-600">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {safeReviews.length > 0 ? (
        <div className="space-y-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {review.user.name} {review.user.surname}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Doğrulanmış Alışveriş
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="text-gray-600 mb-3">{review.comment}</p>
              )}
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className={`flex items-center space-x-1 text-sm transition-colors ${
                    helpfulReviews.includes(review.id)
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Faydalı</span>
                </button>
                <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                  <MessageCircle className="h-4 w-4" />
                  <span>Yanıtla</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Henüz değerlendirme yapılmamış.</p>
        </div>
      )}

      {/* Show More Button */}
      {!showAllReviews && safeReviews.length > 3 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAllReviews(true)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Tüm Değerlendirmeleri Göster ({safeReviews.length})
          </button>
        </div>
      )}

      {/* Review Guidelines */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Değerlendirme Yazma Kuralları</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Sadece satın aldığınız ürünler için değerlendirme yazın</li>
          <li>• Kişisel deneyimlerinizi paylaşın</li>
          <li>• Uygunsuz içerik yazmayın</li>
          <li>• Diğer kullanıcıların deneyimlerini etkilemeyin</li>
        </ul>
      </div>
    </section>
  )
}
