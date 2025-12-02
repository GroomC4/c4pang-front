'use client'

import React from 'react'
import { ProductRecommendation, QuickActionItem } from '@/types/chatbot'
import { ProductCard } from './ProductCard'
import { QuickActionBar } from './QuickActionBar'
import { useChatbot } from '@/contexts/ChatbotContext'

interface ProductListViewProps {
  products: ProductRecommendation[]
  quickActions?: QuickActionItem[]
  showBuyNow?: boolean
}

export function ProductListView({ products, quickActions, showBuyNow = true }: ProductListViewProps) {
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
      {/* Product Cards */}
      <div className="grid grid-cols-1 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            disabled={false}
          />
        ))}
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
