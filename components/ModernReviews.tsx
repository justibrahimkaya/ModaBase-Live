'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle,
  X,
  Plus,
  Filter,
  CheckCircle,
  Shield,
} from 'lucide-react'

interface Review {
  id: string
  userId: string
  rating: number
  title: string | null
  comment: string | null
  images: string[]
  isVerifiedPurchase: boolean
  isApproved: boolean
  helpfulCount: number
  unhelpfulCount: number
  adminReply: string | null
  adminReplyDate: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    surname: string | null
    image: string | null
  }
}

interface ReviewsProps {
  productId: string
  initialReviews?: Review[]
  initialStats?: {
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<string, number>
  }
}

export default function ModernReviews({ productId, initialReviews = [], initialStats }: ReviewsProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(false)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Review yazma formu
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: [] as string[]
  })

  // Yorum yazma durumu
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Yorumları yükle
  const fetchReviews = async (resetPage = false) => {
    setLoading(true)
    try {
      const currentPage = resetPage ? 1 : page
      const params = new URLSearchParams({
        productId,
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      })

      if (selectedRating) {
        params.append('rating', selectedRating.toString())
      }

      const response = await fetch(`/api/reviews?${params}`)
      const data = await response.json()

      if (response.ok) {
        if (resetPage) {
          setReviews(data.reviews)
          setPage(1)
        } else {
          setReviews(prev => [...prev, ...data.reviews])
        }
        setStats(data.stats)
        setHasMore(data.pagination.page < data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Reviews yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  // Yorum gönder
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          ...reviewForm
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowWriteReview(false)
        setReviewForm({ rating: 0, title: '', comment: '', images: [] })
        fetchReviews(true)
      } else {
        setErrors({ general: data.error || 'Yorum gönderilirken hata oluştu' })
      }
    } catch (error) {
      setErrors({ general: 'Yorum gönderilirken hata oluştu' })
    } finally {
      setSubmitting(false)
    }
  }

  // Yararlı oy ver
  const handleHelpfulVote = async (reviewId: string, isHelpful: boolean) => {
    if (!session) return

    try {
      const response = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isHelpful })
      })

      if (response.ok) {
        fetchReviews(true)
      }
    } catch (error) {
      console.error('Oy verirken hata:', error)
    }
  }

  // Yıldız rating bileşeni
  const StarRating = ({ rating, onRatingChange, interactive = false, size = 20 }: {
    rating: number
    onRatingChange?: (rating: number) => void
    interactive?: boolean
    size?: number
  }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-${size === 20 ? '5' : '4'} h-${size === 20 ? '5' : '4'} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''} transition-colors`}
          onClick={() => interactive && onRatingChange?.(star)}
        />
      ))}
    </div>
  )

  // Rating dağılımı
  const RatingDistribution = () => (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = stats?.ratingDistribution?.[rating] || 0
        const percentage = stats?.totalReviews ? (count / stats.totalReviews) * 100 : 0
        
        return (
          <div key={rating} className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 w-12">
              <span className="text-sm font-medium">{rating}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8">{count}</span>
          </div>
        )
      })}
    </div>
  )

  // Yorum yazma formu
  const WriteReviewForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Değerlendirme Yaz</h3>
            <button
              onClick={() => setShowWriteReview(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puanınız <span className="text-red-500">*</span>
              </label>
              <StarRating
                rating={reviewForm.rating}
                onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
                interactive={true}
                size={24}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlık
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Değerlendirmenizin başlığını yazın"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yorumunuz <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Ürün hakkındaki deneyiminizi paylaşın..."
              />
            </div>

            {errors.general && (
              <div className="text-red-500 text-sm">{errors.general}</div>
            )}

            {/* Submit */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowWriteReview(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting || reviewForm.rating === 0 || !reviewForm.comment}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    fetchReviews(true)
  }, [selectedRating, sortBy, sortOrder])

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Müşteri Değerlendirmeleri</h2>
              <p className="text-blue-100 text-sm">{stats?.totalReviews || 0} değerlendirme</p>
            </div>
          </div>
          {session && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Değerlendirme Yaz</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats?.averageRating?.toFixed(1) || '0.0'}
            </div>
            <StarRating rating={Math.round(stats?.averageRating || 0)} />
            <p className="text-sm text-gray-600 mt-1">
              {stats?.totalReviews || 0} değerlendirme
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2">
            <RatingDistribution />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          {/* Rating Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedRating || ''}
              onChange={(e) => setSelectedRating(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tüm Puanlar</option>
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>
                  {rating} Yıldız
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                if (newSortBy && newSortOrder) {
                  setSortBy(newSortBy)
                  setSortOrder(newSortOrder)
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">En Yeni</option>
              <option value="createdAt-asc">En Eski</option>
              <option value="rating-desc">En Yüksek Puan</option>
              <option value="rating-asc">En Düşük Puan</option>
              <option value="helpfulCount-desc">En Yararlı</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                {/* User Avatar */}
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {review.user.image ? (
                    <img src={review.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>
                      {(review.user.name?.[0] || review.user.surname?.[0] || 'A').toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  {/* User Info */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {review.user.name} {review.user.surname}
                    </span>
                    {review.isVerifiedPurchase && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>Doğrulanmış Alışveriş</span>
                      </div>
                    )}
                  </div>

                  {/* Rating and Date */}
                  <div className="flex items-center space-x-3 mb-3">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  )}

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                  )}

                  {/* Review Images */}
                  {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-3">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </div>
                  )}

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="mt-3 pl-4 border-l-2 border-blue-500 bg-blue-50 p-3 rounded-r-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">ModaBase Yanıtı</span>
                        <span className="text-xs text-blue-600">
                          {new Date(review.adminReplyDate!).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-blue-800 text-sm">{review.adminReply}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-4 mt-4">
                    <button
                      onClick={() => handleHelpfulVote(review.id, true)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Yararlı ({review.helpfulCount})</span>
                    </button>
                    <button
                      onClick={() => handleHelpfulVote(review.id, false)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Yararsız ({review.unhelpfulCount})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz değerlendirme yok</h3>
            <p className="text-gray-500 mb-4">Bu ürün için ilk değerlendirmeyi siz yapın!</p>
            {session && (
              <button
                onClick={() => setShowWriteReview(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Değerlendirme Yaz
              </button>
            )}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && reviews.length > 0 && (
        <div className="p-6 text-center border-t border-gray-200">
          <button
            onClick={() => {
              setPage(prev => prev + 1)
              fetchReviews()
            }}
            disabled={loading}
            className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Yükleniyor...' : 'Daha Fazla Göster'}
          </button>
        </div>
      )}

      {/* Write Review Modal */}
      {showWriteReview && <WriteReviewForm />}
    </div>
  )
}
