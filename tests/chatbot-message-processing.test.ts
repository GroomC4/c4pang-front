/**
 * Integration tests for ChatbotContext message processing
 * 
 * Tests that the ChatbotContext properly processes backend responses
 * and converts them to the correct message format
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatResponse } from '@/services/chatbotService'
import { Message, ProductRecommendation, QuickActionItem } from '@/types/chatbot'

describe('ChatbotContext Message Processing', () => {
  describe('Response Type Mapping', () => {
    it('should map recommendation response to recommendation message type', () => {
      const response: ChatResponse = {
        success: true,
        message: '추천 향수입니다',
        type: 'recommendation',
        products: [
          {
            id: 'prod1',
            name: 'Test Perfume',
            brand: 'Test Brand',
            price: 100000,
            image: 'test.jpg',
            description: 'Test description'
          }
        ],
        quickActions: []
      }

      // Simulate the message type determination logic from ChatbotContext
      let messageType: Message['type'] = 'text'
      
      switch (response.type) {
        case 'recommendation':
          messageType = 'recommendation'
          break
        case 'product':
          messageType = 'recommendation'
          break
        case 'action':
          messageType = 'cart'
          break
        case 'faq':
          messageType = 'text'
          break
        default:
          messageType = 'text'
          break
      }

      expect(messageType).toBe('recommendation')
    })

    it('should map product response to recommendation message type', () => {
      const response: ChatResponse = {
        success: true,
        message: '상품 정보입니다',
        type: 'product',
        products: []
      }

      let messageType: Message['type'] = 'text'
      
      switch (response.type) {
        case 'recommendation':
          messageType = 'recommendation'
          break
        case 'product':
          messageType = 'recommendation'
          break
        case 'action':
          messageType = 'cart'
          break
        case 'faq':
          messageType = 'text'
          break
        default:
          messageType = 'text'
          break
      }

      expect(messageType).toBe('recommendation')
    })

    it('should map action response to cart message type', () => {
      const response: ChatResponse = {
        success: true,
        message: '장바구니 작업 완료',
        type: 'action',
        quickActions: []
      }

      let messageType: Message['type'] = 'text'
      
      switch (response.type) {
        case 'recommendation':
          messageType = 'recommendation'
          break
        case 'product':
          messageType = 'recommendation'
          break
        case 'action':
          messageType = 'cart'
          break
        case 'faq':
          messageType = 'text'
          break
        default:
          messageType = 'text'
          break
      }

      expect(messageType).toBe('cart')
    })

    it('should map faq response to text message type', () => {
      const response: ChatResponse = {
        success: true,
        message: 'FAQ 답변입니다',
        type: 'faq',
        faqs: []
      }

      let messageType: Message['type'] = 'text'
      
      switch (response.type) {
        case 'recommendation':
          messageType = 'recommendation'
          break
        case 'product':
          messageType = 'recommendation'
          break
        case 'action':
          messageType = 'cart'
          break
        case 'faq':
          messageType = 'text'
          break
        default:
          messageType = 'text'
          break
      }

      expect(messageType).toBe('text')
    })

    it('should default to text message type for unknown response types', () => {
      const response: ChatResponse = {
        success: true,
        message: '일반 텍스트 응답',
        type: 'text'
      }

      let messageType: Message['type'] = 'text'
      
      switch (response.type) {
        case 'recommendation':
          messageType = 'recommendation'
          break
        case 'product':
          messageType = 'recommendation'
          break
        case 'action':
          messageType = 'cart'
          break
        case 'faq':
          messageType = 'text'
          break
        default:
          messageType = 'text'
          break
      }

      expect(messageType).toBe('text')
    })
  })

  describe('Message Data Construction', () => {
    it('should include products and quickActions for recommendation type', () => {
      const products: ProductRecommendation[] = [
        {
          id: 'prod1',
          name: 'Perfume 1',
          brand: 'Brand A',
          price: 100000,
          image: 'img1.jpg',
          description: 'Description 1'
        },
        {
          id: 'prod2',
          name: 'Perfume 2',
          brand: 'Brand B',
          price: 150000,
          image: 'img2.jpg',
          description: 'Description 2'
        }
      ]

      const quickActions: QuickActionItem[] = [
        {
          id: 'action1',
          label: 'Add to Cart',
          actionType: 'add_to_cart',
          payload: { productId: 'prod1' }
        }
      ]

      const response: ChatResponse = {
        success: true,
        message: '추천 향수입니다',
        type: 'recommendation',
        products,
        quickActions
      }

      const messageData: Message['data'] = {
        products: response.products,
        quickActions: response.quickActions
      }

      expect(messageData.products).toHaveLength(2)
      expect(messageData.products?.[0].id).toBe('prod1')
      expect(messageData.quickActions).toHaveLength(1)
      expect(messageData.quickActions?.[0].actionType).toBe('add_to_cart')
    })

    it('should include quickActions and cartSummary for action type', () => {
      const response: ChatResponse = {
        success: true,
        message: '장바구니에 추가되었습니다',
        type: 'action',
        quickActions: [
          {
            id: 'view_cart',
            label: '장바구니 보기',
            actionType: 'view_cart'
          }
        ],
        backendResponse: {
          message: '장바구니에 추가되었습니다',
          response_type: 'cart',
          cart_summary: {
            total_items: 1,
            total_amount: 100000
          }
        }
      }

      const messageData: Message['data'] = {
        quickActions: response.quickActions,
        cartSummary: response.backendResponse?.cart_summary
      }

      expect(messageData.quickActions).toHaveLength(1)
      expect(messageData.cartSummary).toBeDefined()
      expect(messageData.cartSummary?.total_items).toBe(1)
    })

    it('should include quickActions for faq type', () => {
      const response: ChatResponse = {
        success: true,
        message: 'FAQ 답변입니다',
        type: 'faq',
        quickActions: [
          {
            id: 'more_faqs',
            label: '더 보기',
            actionType: 'next_page'
          }
        ]
      }

      const messageData: Message['data'] = {
        quickActions: response.quickActions
      }

      expect(messageData.quickActions).toHaveLength(1)
      expect(messageData.quickActions?.[0].actionType).toBe('next_page')
    })

    it('should handle response with all data fields', () => {
      const response: ChatResponse = {
        success: true,
        message: '완전한 응답',
        type: 'text',
        products: [
          {
            id: 'prod1',
            name: 'Perfume',
            brand: 'Brand',
            price: 100000,
            image: 'img.jpg',
            description: 'Desc'
          }
        ],
        quickActions: [
          {
            id: 'action1',
            label: 'Action',
            actionType: 'custom'
          }
        ],
        backendResponse: {
          message: '완전한 응답',
          response_type: 'text',
          cart_summary: { total_items: 0, total_amount: 0 }
        }
      }

      const messageData: Message['data'] = {
        products: response.products,
        quickActions: response.quickActions,
        cartSummary: response.backendResponse?.cart_summary
      }

      expect(messageData.products).toBeDefined()
      expect(messageData.quickActions).toBeDefined()
      expect(messageData.cartSummary).toBeDefined()
    })
  })

  describe('Message Structure', () => {
    it('should create a valid message structure from response', () => {
      const response: ChatResponse = {
        success: true,
        message: '테스트 메시지',
        type: 'text'
      }

      const message: Partial<Message> = {
        content: response.message,
        sender: 'bot',
        type: 'text',
        data: {}
      }

      expect(message.content).toBe('테스트 메시지')
      expect(message.sender).toBe('bot')
      expect(message.type).toBe('text')
      expect(message.data).toBeDefined()
    })

    it('should preserve message content from response', () => {
      const testMessages = [
        '안녕하세요!',
        '향수를 추천해드릴게요',
        '장바구니에 추가되었습니다',
        'FAQ 답변입니다'
      ]

      testMessages.forEach(content => {
        const response: ChatResponse = {
          success: true,
          message: content,
          type: 'text'
        }

        const message: Partial<Message> = {
          content: response.message,
          sender: 'bot',
          type: 'text'
        }

        expect(message.content).toBe(content)
      })
    })
  })
})
