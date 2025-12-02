import { ErrorResponse, QuickActionItem } from '@/types/chatbot'

/**
 * Parse error and return structured ErrorResponse
 */
export const parseError = (error: any): ErrorResponse => {
  // Network errors
  if (error.request && !error.response) {
    return {
      type: 'network',
      message: '네트워크 연결을 확인해주세요. 인터넷 연결 상태를 확인 후 다시 시도해주세요.',
      code: 'NETWORK_ERROR',
      retryable: true
    }
  }

  // HTTP errors
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    // Server errors (5xx)
    if (status >= 500) {
      return {
        type: 'network',
        message: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        code: `SERVER_ERROR_${status}`,
        retryable: true
      }
    }

    // Authentication errors (401, 403)
    if (status === 401 || status === 403) {
      return {
        type: 'validation',
        message: '인증이 필요합니다. 로그인 후 다시 시도해주세요.',
        code: 'AUTH_ERROR',
        retryable: false,
        fallbackAction: {
          id: 'login',
          label: '로그인',
          type: 'primary',
          payload: { action: 'navigate', url: '/login' }
        }
      }
    }

    // Validation errors (400)
    if (status === 400) {
      const message = data?.message || '요청이 올바르지 않습니다. 다시 시도해주세요.'
      return {
        type: 'validation',
        message,
        code: 'VALIDATION_ERROR',
        retryable: false
      }
    }

    // Not found (404)
    if (status === 404) {
      return {
        type: 'business',
        message: '요청하신 정보를 찾을 수 없습니다.',
        code: 'NOT_FOUND',
        retryable: false
      }
    }

    // Business logic errors (422)
    if (status === 422) {
      const message = data?.message || '처리할 수 없는 요청입니다.'
      return {
        type: 'business',
        message,
        code: 'BUSINESS_ERROR',
        retryable: false
      }
    }

    // Other HTTP errors
    return {
      type: 'network',
      message: `오류가 발생했습니다 (${status}). 다시 시도해주세요.`,
      code: `HTTP_ERROR_${status}`,
      retryable: true
    }
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: 'network',
      message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
      code: 'TIMEOUT_ERROR',
      retryable: true
    }
  }

  // Unknown errors
  return {
    type: 'network',
    message: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    code: 'UNKNOWN_ERROR',
    retryable: true
  }
}

/**
 * Create retry action for retryable errors
 */
export const createRetryAction = (originalPayload: any): QuickActionItem => {
  return {
    id: 'retry',
    label: '다시 시도',
    type: 'primary',
    payload: { ...originalPayload, action: 'retry' }
  }
}

/**
 * Create cancel action
 */
export const createCancelAction = (): QuickActionItem => {
  return {
    id: 'cancel',
    label: '취소',
    type: 'secondary',
    payload: { action: 'cancel' }
  }
}

/**
 * Get quick actions for error response
 */
export const getErrorActions = (error: ErrorResponse, retryPayload?: any): QuickActionItem[] => {
  const actions: QuickActionItem[] = []

  if (error.retryable && retryPayload) {
    actions.push(createRetryAction(retryPayload))
  }

  if (error.fallbackAction) {
    actions.push(error.fallbackAction)
  }

  if (!error.fallbackAction) {
    actions.push(createCancelAction())
  }

  return actions
}

/**
 * Retry logic with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on non-retryable errors
      const errorResponse = parseError(error)
      if (!errorResponse.retryable) {
        throw error
      }

      // Don't wait after the last attempt
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
