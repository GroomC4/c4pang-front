'use client'

import React from 'react'
import { ProductRecommendation, QuickActionItem } from '@/types/chatbot'
import { ProductCard } from './ProductCard'
import { ProductWithDescription } from './ProductWithDescription'
import { QuickActionBar } from './QuickActionBar'
import { useChatbot } from '@/contexts/ChatbotContext'

interface ProductListViewProps {
  products: ProductRecommendation[]
  quickActions?: QuickActionItem[]
  showBuyNow?: boolean
  productDescriptions?: Map<number, string>
}

export function ProductListView({ 
  products, 
  quickActions, 
  showBuyNow = true,
  productDescriptions 
}: ProductListViewProps) {
  const { addProductToCart, startCheckout, handleQuickAction } = useChatbot()

  const handleAddToCart = (productId: string) => {
    addProductToCart(productId, 1)
  }

  const handleBuyNow = (productId: string) => {
    startCheckout('direct', productId)
  }

  const handleQuickActionClick = (action: QuickActionItem) => {
    handleQuickAction(action)
  }

  return (
    <div className="space-y-3 mt-3">
      {/* Product Cards - 설명과 함께 또는 단독으로 */}
      <div className="grid grid-cols-1 gap-4">
        {products.map((product, index) => {
          const description = productDescriptions?.get(index)
          
          // 설명이 있으면 ProductWithDescription 사용
          if (description) {
            return (
              <ProductWithDescription
                key={product.id}
                product={product}
                description={description}
                index={index + 1}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            )
          }
          
          // 설명이 없으면 기본 ProductCard 사용
          return (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              disabled={false}
            />
          )
        })}
      </div>

      {/* Quick Actions */}
      {quickActions && quickActions.length > 0 && (
        <QuickActionBar
          actions={quickActions}
          onActionClick={handleQuickActionClick}
        />
      )}
    </div>
  )
}
