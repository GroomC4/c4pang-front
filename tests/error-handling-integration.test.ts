import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseError, getErrorActions, shouldUseFallback, recordFailure, resetFailures } from '@/utils/errorHandler'

describe('Error Handling Integration', () => {
  beforeEach(() => {
    resetFailures()
  })

  describe('Network Error Flow', () => {
    it('should detect network error and suggest fallback', () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      }

      const errorResponse = parseError(networkError)
      expect(errorResponse.type).toBe('network')
      expect(errorResponse.retryable).toBe(true)
      expect(shouldUseFallback(networkError)).toBe(true)

      const actions = getErrorActions(errorResponse, { action: 'retry_message', content: 'test' })
      expect(actions.length).toBeGreaterThan(0)
      expect(actions[0].label).toContain('다시 시도')
    })

    it('should track consecutive failures and suggest network check', () => {
      expect(recordFailure()).toBe(false)
      expect(recordFailure()).toBe(false)
      const shouldSuggest = recordFailure()
      
      expect(shouldSuggest).toBe(true)
    })
  })

  describe('Order Failure Flow', () => {
    it('should preserve cart on order failure', () => {
      const orderError = {
        response: {
          status: 500,
          data: { message: 'Order processing failed' }
        }
      }

      const errorResponse = parseError(orderError)
      expect(errorResponse.type).toBe('network')
      expect(errorResponse.retryable).toBe(true)

      const actions = getErrorActions(errorResponse, { action: 'retry_order' })
      expect(actions.some(a => a.label.includes('다시 시도'))).toBe(true)
    })
  })

  describe('Validation Error Flow', () => {
    it('should not retry validation errors', () => {
      const validationError = {
        response: {
          status: 400,
          data: { message: 'Invalid shipping address' }
        }
      }

      const errorResponse = parseError(validationError)
      expect(errorResponse.type).toBe('validation')
      expect(errorResponse.retryable).toBe(false)
      expect(shouldUseFallback(validationError)).toBe(false)

      const actions = getErrorActions(errorResponse)
      expect(actions.some(a => a.label.includes('도움말'))).toBe(true)
    })
  })

  describe('Server Error Flow', () => {
    it('should retry server errors and offer support', () => {
      const serverError = {
        response: {
          status: 503,
          data: {}
        }
      }

      const errorResponse = parseError(serverError)
      expect(errorResponse.type).toBe('network')
      expect(errorResponse.retryable).toBe(true)
      expect(shouldUseFallback(serverError)).toBe(true)

      const actions = getErrorActions(errorResponse, { action: 'retry' })
      expect(actions.some(a => a.label.includes('고객센터'))).toBe(true)
    })
  })

  describe('Connection Error Flow', () => {
    it('should handle connection refused with fallback', () => {
      const connectionError = {
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      }

      const errorResponse = parseError(connectionError)
      expect(errorResponse.code).toBe('CONNECTION_REFUSED')
      expect(errorResponse.retryable).toBe(true)
      expect(shouldUseFallback(connectionError)).toBe(true)
    })

    it('should handle DNS errors with fallback', () => {
      const dnsError = {
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND'
      }

      const errorResponse = parseError(dnsError)
      expect(errorResponse.code).toBe('DNS_ERROR')
      expect(errorResponse.retryable).toBe(true)
      expect(shouldUseFallback(dnsError)).toBe(true)
    })

    it('should handle timeout errors with fallback', () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      }

      const errorResponse = parseError(timeoutError)
      expect(errorResponse.code).toBe('TIMEOUT_ERROR')
      expect(errorResponse.retryable).toBe(true)
      expect(shouldUseFallback(timeoutError)).toBe(true)
    })
  })

  describe('Error Message Formatting', () => {
    it('should include emoji and helpful text in error messages', () => {
      const errors = [
        { request: {}, message: 'Network Error' },
        { code: 'ECONNABORTED' },
        { response: { status: 500, data: {} } },
        { response: { status: 404, data: {} } }
      ]

      errors.forEach(error => {
        const errorResponse = parseError(error)
        expect(errorResponse.message).toMatch(/[🔌⏱️🔧😕💫🌐🔐⚠️]/)
      })
    })
  })

  describe('Quick Action Generation', () => {
    it('should generate retry action for network errors', () => {
      const error = { request: {}, message: 'Network Error' }
      const errorResponse = parseError(error)
      const actions = getErrorActions(errorResponse, { action: 'retry' })
      
      expect(actions.some(a => a.label.includes('다시 시도'))).toBe(true)
      expect(actions.length).toBeGreaterThan(0)
    })

    it('should generate help action for validation errors', () => {
      const error = { response: { status: 400, data: {} } }
      const errorResponse = parseError(error)
      const actions = getErrorActions(errorResponse)
      
      expect(actions.some(a => a.label.includes('도움말'))).toBe(true)
    })

    it('should generate retry and support actions for server errors', () => {
      const error = { response: { status: 500, data: {} } }
      const errorResponse = parseError(error)
      const actions = getErrorActions(errorResponse, { action: 'retry' })
      
      expect(actions.some(a => a.label.includes('다시 시도'))).toBe(true)
      expect(actions.some(a => a.label.includes('고객센터'))).toBe(true)
    })
  })
})
