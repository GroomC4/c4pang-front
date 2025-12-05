import { ErrorResponse, QuickActionItem } from '@/types/chatbot'

/**
 * Parse error and return structured ErrorResponse
 */
export const parseError = (error: any): ErrorResponse => {
  // Network errors (no response received)
  if (error.request && !error.response) {
    return {
      type: 'network',
      message: '🔌 네트워크 연결을 확인해주세요.\n\n인터넷 연결 상태를 확인하거나 잠시 후 다시 시도해주세요.',
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
        message: '🔧 서버에 일시적인 문제가 발생했습니다.\n\n잠시 후 다시 시도해주세요.',
        code: `SERVER_ERROR_${status}`,
        retryable: true
      }
    }

    // Authentication errors (401, 403)
    if (status === 401 || status === 403) {
      return {
        type: 'validation',
        message: '🔐 인증이 필요합니다.\n\n로그인 후 다시 시도해주세요.',
        code: 'AUTH_ERROR',
        retryable: false,
        fallbackAction: {
          id: 'login',
          label: '로그인',
          actionType: 'custom',
          payload: { action: 'navigate', url: '/login' }
        }
      }
    }

    // Validation errors (400)
    if (status === 400) {
      const message = data?.message || data?.detail || '요청이 올바르지 않습니다.'
      return {
        type: 'validation',
        message: `⚠️ ${message}\n\n입력 내용을 확인하고 다시 시도해주세요.`,
        code: 'VALIDATION_ERROR',
        retryable: false
      }
    }

    // Not found (404)
    if (status === 404) {
      return {
        type: 'business',
        message: '😕 요청하신 정보를 찾을 수 없습니다.\n\n다른 검색어로 시도해보세요.',
        code: 'NOT_FOUND',
        retryable: false
      }
    }

    // Business logic errors (422)
    if (status === 422) {
      const message = data?.message || data?.detail || '처리할 수 없는 요청입니다.'
      return {
        type: 'business',
        message: `💫 ${message}`,
        code: 'BUSINESS_ERROR',
        retryable: false
      }
    }

    // Other HTTP errors
    return {
      type: 'network',
      message: `⚠️ 오류가 발생했습니다 (${status}).\n\n다시 시도해주세요.`,
      code: `HTTP_ERROR_${status}`,
      retryable: true
    }
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: 'network',
      message: '⏱️ 요청 시간이 초과되었습니다.\n\n네트워크 상태를 확인하고 다시 시도해주세요.',
      code: 'TIMEOUT_ERROR',
      retryable: true
    }
  }

  // Connection refused
  if (error.code === 'ECONNREFUSED') {
    return {
      type: 'network',
      message: '🔌 서버에 연결할 수 없습니다.\n\n서버가 실행 중인지 확인하거나 잠시 후 다시 시도해주세요.',
      code: 'CONNECTION_REFUSED',
      retryable: true
    }
  }

  // DNS errors
  if (error.code === 'ENOTFOUND') {
    return {
      type: 'network',
      message: '🌐 서버 주소를 찾을 수 없습니다.\n\n인터넷 연결을 확인해주세요.',
      code: 'DNS_ERROR',
      retryable: true
    }
  }

  // Unknown errors
  const errorMessage = error.message || '알 수 없는 오류가 발생했습니다.'
  return {
    type: 'network',
    message: `💫 ${errorMessage}\n\n잠시 후 다시 시도해주세요.`,
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
    label: '🔄 다시 시도',
    actionType: 'custom',
    payload: { ...originalPayload }
  }
}

/**
 * Create cancel action
 */
export const createCancelAction = (): QuickActionItem => {
  return {
    id: 'cancel',
    label: '취소',
    actionType: 'custom',
    payload: { action: 'cancel' }
  }
}

/**
 * Create help action
 */
export const createHelpAction = (): QuickActionItem => {
  return {
    id: 'help',
    label: '💬 도움말',
    actionType: 'custom',
    payload: { action: 'help' }
  }
}

/**
 * Create contact support action
 */
export const createContactSupportAction = (): QuickActionItem => {
  return {
    id: 'contact_support',
    label: '📞 고객센터 문의',
    actionType: 'custom',
    payload: { action: 'contact_support' }
  }
}

/**
 * Get quick actions for error response
 */
export const getErrorActions = (error: ErrorResponse, retryPayload?: any): QuickActionItem[] => {
  const actions: QuickActionItem[] = []

  // Add retry action for retryable errors
  if (error.retryable && retryPayload) {
    actions.push(createRetryAction(retryPayload))
  }

  // Add fallback action if provided
  if (error.fallbackAction) {
    actions.push(error.fallbackAction)
  }

  // Add help action for non-retryable errors
  if (!error.retryable && !error.fallbackAction) {
    actions.push(createHelpAction())
  }

  // Add contact support for persistent errors
  if (error.code === 'UNKNOWN_ERROR' || error.code.includes('SERVER_ERROR')) {
    actions.push(createContactSupportAction())
  }

  // Add cancel action if no other actions
  if (actions.length === 0) {
    actions.push(createCancelAction())
  }

  return actions
}

/**
 * Check if error should trigger fallback to mock data
 */
export const shouldUseFallback = (error: any): boolean => {
  const errorResponse = parseError(error)
  
  // Use fallback for network errors
  if (errorResponse.type === 'network') {
    return true
  }
  
  // Use fallback for server errors
  if (errorResponse.code.includes('SERVER_ERROR')) {
    return true
  }
  
  // Use fallback for connection errors
  if (errorResponse.code === 'CONNECTION_REFUSED' || 
      errorResponse.code === 'DNS_ERROR' ||
      errorResponse.code === 'TIMEOUT_ERROR') {
    return true
  }
  
  return false
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

/**
 * Track consecutive failures for fallback mode detection
 */
let consecutiveFailures = 0
const MAX_CONSECUTIVE_FAILURES = 3

/**
 * Record a failure and check if we should suggest checking network
 */
export const recordFailure = (): boolean => {
  consecutiveFailures++
  return consecutiveFailures >= MAX_CONSECUTIVE_FAILURES
}

/**
 * Reset failure counter on success
 */
export const resetFailures = (): void => {
  consecutiveFailures = 0
}

/**
 * Get failure count
 */
export const getFailureCount = (): number => {
  return consecutiveFailures
}
