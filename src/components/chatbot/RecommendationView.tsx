'use client'

import React from 'react'
import { ShoppingCart, Star, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PersonalizedRecommendation } from '@/types/recommendation'
import { useCart } from '@/contexts/CartContext'

interface RecommendationViewProps {
  recommendations: PersonalizedRecommendation[]
  onProductClick?: (productId: string) => void
}

export function RecommendationView({ recommendations, onProductClick }: RecommendationViewProps) {
  const { addItem, openCart } = useCart()
  const router = useRouter()

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'preference':
        return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'trending':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'history':
        return <Star className="w-4 h-4 text-blue-500" />
      case 'similar':
        return <Star className="w-4 h-4 text-green-500" />
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />
    }
  }

  const getMatchTypeText = (matchType: string) => {
    switch (matchType) {
      case 'preference':
        return '취향 맞춤'
      case 'trending':
        return '인기 상품'
      case 'history':
        return '구매 패턴'
      case 'similar':
        return '유사 상품'
      default:
        return '추천'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.6) return 'text-blue-600 bg-blue-50'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const handleAddToCart = (e: React.MouseEvent, recommendation: PersonalizedRecommendation) => {
    e.stopPropagation()
    addItem(recommendation.product)
  }

  const handleGoToCart = () => {
    router.push('/cart')
  }

  const handleGoToCheckout = () => {
    router.push('/checkout')
  }

  const handleProductClick = (productId: string) => {
    if (onProductClick) {
      onProductClick(productId)
    }
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>추천할 상품이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <span className="font-semibold text-gray-800">맞춤 추천 상품</span>
        <span className="text-sm text-gray-500">({recommendations.length}개)</span>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={`${recommendation.product.id}-${index}`}
            onClick={() => handleProductClick(recommendation.product.id)}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={recommendation.product.image}
                  alt={recommendation.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getMatchTypeIcon(recommendation.matchType)}
                      <span className="text-xs text-gray-500">
                        {getMatchTypeText(recommendation.matchType)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(recommendation.score)}`}>
                        {Math.round(recommendation.score * 100)}% 일치
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{recommendation.product.brand}</p>
                    <h4 className="text-sm font-semibold text-gray-800 truncate">
                      {recommendation.product.name}
                    </h4>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, recommendation)}
                    className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors flex-shrink-0"
                    title="장바구니에 담기"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {recommendation.product.notes.slice(0, 3).map((note, noteIndex) => (
                    <span
                      key={noteIndex}
                      className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full"
                    >
                      {note}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-bold text-sm">
                    {recommendation.product.price.toLocaleString()}원
                  </span>
                  <span className="text-xs text-gray-400">
                    {recommendation.product.category}
                  </span>
                </div>

                {/* 추천 이유 */}
                {recommendation.reasons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="text-purple-600 font-medium">추천 이유:</span> {recommendation.reasons.slice(0, 2).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={handleGoToCart}
            className="flex-1 bg-purple-100 text-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-200 transition-colors text-sm"
          >
            장바구니 보기
          </button>
          <button
            onClick={handleGoToCheckout}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
          >
            바로 구매
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          더 정확한 추천을 위해 선호도를 업데이트해보세요! ✨
        </p>
      </div>
    </div>
  )
}