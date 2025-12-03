'use client'

import React from 'react'
import { ProductRecommendation } from '@/types/chatbot'
import { ProductCard } from './ProductCard'

interface ProductWithDescriptionProps {
  product: ProductRecommendation
  description: string
  index: number
  onAddToCart: (productId: string) => void
  onBuyNow: (productId: string) => void
}

export function ProductWithDescription({
  product,
  description,
  index,
  onAddToCart,
  onBuyNow
}: ProductWithDescriptionProps) {
  return (
    <div className="space-y-3">
      {/* 상품 카드 */}
      <ProductCard
        product={product}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        disabled={false}
      />
      
      {/* 상품 설명 */}
      {description && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fdf2f8',
          borderRadius: '12px',
          border: '1px solid #fce7f3',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#1f2937',
          whiteSpace: 'pre-wrap'
        }}>
          <div style={{ 
            fontWeight: '600', 
            color: '#ec4899',
            marginBottom: '8px',
            fontSize: '15px'
          }}>
            {index}. {product.brand} - {product.name}
          </div>
          {description}
        </div>
      )}
    </div>
  )
}
