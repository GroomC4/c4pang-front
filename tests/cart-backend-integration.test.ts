import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cartApiService } from '@/services/cartApiService'
import { api } from '@/utils/api'

// Mock the api module
vi.mock('@/utils/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Cart Backend Integration', () => {
  const mockUserId = 'test-user'
  const mockSessionId = 'test-session-123'
  const mockProductId = 'product-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addToCart', () => {
    it('should call backend API with correct parameters', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '상품이 장바구니에 추가되었습니다.',
          cart: {
            total_items: 1,
            total_amount: 50000
          }
        }
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await cartApiService.addToCart(
        mockUserId,
        mockSessionId,
        mockProductId,
        1
      )

      expect(api.post).toHaveBeenCalledWith('/api/v1/chatbot/action', {
        user_id: mockUserId,
        session_id: mockSessionId,
        action_type: 'add_to_cart',
        payload: {
          product_id: mockProductId,
          quantity: 1
        }
      })

      expect(result.success).toBe(true)
      expect(result.cart?.total_items).toBe(1)
    })

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error')
      vi.mocked(api.post).mockRejectedValue(mockError)

      await expect(
        cartApiService.addToCart(mockUserId, mockSessionId, mockProductId, 1)
      ).rejects.toThrow('Network error')
    })
  })

  describe('getCartSummary', () => {
    it('should fetch cart summary from backend', async () => {
      const mockCartSummary = {
        total_items: 2,
        total_amount: 100000,
        items: [
          {
            product_id: 'product-1',
            brand: 'Brand A',
            name: 'Product 1',
            price: 50000,
            quantity: 2,
            total_price: 100000
          }
        ]
      }

      const mockResponse = {
        data: {
          success: true,
          cart: mockCartSummary
        }
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await cartApiService.getCartSummary(mockUserId, mockSessionId)

      expect(api.get).toHaveBeenCalledWith(
        `/api/v1/chatbot/cart/${mockUserId}/${mockSessionId}`
      )

      expect(result.total_items).toBe(2)
      expect(result.total_amount).toBe(100000)
      expect(result.items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity via backend', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '수량이 변경되었습니다.',
          cart: {
            total_items: 3,
            total_amount: 150000
          }
        }
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await cartApiService.updateQuantity(
        mockUserId,
        mockSessionId,
        mockProductId,
        3
      )

      expect(api.post).toHaveBeenCalledWith(
        '/api/v1/chatbot/cart/update',
        null,
        {
          params: {
            user_id: mockUserId,
            session_id: mockSessionId,
            product_id: mockProductId,
            quantity: 3
          }
        }
      )

      expect(result.success).toBe(true)
    })
  })

  describe('removeFromCart', () => {
    it('should remove item from cart via backend', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '상품이 제거되었습니다.',
          cart: {
            total_items: 0,
            total_amount: 0
          }
        }
      }

      vi.mocked(api.delete).mockResolvedValue(mockResponse)

      const result = await cartApiService.removeFromCart(
        mockUserId,
        mockSessionId,
        mockProductId
      )

      expect(api.delete).toHaveBeenCalledWith(
        '/api/v1/chatbot/cart/remove',
        {
          params: {
            user_id: mockUserId,
            session_id: mockSessionId,
            product_id: mockProductId
          }
        }
      )

      expect(result.success).toBe(true)
    })
  })

  describe('clearCart', () => {
    it('should clear entire cart via backend', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '장바구니가 비워졌습니다.'
        }
      }

      vi.mocked(api.delete).mockResolvedValue(mockResponse)

      const result = await cartApiService.clearCart(mockUserId, mockSessionId)

      expect(api.delete).toHaveBeenCalledWith(
        '/api/v1/chatbot/cart/clear',
        {
          params: {
            user_id: mockUserId,
            session_id: mockSessionId
          }
        }
      )

      expect(result.success).toBe(true)
    })
  })
})
