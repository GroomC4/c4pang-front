import { describe, it, expect, beforeEach } from 'vitest'
import { 
  parseError, 
  getErrorActions, 
  retryWithBackoff, 
  shouldUseFallback,
  recordFailure,
  resetFailures,
  getFailureCount
} from './errorHandler'

describe('Error Handler', () => {
  beforeEach(() => {
    // Reset failure counter before each test
    resetFailures()
  })

  describe('parseError', () => {
    it('should parse network errors correctly', () => {
      const error = { request: {}, message: 'Network Error' }
      const result = parseError(error)
      
      expect(result.type).toBe('network')
      expect(result.code).toBe('NETWORK_ERROR')
      expect(result.retryable).toBe(true)
    })

    it('should parse 500 server errors correctly', () => {
      const error = { response: { status: 500, data: {} } }
      const result = parseError(error)
      
      expect(result.type).toBe('network')
      expect(result.code).toBe('SERVER_ERROR_500')
      expect(result.retryable).toBe(true)
    })

    it('should parse 401 authentication errors correctly', () => {
      const error = { response: { status: 401, data: {} } }
      const result = parseError(error)
      
      expect(result.type).toBe('validation')
      expect(result.code).toBe('AUTH_ERROR')
      expect(result.retryable).toBe(false)
      expect(result.fallbackAction).toBeDefined()
    })

    it('should parse 400 validation errors correctly', () => {
      const error = { response: { status: 400, data: { message: 'Invalid input' } } }
      const result = parseError(error)
      
      expect(result.type).toBe('validation')
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.retryable).toBe(false)
    })

    it('should parse 404 not found errors correctly', () => {
      const error = { response: { status: 404, data: {} } }
      const result = parseError(error)
      
      expect(result.type).toBe('business')
      expect(result.code).toBe('NOT_FOUND')
      expect(result.retryable).toBe(false)
    })

    it('should parse timeout errors correctly', () => {
      const error = { code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' }
      const result = parseError(error)
      
      expect(result.type).toBe('network')
      expect(result.code).toBe('TIMEOUT_ERROR')
      expect(result.retryable).toBe(true)
    })

    it('should parse unknown errors correctly', () => {
      const error = { message: 'Something went wrong' }
      const result = parseError(error)
      
      expect(result.type).toBe('network')
      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.retryable).toBe(true)
    })

    it('should parse connection refused errors correctly', () => {
      const error = { code: 'ECONNREFUSED', message: 'Connection refused' }
      const result = parseError(error)
      
      expect(result.type).toBe('network')
      expect(result.code).toBe('CONNECTION_REFUSED')
      expect(result.retryable).toBe(true)
    })

    it('should parse DNS errors correctly', () => {
      const error = { code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND' }
      const result = parseError(error)
      
      expect(result.type).toBe('network')
      expect(result.code).toBe('DNS_ERROR')
      expect(result.retryable).toBe(true)
    })
  })

  describe('getErrorActions', () => {
    it('should return retry action for retryable errors', () => {
      const error = {
        type: 'network' as const,
        message: 'Network error',
        code: 'NETWORK_ERROR',
        retryable: true
      }
      const actions = getErrorActions(error, { action: 'retry' })
      
      expect(actions.length).toBeGreaterThan(0)
      expect(actions[0].label).toContain('다시 시도')
    })

    it('should return fallback action for non-retryable errors with fallback', () => {
      const error = {
        type: 'validation' as const,
        message: 'Auth error',
        code: 'AUTH_ERROR',
        retryable: false,
        fallbackAction: {
          id: 'login',
          label: '로그인',
          actionType: 'custom' as const,
          payload: { action: 'login' }
        }
      }
      const actions = getErrorActions(error)
      
      expect(actions.length).toBeGreaterThan(0)
      expect(actions.some(a => a.label === '로그인')).toBe(true)
    })

    it('should return help action for non-retryable errors without fallback', () => {
      const error = {
        type: 'validation' as const,
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        retryable: false
      }
      const actions = getErrorActions(error)
      
      expect(actions.length).toBeGreaterThan(0)
      expect(actions.some(a => a.label.includes('도움말'))).toBe(true)
    })

    it('should include contact support for server errors', () => {
      const error = {
        type: 'network' as const,
        message: 'Server error',
        code: 'SERVER_ERROR_500',
        retryable: true
      }
      const actions = getErrorActions(error, { action: 'retry' })
      
      expect(actions.some(a => a.label.includes('고객센터'))).toBe(true)
    })
  })

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        return 'success'
      }
      
      const result = await retryWithBackoff(fn, 3, 10)
      
      expect(result).toBe('success')
      expect(attempts).toBe(1)
    })

    it('should retry on retryable errors', async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        if (attempts < 3) {
          throw { request: {}, message: 'Network Error' }
        }
        return 'success'
      }
      
      const result = await retryWithBackoff(fn, 3, 10)
      
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('should not retry on non-retryable errors', async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        throw { response: { status: 400, data: {} } }
      }
      
      await expect(retryWithBackoff(fn, 3, 10)).rejects.toThrow()
      expect(attempts).toBe(1)
    })

    it('should throw after max retries', async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        throw { request: {}, message: 'Network Error' }
      }
      
      await expect(retryWithBackoff(fn, 3, 10)).rejects.toThrow()
      expect(attempts).toBe(3)
    })
  })

  describe('shouldUseFallback', () => {
    it('should return true for network errors', () => {
      const error = { request: {}, message: 'Network Error' }
      expect(shouldUseFallback(error)).toBe(true)
    })

    it('should return true for server errors', () => {
      const error = { response: { status: 500, data: {} } }
      expect(shouldUseFallback(error)).toBe(true)
    })

    it('should return true for connection refused', () => {
      const error = { code: 'ECONNREFUSED' }
      expect(shouldUseFallback(error)).toBe(true)
    })

    it('should return true for timeout errors', () => {
      const error = { code: 'ECONNABORTED' }
      expect(shouldUseFallback(error)).toBe(true)
    })

    it('should return false for validation errors', () => {
      const error = { response: { status: 400, data: {} } }
      expect(shouldUseFallback(error)).toBe(false)
    })
  })

  describe('failure tracking', () => {
    it('should track consecutive failures', () => {
      expect(getFailureCount()).toBe(0)
      
      recordFailure()
      expect(getFailureCount()).toBe(1)
      
      recordFailure()
      expect(getFailureCount()).toBe(2)
    })

    it('should suggest network check after 3 failures', () => {
      expect(recordFailure()).toBe(false)
      expect(recordFailure()).toBe(false)
      expect(recordFailure()).toBe(true)
    })

    it('should reset failure count', () => {
      recordFailure()
      recordFailure()
      expect(getFailureCount()).toBe(2)
      
      resetFailures()
      expect(getFailureCount()).toBe(0)
    })
  })
})
