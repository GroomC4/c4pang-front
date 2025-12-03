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
  
  // 기본 이미지 URL
  const defaultImage = '/images/perfume-placeholder.png'
  const imageUrl = product.image || defaultImage

  return (
    <>
      <div
        className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
        }`}
      >
        {/* 상품 이미지 */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
          {product.image ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
              onError={(e) => {
                // 이미지 로드 실패 시 기본 이미지로 대체
                const target = e.target as HTMLImageElement
                target.src = defaultImage
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🌸</div>
                <p className="text-sm text-gray-500">{product.brand}</p>
              </div>
            </div>
          )}
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

          {/* 액션 버튼 */}
          <button
            onClick={handleAddToCart}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>장바구니에 넣기</span>
          </button>
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
