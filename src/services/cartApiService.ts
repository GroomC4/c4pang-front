import { chatbotApi } from '@/utils/api'

export interface BackendCartItem {
  product_id: string
  brand: string
  name: string
  price: number
  quantity: number
  image_url?: string
  concentration?: string
  total_price: number
}

export interface BackendCartSummary {
  total_items: number
  total_amount: number
  items: BackendCartItem[]
  updated_at?: string
}

export interface CartApiResponse {
  success: boolean
  message?: string
  cart?: {
    total_items: number
    total_amount: number
  }
}

/**
 * Cart API Service - Handles backend cart operations
 */
export class CartApiService {
  private static instance: CartApiService

  public static getInstance(): CartApiService {
    if (!CartApiService.instance) {
      CartApiService.instance = new CartApiService()
    }
    return CartApiService.instance
  }

  /**
   * Add product to backend cart
   */
  public async addToCart(
    userId: string,
    sessionId: string,
    productId: string,
    quantity: number = 1
  ): Promise<CartApiResponse> {
    try {
      const response = await chatbotApi.post<CartApiResponse>('/api/v1/chatbot/action', {
        user_id: userId,
        session_id: sessionId,
        action_type: 'add_to_cart',
        payload: {
          product_id: productId,
          quantity
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to add to cart:', error)
      throw error
    }
  }

  /**
   * Get cart summary from backend
   */
  public async getCartSummary(
    userId: string,
    sessionId: string
  ): Promise<BackendCartSummary> {
    try {
      const response = await chatbotApi.get<{ success: boolean; cart: BackendCartSummary }>(
        `/api/v1/chatbot/cart/${userId}/${sessionId}`
      )
      return response.data.cart
    } catch (error: any) {
      console.error('Failed to get cart summary:', error)
      throw error
    }
  }

  /**
   * Update cart item quantity
   */
  public async updateQuantity(
    userId: string,
    sessionId: string,
    productId: string,
    quantity: number
  ): Promise<CartApiResponse> {
    try {
      const response = await chatbotApi.post<CartApiResponse>('/api/v1/chatbot/cart/update', null, {
        params: {
          user_id: userId,
          session_id: sessionId,
          product_id: productId,
          quantity
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to update quantity:', error)
      throw error
    }
  }

  /**
   * Remove item from cart
   */
  public async removeFromCart(
    userId: string,
    sessionId: string,
    productId: string
  ): Promise<CartApiResponse> {
    try {
      const response = await chatbotApi.delete<CartApiResponse>('/api/v1/chatbot/cart/remove', {
        params: {
          user_id: userId,
          session_id: sessionId,
          product_id: productId
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to remove from cart:', error)
      throw error
    }
  }

  /**
   * Clear entire cart
   */
  public async clearCart(
    userId: string,
    sessionId: string
  ): Promise<CartApiResponse> {
    try {
      const response = await chatbotApi.delete<CartApiResponse>('/api/v1/chatbot/cart/clear', {
        params: {
          user_id: userId,
          session_id: sessionId
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  }
}

export const cartApiService = CartApiService.getInstance()
