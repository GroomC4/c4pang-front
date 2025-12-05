'use client'

import { Plus, Minus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { ProductRecommendation } from '@/types/chatbot'
import { CartItem } from '@/types'

interface CartProductCardProps {
  product: ProductRecommendation
  cartItem: CartItem
  onIncreaseQuantity: (productId: string) => void
  onDecreaseQuantity: (productId: string) => void
  onRemove: (productId: string) => void
  disabled?: boolean
}

export function CartProductCard({ 
  product, 
  cartItem,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemove,
  disabled = false 
}: CartProductCardProps) {
  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onIncreaseQuantity(product.id)
    }
  }

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onDecreaseQuantity(product.id)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onRemove(product.id)
    }
  }

  // 주요 노트 추출 (top notes 우선)
  const mainNotes = product.notes?.top?.slice(0, 3) || product.fragrance?.slice(0, 3) || []
  const subtotal = product.price * cartItem.quantity

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
      }`}
    >
      <div className="flex gap-4 p-4">
        {/* 상품 이미지 */}
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-violet-50">
          {product.image && product.image !== '' ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-300 text-3xl">
              🌸
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex-1 min-w-0">
          {/* 브랜드명 */}
          <p className="text-xs text-gray-500 mb-1 font-medium">{product.brand}</p>
          
          {/* 상품명 */}
          <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-1">
            {product.name}
          </h3>

          {/* 주요 노트 */}
          {mainNotes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
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

          {/* 가격 및 수량 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {product.price.toLocaleString()}원 × {cartItem.quantity}개
              </p>
              <p className="text-base font-bold text-purple-600">
                {subtotal.toLocaleString()}원
              </p>
            </div>

            {/* 수량 조절 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrease}
                disabled={disabled}
                className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="수량 감소"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="text-sm font-semibold text-gray-800 min-w-[2rem] text-center">
                {cartItem.quantity}
              </span>
              
              <button
                onClick={handleIncrease}
                disabled={disabled}
                className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="수량 증가"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={handleRemove}
                disabled={disabled}
                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
