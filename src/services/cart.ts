import apiService from './api'
import { Product } from './product'

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
}

export interface Cart {
  id: string
  customerId: string
  items: CartItem[]
  totalAmount: number
  totalQuantity: number
  createdAt: string
  updatedAt: string
}

export interface AddToCartRequest {
  productId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

class CartService {
  async getCart(): Promise<Cart> {
    const response = await apiService.instance.get('/api/v1/cart')
    return response.data
  }

  async addToCart(data: AddToCartRequest): Promise<Cart> {
    const response = await apiService.instance.post('/api/v1/cart/items', data)
    return response.data
  }

  async updateCartItem(itemId: string, data: UpdateCartItemRequest): Promise<Cart> {
    const response = await apiService.instance.put(`/api/v1/cart/items/${itemId}`, data)
    return response.data
  }

  async removeCartItem(itemId: string): Promise<Cart> {
    const response = await apiService.instance.delete(`/api/v1/cart/items/${itemId}`)
    return response.data
  }

  async clearCart(): Promise<void> {
    await apiService.instance.delete('/api/v1/cart')
  }

  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart()
      return cart.totalQuantity || 0
    } catch (error) {
      console.warn('Failed to get cart item count:', error)
      return 0
    }
  }
}

export const cartService = new CartService()
export default cartService