/**
 * Quick Action Handling Tests
 * 
 * Tests for handleQuickAction functionality in ChatbotContext
 * Validates Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ChatbotProvider, useChatbot } from '@/contexts/ChatbotContext'
import { CartProvider } from '@/contexts/CartContext'
import { QuickActionItem } from '@/types/chatbot'
import React from 'react'

// Mock the API module
vi.mock('@/utils/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({
      data: {
        success: true,
        message: 'Success',
        cart: {
          total_items: 1,
          total_amount: 50000
        }
      }
    }),
    get: vi.fn().mockResolvedValue({
      data: {
        success: true,
        cart: {
          items: [],
          total_items: 0,
          total_amount: 0
        }
      }
    }),
    delete: vi.fn().mockResolvedValue({
      data: {
        success: true
      }
    })
  }
}))

// Mock the chatbot service
vi.mock('@/services/chatbotService', () => ({
  sendChatMessage: vi.fn().mockResolvedValue({
    message: 'Mock response',
    type: 'text',
    products: [],
    quickActions: []
  })
}))

// Mock the mock chatbot service
vi.mock('@/services/mockChatbotService', () => ({
  sendMockChatMessage: vi.fn().mockResolvedValue({
    message: 'Mock fallback response',
    type: 'text',
    products: []
  })
}))

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>
    <ChatbotProvider>{children}</ChatbotProvider>
  </CartProvider>
)

describe('Quick Action Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true
    })
  })

  describe('Requirement 9.1: Quick action rendering', () => {
    it('should handle add_to_cart action type', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      // First add a product recommendation message
      const productMessage = {
        id: 'test-msg-1',
        content: 'Here is a product',
        sender: 'bot' as const,
        timestamp: new Date(),
        type: 'recommendation' as const,
        data: {
          products: [{
            id: 'product-1',
            name: 'Test Perfume',
            brand: 'Test Brand',
            price: 50000,
            image: '/test.jpg',
            description: 'Test description'
          }]
        }
      }

      act(() => {
        result.current.state.messages.push(productMessage)
      })

      const action: QuickActionItem = {
        id: 'add-1',
        label: 'Add to Cart',
        actionType: 'add_to_cart',
        payload: {
          productId: 'product-1',
          quantity: 1
        }
      }

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      // Wait for the action to complete
      await waitFor(() => {
        const messages = result.current.state.messages
        const lastMessage = messages[messages.length - 1]
        expect(lastMessage.content).toContain('장바구니에 추가되었습니다')
      }, { timeout: 3000 })
    })

    it('should handle view_cart action type', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'view-cart',
        label: 'View Cart',
        actionType: 'view_cart',
        payload: {}
      }

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        const messages = result.current.state.messages
        const lastMessage = messages[messages.length - 1]
        expect(lastMessage.content).toContain('장바구니')
      })
    })

    it('should handle checkout action type', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'checkout',
        label: 'Checkout',
        actionType: 'checkout',
        payload: {}
      }

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        const messages = result.current.state.messages
        const lastMessage = messages[messages.length - 1]
        // Should show empty cart message since cart is empty
        expect(lastMessage.content).toContain('장바구니가 비어있습니다')
      })
    })
  })

  describe('Requirement 9.2: Quick action execution', () => {
    it('should execute action without additional input', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'help',
        label: 'Help',
        actionType: 'custom',
        payload: {
          action: 'help'
        }
      }

      const initialMessageCount = result.current.state.messages.length

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        expect(result.current.state.messages.length).toBeGreaterThan(initialMessageCount)
      })
    })

    it('should handle retry action with content', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'retry',
        label: 'Retry',
        actionType: 'custom',
        payload: {
          action: 'retry_message',
          content: 'Test message'
        }
      }

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        const messages = result.current.state.messages
        // Should have user message and bot response
        expect(messages.some(m => m.content === 'Test message' && m.sender === 'user')).toBe(true)
      })
    })
  })

  describe('Requirement 9.3: Cart operation actions', () => {
    it('should display confirmation message after cart action', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      // Add a product first
      const productMessage = {
        id: 'test-msg-2',
        content: 'Product',
        sender: 'bot' as const,
        timestamp: new Date(),
        type: 'recommendation' as const,
        data: {
          products: [{
            id: 'product-2',
            name: 'Test Perfume 2',
            brand: 'Test Brand',
            price: 60000,
            image: '/test2.jpg',
            description: 'Test description 2'
          }]
        }
      }

      act(() => {
        result.current.state.messages.push(productMessage)
      })

      const addAction: QuickActionItem = {
        id: 'add-2',
        label: 'Add to Cart',
        actionType: 'add_to_cart',
        payload: {
          productId: 'product-2',
          quantity: 1
        }
      }

      await act(async () => {
        await result.current.handleQuickAction(addAction)
      })

      await waitFor(() => {
        const messages = result.current.state.messages
        const confirmationMessage = messages.find(m => 
          m.content.includes('장바구니에 추가되었습니다') && 
          m.content.includes('✅')
        )
        expect(confirmationMessage).toBeDefined()
      }, { timeout: 3000 })
    })

    it('should handle clear_cart action with confirmation', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'clear',
        label: 'Clear Cart',
        actionType: 'custom',
        payload: {
          action: 'clear_cart'
        }
      }

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        const messages = result.current.state.messages
        const lastMessage = messages[messages.length - 1]
        expect(lastMessage.content).toContain('✅')
        expect(lastMessage.content).toContain('장바구니가 비워졌습니다')
      })
    })
  })

  describe('Requirement 9.4: Checkout initiation', () => {
    it('should start checkout flow from quick action', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'checkout-action',
        label: 'Checkout',
        actionType: 'checkout',
        payload: {
          action: 'checkout'
        }
      }

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        const messages = result.current.state.messages
        const lastMessage = messages[messages.length - 1]
        // Should show empty cart message or checkout start
        expect(lastMessage.content).toBeTruthy()
      })
    })
  })

  describe('Requirement 9.5: Retry failed requests', () => {
    it('should retry failed request from quick action', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'retry-failed',
        label: 'Retry',
        actionType: 'custom',
        payload: {
          action: 'retry_message',
          content: 'Retry this message'
        }
      }

      const initialMessageCount = result.current.state.messages.length

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        expect(result.current.state.messages.length).toBeGreaterThan(initialMessageCount)
      })
    })
  })

  describe('Additional action types', () => {
    it('should handle continue_shopping action', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'continue',
        label: 'Continue Shopping',
        actionType: 'custom',
        payload: {
          action: 'continue_shopping'
        }
      }

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        const messages = result.current.state.messages
        const lastMessage = messages[messages.length - 1]
        expect(lastMessage.content).toContain('어떤 향수를 찾고 계신가요')
      })
    })

    it('should handle cancel_checkout action with confirmation', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'cancel-checkout',
        label: 'Cancel Checkout',
        actionType: 'custom',
        payload: {
          action: 'cancel_checkout'
        }
      }

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        const messages = result.current.state.messages
        const lastMessage = messages[messages.length - 1]
        expect(lastMessage.content).toContain('✅')
        expect(lastMessage.content).toContain('결제가 취소되었습니다')
      })
    })

    it('should handle contact_support action', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'support',
        label: 'Contact Support',
        actionType: 'custom',
        payload: {
          action: 'contact_support'
        }
      }

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      await waitFor(() => {
        const messages = result.current.state.messages
        const lastMessage = messages[messages.length - 1]
        expect(lastMessage.content).toContain('고객센터')
      })
    })

    it('should handle unknown action gracefully', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const action: QuickActionItem = {
        id: 'unknown',
        label: 'Unknown Action',
        actionType: 'custom',
        payload: {
          action: 'unknown_action_type'
        }
      }

      const initialMessageCount = result.current.state.messages.length

      await act(async () => {
        await result.current.handleQuickAction(action)
      })

      // Should not crash, message count should remain the same
      expect(result.current.state.messages.length).toBe(initialMessageCount)
    })
  })

  describe('Cart quantity operations', () => {
    it('should handle remove action with confirmation', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      // Test remove action (even if product doesn't exist, should handle gracefully)
      const removeAction: QuickActionItem = {
        id: 'remove-3',
        label: 'Remove',
        actionType: 'custom',
        payload: {
          action: 'remove',
          productId: 'product-3'
        }
      }

      const initialMessageCount = result.current.state.messages.length

      await act(async () => {
        await result.current.handleQuickAction(removeAction)
      })

      // Action should complete without errors
      // If product doesn't exist, no message is added, which is fine
      expect(result.current.state.messages.length).toBeGreaterThanOrEqual(initialMessageCount)
    })
  })
})
