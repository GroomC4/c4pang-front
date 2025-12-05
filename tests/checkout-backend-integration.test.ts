import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ChatbotProvider, useChatbot } from '@/contexts/ChatbotContext'
import { CartProvider } from '@/contexts/CartContext'
import React from 'react'

// Mock fetch
global.fetch = vi.fn()

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(
    CartProvider,
    null,
    React.createElement(ChatbotProvider, null, children)
  )

describe('Checkout Backend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset fetch mock
    ;(global.fetch as any).mockReset()
  })

  describe('startCheckout', () => {
    it('should fetch payment methods from backend when starting checkout', async () => {
      const mockCheckoutResponse = {
        success: true,
        action: 'show_checkout_form',
        cart: { total_items: 0, total_amount: 0 },
        payment_methods: [
          {
            method_id: 'credit_card',
            method_type: 'credit_card',
            display_name: '신용/체크카드',
            icon: '💳',
            is_available: true
          },
          {
            method_id: 'kakaopay',
            method_type: 'kakaopay',
            display_name: '카카오페이',
            icon: '🟡',
            is_available: true
          }
        ]
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCheckoutResponse
      })

      const { result } = renderHook(() => useChatbot(), { wrapper })

      // Add a product to cart first
      await act(async () => {
        // Simulate having a product in messages
        const mockMessage = {
          id: 'test-msg',
          content: 'Test',
          sender: 'bot' as const,
          timestamp: new Date(),
          type: 'product' as const,
          data: {
            products: [
              {
                id: 'test-product',
                name: 'Test Product',
                brand: 'Test Brand',
                price: 100000,
                image: 'test.jpg',
                description: 'Test description'
              }
            ]
          }
        }
        
        // Manually add message to state
        result.current.state.messages.push(mockMessage)
      })

      await act(async () => {
        await result.current.startCheckout('direct', 'test-product')
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/chatbot/action',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('checkout')
          })
        )
      })

      // Check that checkout state is initialized
      expect(result.current.state.checkoutState).toBeTruthy()
      expect(result.current.state.checkoutState?.mode).toBe('direct')
      expect(result.current.state.checkoutState?.step).toBe('summary')
    })

    it('should handle payment methods fetch failure gracefully', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      await act(async () => {
        // Add mock product
        result.current.state.messages.push({
          id: 'test-msg',
          content: 'Test',
          sender: 'bot' as const,
          timestamp: new Date(),
          type: 'product' as const,
          data: {
            products: [
              {
                id: 'test-product',
                name: 'Test Product',
                brand: 'Test Brand',
                price: 100000,
                image: 'test.jpg',
                description: 'Test description'
              }
            ]
          }
        })
      })

      // Mock fetch to reject
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await result.current.startCheckout('direct', 'test-product')
      })

      // Should show error message when payment methods fetch fails
      await waitFor(() => {
        const lastMessage = result.current.state.messages[result.current.state.messages.length - 1]
        expect(lastMessage.content).toContain('오류')
      })
    })
  })

  describe('submitShipping', () => {
    it('should validate and submit shipping info', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      // First start checkout
      await act(async () => {
        result.current.state.messages.push({
          id: 'test-msg',
          content: 'Test',
          sender: 'bot' as const,
          timestamp: new Date(),
          type: 'product' as const,
          data: {
            products: [
              {
                id: 'test-product',
                name: 'Test Product',
                brand: 'Test Brand',
                price: 100000,
                image: 'test.jpg',
                description: 'Test description'
              }
            ]
          }
        })

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, methods: [] })
        })
        await result.current.startCheckout('direct', 'test-product')
      })

      const shippingInfo = {
        recipientName: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구 테헤란로 123',
        addressDetail: '4층',
        postalCode: '12345',
        deliveryMessage: '문 앞에 놓아주세요'
      }

      // Mock validation endpoint (optional)
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await act(async () => {
        await result.current.submitShipping(shippingInfo)
      })

      // Check that shipping info is stored in checkout state
      await waitFor(() => {
        expect(result.current.state.checkoutState?.shippingInfo).toEqual(shippingInfo)
        expect(result.current.state.checkoutState?.step).toBe('payment')
      })
    })

    it('should reject incomplete shipping info', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      const incompleteShippingInfo = {
        recipientName: '',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        postalCode: '12345'
      }

      await act(async () => {
        await result.current.submitShipping(incompleteShippingInfo as any)
      })

      // Should show error message
      await waitFor(() => {
        const lastMessage = result.current.state.messages[result.current.state.messages.length - 1]
        expect(lastMessage.content).toContain('배송지 정보')
      })

      // Checkout state should not progress
      expect(result.current.state.checkoutState?.step).not.toBe('payment')
    })
  })

  describe('submitPayment', () => {
    it('should submit payment method selection', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      // First start checkout and submit shipping
      await act(async () => {
        result.current.state.messages.push({
          id: 'test-msg',
          content: 'Test',
          sender: 'bot' as const,
          timestamp: new Date(),
          type: 'product' as const,
          data: {
            products: [
              {
                id: 'test-product',
                name: 'Test Product',
                brand: 'Test Brand',
                price: 100000,
                image: 'test.jpg',
                description: 'Test description'
              }
            ]
          }
        })

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, payment_methods: [] })
        })
        await result.current.startCheckout('direct', 'test-product')

        await result.current.submitShipping({
          recipientName: '홍길동',
          phone: '010-1234-5678',
          address: '서울시 강남구',
          postalCode: '12345'
        })
      })

      const paymentMethod = {
        methodId: 'credit_card',
        methodType: 'credit_card' as const,
        displayName: '신용/체크카드',
        icon: '💳',
        isAvailable: true
      }

      await act(async () => {
        await result.current.submitPayment(paymentMethod)
      })

      // Check that payment method is stored
      await waitFor(() => {
        expect(result.current.state.checkoutState?.paymentMethod).toEqual(paymentMethod)
        expect(result.current.state.checkoutState?.step).toBe('confirmation')
      })
    })
  })

  describe('confirmOrder', () => {
    it('should send complete order data to backend', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      // Setup checkout state
      await act(async () => {
        // Add product to messages
        result.current.state.messages.push({
          id: 'test-msg',
          content: 'Test',
          sender: 'bot' as const,
          timestamp: new Date(),
          type: 'product' as const,
          data: {
            products: [
              {
                id: 'test-product',
                name: 'Test Product',
                brand: 'Test Brand',
                price: 100000,
                image: 'test.jpg',
                description: 'Test description'
              }
            ]
          }
        })

        // Start checkout
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, payment_methods: [] })
        })
        await result.current.startCheckout('direct', 'test-product')
      })

      // Submit shipping
      await act(async () => {
        await result.current.submitShipping({
          recipientName: '홍길동',
          phone: '010-1234-5678',
          address: '서울시 강남구 테헤란로 123',
          addressDetail: '4층',
          postalCode: '12345'
        })
      })

      // Submit payment
      await act(async () => {
        await result.current.submitPayment({
          methodId: 'credit_card',
          methodType: 'credit_card',
          displayName: '신용/체크카드',
          isAvailable: true
        })
      })

      // Mock order creation response
      const mockOrderResponse = {
        success: true,
        order: {
          order_id: 'ORD-20231201-ABC123',
          order_date: new Date().toISOString(),
          total_amount: 100000,
          items: [],
          shipping_info: {
            recipient_name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구 테헤란로 123',
            address_detail: '4층',
            postal_code: '12345'
          },
          payment_method: 'credit_card',
          estimated_delivery: '2023년 12월 05일',
          status: 'pending'
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrderResponse
      })

      // Confirm order
      await act(async () => {
        await result.current.confirmOrder()
      })

      // Verify order creation API was called with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/chatbot/order/create',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: expect.stringContaining('checkout_form')
          })
        )
      })

      // Verify order confirmation message was added
      await waitFor(() => {
        const lastMessage = result.current.state.messages[result.current.state.messages.length - 1]
        expect(lastMessage.type).toBe('order')
        expect(lastMessage.data?.orderConfirmation).toBeTruthy()
        expect(lastMessage.data?.orderConfirmation?.orderId).toBe('ORD-20231201-ABC123')
      })

      // Verify checkout state is cleared
      expect(result.current.state.checkoutState).toBeNull()
    })

    it('should handle order creation failure and preserve cart', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      // Setup checkout state with cart mode
      await act(async () => {
        // Mock cart with items
        result.current.state.messages.push({
          id: 'test-msg',
          content: 'Test',
          sender: 'bot' as const,
          timestamp: new Date(),
          type: 'product' as const,
          data: {
            products: [
              {
                id: 'test-product',
                name: 'Test Product',
                brand: 'Test Brand',
                price: 100000,
                image: 'test.jpg',
                description: 'Test description'
              }
            ]
          }
        })

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, payment_methods: [] })
        })
        await result.current.startCheckout('direct', 'test-product')

        await result.current.submitShipping({
          recipientName: '홍길동',
          phone: '010-1234-5678',
          address: '서울시 강남구',
          postalCode: '12345'
        })

        await result.current.submitPayment({
          methodId: 'credit_card',
          methodType: 'credit_card',
          displayName: '신용카드',
          isAvailable: true
        })
      })

      // Mock order creation failure
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: '재고가 부족합니다.' })
      })

      await act(async () => {
        await result.current.confirmOrder()
      })

      // Verify error message was shown
      await waitFor(() => {
        const lastMessage = result.current.state.messages[result.current.state.messages.length - 1]
        // Error handler may transform the message, check for error indication or backend error message
        expect(lastMessage.content).toMatch(/오류|실패|문제|재고가 부족|장바구니 내용은 안전하게/)
      })

      // Verify checkout state is preserved (not cleared)
      expect(result.current.state.checkoutState).toBeTruthy()
    })

    it('should include all required fields in order request', async () => {
      const { result } = renderHook(() => useChatbot(), { wrapper })

      // Setup complete checkout flow
      await act(async () => {
        result.current.state.messages.push({
          id: 'test-msg',
          content: 'Test',
          sender: 'bot' as const,
          timestamp: new Date(),
          type: 'product' as const,
          data: {
            products: [
              {
                id: 'test-product',
                name: 'Test Product',
                brand: 'Test Brand',
                price: 100000,
                image: 'test.jpg',
                description: 'Test description'
              }
            ]
          }
        })

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, payment_methods: [] })
        })

        await result.current.startCheckout('direct', 'test-product')
        await result.current.submitShipping({
          recipientName: '홍길동',
          phone: '010-1234-5678',
          address: '서울시 강남구 테헤란로 123',
          addressDetail: '4층',
          postalCode: '12345',
          deliveryMessage: '문 앞에 놓아주세요'
        })
        await result.current.submitPayment({
          methodId: 'kakaopay',
          methodType: 'kakaopay',
          displayName: '카카오페이',
          isAvailable: true
        })
      })

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          order: {
            order_id: 'ORD-123',
            order_date: new Date().toISOString(),
            total_amount: 100000,
            estimated_delivery: '2023-12-05',
            status: 'pending'
          }
        })
      })

      await act(async () => {
        await result.current.confirmOrder()
      })

      // Verify the request body contains all required fields
      await waitFor(() => {
        const fetchCalls = (global.fetch as any).mock.calls
        const orderCreateCall = fetchCalls.find((call: any) => 
          call[0] === '/api/v1/chatbot/order/create'
        )
        
        expect(orderCreateCall).toBeTruthy()
        
        const requestBody = JSON.parse(orderCreateCall[1].body)
        expect(requestBody).toHaveProperty('user_id')
        expect(requestBody).toHaveProperty('session_id')
        expect(requestBody).toHaveProperty('checkout_form')
        expect(requestBody).toHaveProperty('payment_method')
        
        // Verify checkout_form structure
        expect(requestBody.checkout_form).toHaveProperty('recipient_name', '홍길동')
        expect(requestBody.checkout_form).toHaveProperty('phone', '010-1234-5678')
        expect(requestBody.checkout_form).toHaveProperty('address')
        expect(requestBody.checkout_form).toHaveProperty('postal_code', '12345')
        expect(requestBody.checkout_form).toHaveProperty('delivery_message', '문 앞에 놓아주세요')
        
        // Verify payment method
        expect(requestBody.payment_method).toBe('kakaopay')
      })
    })
  })
})
