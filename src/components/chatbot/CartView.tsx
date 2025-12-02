'use client'

import React from 'react'
import { ProductRecommendation, QuickActionItem } from '@/types/chatbot'
import { CartItem } from '@/types'
import { CartProductCard } from './CartProductCard'
import { QuickActionBar } from './QuickActionBar'
import { useChatbot } from '@/contexts/ChatbotContext'
import { useCart } from '@/contexts/CartContext'

interface CartViewProps {
  products: ProductRecommendation[]
  quickActions?: QuickActionItem[]
}

export function CartView({ products, quickActions }: CartViewProps) {
  const { handleQuickAction } = useChatbot()
  const cart = useCart()

  const handleIncreaseQuantity = (productId: string) => {
    handleQuickAction({
      id: `increase_${productId}`,
      label: '수량 증가',
      type: 'primary',
      payload: { action: 'increase', productId }
    })
  }

  const handleDecreaseQuantity = (productId: string) => {
    handleQuickAction({
      id: `decrease_${productId}`,
      label: '수량 감소',
      type: 'secondary',
      payload: { action: 'decrease', productId }
    })
  }

  const handleRemove = (productId: string) => {
    handleQuickAction({
      id: `remove_${productId}`,
      label: '삭제',
      type: 'danger',
      payload: { action: 'remove', productId }
    })
  }

  const handleQuickActionClick = (action: QuickActionItem) => {
    handleQuickAction(action)
  }

  return (
    <div className="space-y-3 mt-3">
      {/* Cart Items */}
      {products.map((product) => {
        const cartItem = cart.items.find(item => item.id === product.id)
        if (!cartItem) return null

        return (
          <CartProductCard
            key={product.id}
            product={product}
            cartItem={cartItem}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            onRemove={handleRemove}
          />
        )
      })}

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
