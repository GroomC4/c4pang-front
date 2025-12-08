import { QuickActionItem } from '@/types/chatbot'
import { CartItem } from '@/types'

/**
 * Generate context-appropriate QuickActions based on the current conversation state
 */

export interface QuickActionContext {
  type: 'recommendation' | 'cart' | 'checkout' | 'order' | 'product_detail' | 'error'
  data?: {
    products?: any[]
    cartItems?: CartItem[]
    hasCart?: boolean
    isCheckout?: boolean
    errorType?: 'network' | 'validation' | 'business'
    retryable?: boolean
  }
}

/**
 * Generate QuickActions for product recommendations
 */
export function generateRecommendationActions(products: any[]): QuickActionItem[] {
  const actions: QuickActionItem[] = []

  // If there are products, offer to view cart or continue shopping
  if (products.length > 0) {
    actions.push({
      id: 'view_cart',
      label: '장바구니 보기',
      icon: 'cart',
      actionType: 'view_cart',
      type: 'secondary',
      payload: { action: 'view_cart' }
    })
  }

  return actions
}

/**
 * Generate QuickActions for cart view
 */
export function generateCartActions(cartItems: CartItem[]): QuickActionItem[] {
  const actions: QuickActionItem[] = []

  if (cartItems.length > 0) {
    // Checkout action
    actions.push({
      id: 'checkout',
      label: '결제하기',
      icon: 'card',
      actionType: 'checkout',
      type: 'primary',
      payload: { action: 'checkout' }
    })

    // Clear cart action
    actions.push({
      id: 'clear_cart',
      label: '장바구니 비우기',
      icon: 'trash',
      actionType: 'custom',
      type: 'danger',
      payload: { action: 'clear_cart' }
    })

    // Continue shopping action
    actions.push({
      id: 'continue_shopping',
      label: '쇼핑 계속하기',
      icon: 'arrow',
      actionType: 'custom',
      type: 'secondary',
      payload: { action: 'continue_shopping' }
    })
  }

  return actions
}

/**
 * Generate QuickActions for individual cart items
 */
export function generateCartItemActions(productId: string, quantity: number): QuickActionItem[] {
  const actions: QuickActionItem[] = []

  // Increase quantity
  actions.push({
    id: `increase_${productId}`,
    label: '+',
    icon: 'plus',
    actionType: 'custom',
    type: 'secondary',
    payload: { action: 'increase', productId }
  })

  // Decrease quantity
  actions.push({
    id: `decrease_${productId}`,
    label: '-',
    icon: 'minus',
    actionType: 'custom',
    type: 'secondary',
    payload: { action: 'decrease', productId }
  })

  // Remove item
  actions.push({
    id: `remove_${productId}`,
    label: '삭제',
    icon: 'trash',
    actionType: 'custom',
    type: 'danger',
    payload: { action: 'remove', productId }
  })

  return actions
}

/**
 * Generate QuickActions for checkout flow
 */
export function generateCheckoutActions(step: 'summary' | 'shipping' | 'payment' | 'confirmation'): QuickActionItem[] {
  const actions: QuickActionItem[] = []

  // Cancel checkout is always available
  actions.push({
    id: 'cancel_checkout',
    label: '취소',
    icon: 'close',
    actionType: 'custom',
    type: 'secondary',
    payload: { action: 'cancel_checkout' }
  })

  return actions
}

/**
 * Generate QuickActions for order confirmation
 */
export function generateOrderActions(orderId: string): QuickActionItem[] {
  const actions: QuickActionItem[] = []

  // View order details
  actions.push({
    id: 'view_order',
    label: '주문 상세보기',
    icon: 'eye',
    actionType: 'custom',
    type: 'primary',
    payload: { action: 'view_order', orderId }
  })

  // Continue shopping
  actions.push({
    id: 'continue_shopping',
    label: '쇼핑 계속하기',
    icon: 'arrow',
    actionType: 'custom',
    type: 'secondary',
    payload: { action: 'continue_shopping' }
  })

  return actions
}

/**
 * Generate QuickActions for error states
 */
export function generateErrorActions(errorType: 'network' | 'validation' | 'business', retryable: boolean = true): QuickActionItem[] {
  const actions: QuickActionItem[] = []

  if (retryable) {
    // Retry action
    actions.push({
      id: 'retry',
      label: '다시 시도',
      icon: 'retry',
      actionType: 'custom',
      type: 'primary',
      payload: { action: 'retry' }
    })
  }

  // Back/Cancel action
  actions.push({
    id: 'back',
    label: '이전으로',
    icon: 'arrow',
    actionType: 'previous_page',
    type: 'secondary',
    payload: { action: 'back' }
  })

  return actions
}

/**
 * Generate QuickActions for product detail view
 */
export function generateProductDetailActions(productId: string): QuickActionItem[] {
  const actions: QuickActionItem[] = []

  // Add to cart
  actions.push({
    id: `add_to_cart_${productId}`,
    label: '장바구니 담기',
    icon: 'cart',
    actionType: 'add_to_cart',
    type: 'secondary',
    payload: { action: 'add_to_cart', productId }
  })

  // Buy now
  actions.push({
    id: `buy_now_${productId}`,
    label: '바로 구매',
    icon: 'bag',
    actionType: 'buy_now',
    type: 'primary',
    payload: { action: 'buy_now', productId }
  })

  return actions
}

/**
 * Main function to generate context-appropriate QuickActions
 */
export function generateQuickActions(context: QuickActionContext): QuickActionItem[] {
  switch (context.type) {
    case 'recommendation':
      return generateRecommendationActions(context.data?.products || [])
    
    case 'cart':
      return generateCartActions(context.data?.cartItems || [])
    
    case 'checkout':
      return generateCheckoutActions('summary')
    
    case 'order':
      return generateOrderActions('order_id')
    
    case 'product_detail':
      return generateProductDetailActions(context.data?.products?.[0]?.id || '')
    
    case 'error':
      return generateErrorActions(
        context.data?.errorType || 'network',
        context.data?.retryable !== false
      )
    
    default:
      return []
  }
}
