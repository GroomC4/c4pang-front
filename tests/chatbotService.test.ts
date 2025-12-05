/**
 * Tests for ChatbotService API endpoint modifications
 * Requirements: 2.1, 2.2, 3.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ChatbotService } from '@/services/chatbotService'
import { api } from '@/utils/api'
import { BackendBotResponse } from '@/types/chatbot'

// Mock the API module
vi.mock('@/utils/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock recommendation service
vi.mock('@/services/recommendationService', () => ({
  getPersonalizedRecommendations: vi.fn(),
  searchFAQs: vi.fn(),
  getFAQs: vi.fn(),
}))

describe('ChatbotService API Endpoint Modifications', () => {
  let chatbotService: ChatbotService
  const mockUserId = 'test-user-123'
  const mockSessionId = 'test-session-456'

  beforeEach(() => {
    chatbotService = ChatbotService.getInstance()
    chatbotService.setUserId(mockUserId)
    chatbotService.setSessionId(mockSessionId)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendMessage()', () => {
    it('should call /api/v1/chatbot/message with correct format', async () => {
      // **Feature: chatbot-integration, Property 3: Message Request Format**
      const mockBackendResponse: BackendBotResponse = {
        message: 'Hello! How can I help you?',
        response_type: 'text',
        product_cards: [],
        quick_actions: [],
      }

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockBackendResponse })

      const testMessage = 'Hello, I need help'
      await chatbotService.sendMessage({ message: testMessage })

      // Verify the API was called with correct endpoint
      expect(api.post).toHaveBeenCalledWith(
        '/api/v1/chatbot/message',
        expect.objectContaining({
          user_id: mockUserId,
          session_id: mockSessionId,
          message: testMessage,
        })
      )
    })

    it('should include session ID in all requests', async () => {
      // **Feature: chatbot-integration, Property 8: Session ID Consistency**
      const mockBackendResponse: BackendBotResponse = {
        message: 'Response',
        response_type: 'text',
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockBackendResponse })

      // Send multiple messages
      await chatbotService.sendMessage({ message: 'Message 1' })
      await chatbotService.sendMessage({ message: 'Message 2' })
      await chatbotService.sendMessage({ message: 'Message 3' })

      // Verify all requests include the same session ID
      const calls = vi.mocked(api.post).mock.calls
      expect(calls).toHaveLength(3)
      
      const sessionIds = calls.map(call => call[1].session_id)
      expect(sessionIds[0]).toBe(sessionIds[1])
      expect(sessionIds[1]).toBe(sessionIds[2])
    })

    it('should handle network errors with retry logic', async () => {
      // Network error simulation
      const networkError = new Error('Network Error')
      ;(networkError as any).code = 'ECONNABORTED'

      vi.mocked(api.post)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          data: {
            message: 'Success after retry',
            response_type: 'text',
          },
        })

      const response = await chatbotService.sendMessage({ message: 'Test' })

      // Should have retried and eventually succeeded
      expect(api.post).toHaveBeenCalledTimes(3)
      expect(response.success).toBe(true)
    })

    it('should fall back to local response after max retries', async () => {
      const networkError = new Error('Network Error')
      vi.mocked(api.post).mockRejectedValue(networkError)

      const response = await chatbotService.sendMessage({ message: 'Test' })

      // Should return fallback response
      expect(response.success).toBeDefined()
      expect(response.message).toBeDefined()
      expect(response.error).toBeDefined()
    })

    it('should convert backend response to frontend format', async () => {
      const mockBackendResponse: BackendBotResponse = {
        message: 'Here are some recommendations',
        response_type: 'recommendation',
        product_cards: [
          {
            id: 'prod-1',
            brand: 'Chanel',
            name: 'No. 5',
            price: 150000,
            image_url: 'https://example.com/image.jpg',
            description: 'Classic fragrance',
          },
        ],
        quick_actions: [
          {
            id: 'action-1',
            label: 'Add to Cart',
            action_type: 'add_to_cart',
            payload: { product_id: 'prod-1' },
          },
        ],
      }

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockBackendResponse })

      const response = await chatbotService.sendMessage({ message: 'Recommend perfumes' })

      expect(response.success).toBe(true)
      expect(response.message).toBe('Here are some recommendations')
      expect(response.products).toHaveLength(1)
      expect(response.products![0].id).toBe('prod-1')
      expect(response.products![0].brand).toBe('Chanel')
      expect(response.quickActions).toHaveLength(1)
    })
  })

  describe('getRecommendations()', () => {
    it('should send preferences as a formatted message to backend', async () => {
      const mockBackendResponse: BackendBotResponse = {
        message: 'Based on your preferences...',
        response_type: 'recommendation',
        product_cards: [],
      }

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockBackendResponse })

      await chatbotService.getRecommendations({
        fragranceType: ['플로럴', '시트러스'],
        priceRange: { min: 50000, max: 150000 },
        brand: 'Chanel',
        occasion: '데일리',
      })

      expect(api.post).toHaveBeenCalledWith(
        '/api/v1/chatbot/message',
        expect.objectContaining({
          user_id: mockUserId,
          session_id: mockSessionId,
          message: expect.stringContaining('플로럴'),
        })
      )
    })

    it('should include session ID in recommendation requests', async () => {
      const mockBackendResponse: BackendBotResponse = {
        message: 'Recommendations',
        response_type: 'recommendation',
      }

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockBackendResponse })

      await chatbotService.getRecommendations({
        fragranceType: ['플로럴'],
      })

      const call = vi.mocked(api.post).mock.calls[0]
      expect(call[1]).toHaveProperty('session_id')
      expect(call[1].session_id).toBe(mockSessionId)
    })
  })

  describe('Network Error Handling', () => {
    it('should handle 500 server errors with retry', async () => {
      const serverError = {
        response: { status: 500 },
        message: 'Internal Server Error',
      }

      vi.mocked(api.post)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce({
          data: {
            message: 'Success',
            response_type: 'text',
          },
        })

      const response = await chatbotService.sendMessage({ message: 'Test' })

      expect(api.post).toHaveBeenCalledTimes(2)
      expect(response.success).toBe(true)
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout')
      ;(timeoutError as any).code = 'ECONNABORTED'

      vi.mocked(api.post).mockRejectedValue(timeoutError)

      const response = await chatbotService.sendMessage({ message: 'Test' })

      // Should fall back to local response with error code
      expect(response.error).toBe('TIMEOUT')
      // Fallback response should be successful with helpful message
      expect(response.success).toBe(true)
      expect(response.quickActions).toBeDefined()
      expect(response.quickActions?.some(a => a.label.includes('다시 시도'))).toBe(true)
    })

    it('should handle connection refused errors', async () => {
      const connectionError = new Error('Connection refused')

      vi.mocked(api.post).mockRejectedValue(connectionError)

      const response = await chatbotService.sendMessage({ message: 'Test' })

      // Should fall back to local response with error code
      expect(response.error).toBe('NETWORK_ERROR')
      // Fallback response should be successful with helpful message
      expect(response.success).toBe(true)
      expect(response.quickActions).toBeDefined()
      expect(response.quickActions?.some(a => a.label.includes('다시 시도'))).toBe(true)
    })
  })

  describe('Session Management', () => {
    it('should generate session ID if not provided', async () => {
      // Create a fresh service instance by resetting the session
      const newService = ChatbotService.getInstance()
      newService.setUserId('new-user')
      await newService.resetSession() // Clear any existing session
      vi.clearAllMocks() // Clear the reset call

      const mockBackendResponse: BackendBotResponse = {
        message: 'Hello',
        response_type: 'text',
      }

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockBackendResponse })

      await newService.sendMessage({ message: 'Hello' })

      const call = vi.mocked(api.post).mock.calls[0]
      expect(call[1]).toHaveProperty('session_id')
      expect(call[1].session_id).toMatch(/^session_/)
    })

    it('should call session clear endpoint on resetSession', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } })

      await chatbotService.resetSession()

      expect(api.post).toHaveBeenCalledWith(
        '/api/v1/chatbot/session/clear',
        null,
        expect.objectContaining({
          params: {
            user_id: mockUserId,
            session_id: mockSessionId,
          },
        })
      )
    })
  })
})
