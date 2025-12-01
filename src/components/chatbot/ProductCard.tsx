'use client'

import { ShoppingCart, Eye, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { ProductRecommendation } from '@/types/chatbot'
import { useState } from 'react'
import { ProductDetailModal } from '@/components/chatbot/ProductDetailModal'

interface ProductCardProps {
  product: ProductRecommendation
  onAddToCart: (productId: string) => void
  onBuyNow: (productId: string) => void
  disabled?: boolean
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onBuyNow,
  disabled = false 
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onAddToCart(product.id)
    }
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onBuyNow(product.id)
    }
  }

  const handleViewDetails = () => {
    if (!disabled) {
      setIsModalOpen(true)
    }
  }

  // 주요 노트 추출 (top notes 우선)
  const mainNotes = product.notes?.top?.slice(0, 3) || product.fragrance?.slice(0, 3) || []

  return (
    <>
      <div
        className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
        }`}
      >
        {/* 상품 이미지 */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          {product.season && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-purple-600">
                {product.season}
              </span>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="p-4">
          {/* 브랜드명 */}
          <p className="text-xs text-gray-500 mb-1 font-medium">{product.brand}</p>
          
          {/* 상품명 */}
          <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-1">
            {product.name}
          </h3>

          {/* 가격 */}
          <p className="text-lg font-bold text-purple-600 mb-3">
            {product.price.toLocaleString()}원
          </p>

          {/* 주요 노트 */}
          {mainNotes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {mainNotes.map((note, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full"
                >
                  {note}
                </span>
              ))}
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex gap-2">
            {/* 상세보기 버튼 */}
            <button
              onClick={handleViewDetails}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              <span>상세보기</span>
            </button>

            {/* 장바구니 담기 버튼 */}
            <button
              onClick={handleAddToCart}
              disabled={disabled}
              className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="장바구니 담기"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>

            {/* 바로 구매 버튼 */}
            <button
              onClick={handleBuyNow}
              disabled={disabled}
              className="p-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="바로 구매"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 상세보기 모달 */}
      <ProductDetailModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
      />
    </>
  )
}
