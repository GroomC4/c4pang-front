'use client'

import { X, ShoppingCart, ShoppingBag, Star } from 'lucide-react'
import Image from 'next/image'
import { ProductRecommendation } from '@/types/chatbot'
import { useEffect } from 'react'

interface ProductDetailModalProps {
  product: ProductRecommendation
  isOpen: boolean
  onClose: () => void
  onAddToCart: (productId: string) => void
  onBuyNow: (productId: string) => void
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductDetailModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddToCart = () => {
    onAddToCart(product.id)
    onClose()
  }

  const handleBuyNow = () => {
    onBuyNow(product.id)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-800">상품 상세</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          {/* 상품 이미지 */}
          <div className="relative aspect-square w-full max-w-md mx-auto mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>

          {/* 브랜드 및 상품명 */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-2xl font-bold text-purple-600">
              {product.price.toLocaleString()}원
            </p>
          </div>

          {/* 태그 정보 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.season && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                {product.season}
              </span>
            )}
            {product.occasion && (
              <span className="px-3 py-1 bg-green-50 text-green-600 text-sm rounded-full">
                {product.occasion}
              </span>
            )}
          </div>

          {/* 전체 설명 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">상품 설명</h4>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* 노트 구성 */}
          {product.notes && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">노트 구성</h4>
              <div className="space-y-4">
                {/* Top Notes */}
                {product.notes.top && product.notes.top.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Top Notes</p>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.top.map((note, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-full"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Middle Notes */}
                {product.notes.middle && product.notes.middle.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Middle Notes</p>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.middle.map((note, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-pink-50 text-pink-600 text-sm rounded-full"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Base Notes */}
                {product.notes.base && product.notes.base.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Base Notes</p>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.base.map((note, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-amber-50 text-amber-600 text-sm rounded-full"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 향 계열 */}
          {product.fragrance && product.fragrance.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">향 계열</h4>
              <div className="flex flex-wrap gap-2">
                {product.fragrance.map((frag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-violet-50 text-violet-600 text-sm rounded-full"
                  >
                    {frag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 리뷰 요약 (임시 데이터) */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">리뷰 요약</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">4.8 / 5.0</span>
              </div>
              <p className="text-sm text-gray-600">
                고객들이 이 향수의 지속력과 은은한 향에 만족하고 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* QuickAction 버튼 (하단 고정) */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 text-purple-600 font-medium rounded-lg hover:bg-purple-200 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>장바구니 담기</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>바로 구매</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
