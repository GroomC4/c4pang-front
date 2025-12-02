import { describe, it, expect } from 'vitest'
import { parseError, getErrorActions, retryWithBackoff } from './errorHandler'

describe('Error Handler', () => {
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
  })

  describe('getErrorActions', () => {
    it('should return retry and cancel actions for retryable errors', () => {
      const error = {
        type: 'network' as const,
        message: 'Network error',
        code: 'NETWORK_ERROR',
        retryable: true
      }
      const actions = getErrorActions(error, { action: 'retry' })
      
      expect(actions).toHaveLength(2)
      expect(actions[0].label).toBe('다시 시도')
      expect(actions[1].label).toBe('취소')
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
          type: 'primary' as const,
          payload: { action: 'login' }
        }
      }
      const actions = getErrorActions(error)
      
      expect(actions).toHaveLength(1)
      expect(actions[0].label).toBe('로그인')
    })

    it('should return cancel action for non-retryable errors without fallback', () => {
      const error = {
        type: 'validation' as const,
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        retryable: false
      }
      const actions = getErrorActions(error)
      
      expect(actions).toHaveLength(1)
      expect(actions[0].label).toBe('취소')
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
})
