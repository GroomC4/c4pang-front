import { chatbotApi } from '@/utils/api'
import { 
  Message, 
  ProductRecommendation, 
  BackendBotResponse,
  BackendUserMessage 
} from '@/types/chatbot'
import { 
  convertBotResponseToMessage,
  convertToBackendUserMessage,
  convertProductCard,
  convertQuickAction
} from '@/utils/typeConverters'
import { getPersonalizedRecommendations, searchFAQs, getFAQs } from './recommendationService'
import { UserPreferences } from '@/types/recommendation'

// 채팅 응답 인터페이스
export interface ChatResponse {
  success: boolean
  message: string
  type: 'text' | 'product' | 'action' | 'recommendation' | 'faq' | 'cart' | 'checkout' | 'confirmation' | 'order' | 'error'
  products?: ProductRecommendation[]
  recommendations?: any[]
  faqs?: any[]
  actions?: string[]
  quickActions?: any[]
  error?: string
  backendResponse?: BackendBotResponse
}

// 채팅 요청 인터페이스
export interface ChatRequest {
  message: string
  userId?: string
  sessionId?: string
  context?: {
    previousMessages?: Message[]
    userPreferences?: any
  }
}

// 챗봇 서비스 클래스
export class ChatbotService {
  private static instance: ChatbotService
  private sessionId: string | null = null
  private userId: string = 'guest'
  private maxRetries: number = 2
  private retryDelay: number = 1000

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService()
    }
    return ChatbotService.instance
  }

  // 세션 ID 설정
  public setSessionId(sessionId: string): void {
    this.sessionId = sessionId
  }

  // 사용자 ID 설정
  public setUserId(userId: string): void {
    this.userId = userId || 'guest'
  }

  // 세션 ID 가져오기 (없으면 생성)
  private getOrCreateSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId()
    }
    return this.sessionId
  }

  // 메시지 전송 및 응답 받기
  public async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const sessionId = request.sessionId || this.getOrCreateSessionId()
    const userId = request.userId || this.userId

    // 백엔드 형식으로 요청 데이터 변환
    const backendRequest: BackendUserMessage = convertToBackendUserMessage(
      userId,
      sessionId,
      request.message
    )

    try {
      // 백엔드 API 호출
      const response = await this.sendMessageWithRetry(backendRequest)
      
      // 세션 ID 저장
      if (!this.sessionId) {
        this.sessionId = sessionId
      }

      // 백엔드 응답을 프론트엔드 형식으로 변환
      return this.convertBackendResponseToFrontend(response)
    } catch (error) {
      console.error('Chatbot API Error:', error)
      
      // 네트워크 오류 처리 및 폴백
      return await this.handleNetworkError(request.message, error)
    }
  }

  // 재시도 로직이 포함된 메시지 전송
  private async sendMessageWithRetry(
    backendRequest: BackendUserMessage,
    retryCount: number = 0
  ): Promise<BackendBotResponse> {
    try {
      const response = await chatbotApi.post<BackendBotResponse>(
        '/api/v1/chatbot/message',
        backendRequest
      )
      return response.data
    } catch (error: any) {
      // 네트워크 오류이고 재시도 가능한 경우
      if (this.isRetryableError(error) && retryCount < this.maxRetries) {
        console.log(`Retrying request (${retryCount + 1}/${this.maxRetries})...`)
        await this.delay(this.retryDelay * (retryCount + 1))
        return this.sendMessageWithRetry(backendRequest, retryCount + 1)
      }
      throw error
    }
  }

  // 백엔드 응답을 프론트엔드 형식으로 변환
  private convertBackendResponseToFrontend(backendResponse: BackendBotResponse): ChatResponse {
    return {
      success: true,
      message: backendResponse.message,
      type: this.mapResponseType(backendResponse.response_type),
      products: backendResponse.product_cards?.map(convertProductCard),
      quickActions: backendResponse.quick_actions?.map(convertQuickAction),
      backendResponse
    }
  }

  // 응답 타입 매핑
  private mapResponseType(
    backendType: 'text' | 'recommendation' | 'cart' | 'checkout' | 'confirmation' | 'error'
  ): 'text' | 'product' | 'action' | 'recommendation' | 'faq' {
    switch (backendType) {
      case 'recommendation':
        return 'recommendation'
      case 'cart':
      case 'checkout':
      case 'confirmation':
        return 'action'
      case 'error':
        return 'text'
      default:
        return 'text'
    }
  }

  // 재시도 가능한 오류인지 확인
  private isRetryableError(error: any): boolean {
    // 네트워크 오류
    if (!error.response) {
      return true
    }
    
    // 5xx 서버 오류
    if (error.response?.status >= 500) {
      return true
    }
    
    // 타임아웃
    if (error.code === 'ECONNABORTED') {
      return true
    }
    
    return false
  }

  // 네트워크 오류 처리
  private async handleNetworkError(message: string, error: any): Promise<ChatResponse> {
    const errorType = this.getErrorType(error)
    
    console.error(`Network error (${errorType}):`, error.message || error)
    
    // 모든 네트워크 오류에 대해 폴백 시도
    try {
      const fallbackResponse = await this.getFallbackResponse(message)
      return {
        ...fallbackResponse,
        error: errorType,
        quickActions: [
          {
            id: 'retry',
            label: '🔄 다시 시도',
            actionType: 'custom',
            payload: { action: 'retry_message', content: message }
          }
        ]
      }
    } catch (fallbackError) {
      // 폴백도 실패한 경우 에러 메시지 반환
      console.error('Fallback also failed:', fallbackError)
      return {
        success: false,
        message: this.getErrorMessage(errorType),
        type: 'text',
        error: errorType,
        quickActions: [
          {
            id: 'retry',
            label: '🔄 다시 시도',
            actionType: 'custom',
            payload: { action: 'retry_message', content: message }
          },
          {
            id: 'help',
            label: '💬 도움말',
            actionType: 'custom',
            payload: { action: 'help' }
          }
        ]
      }
    }
  }

  // 오류 타입 판별
  private getErrorType(error: any): string {
    // Connection errors
    if (error.code === 'ECONNREFUSED') {
      return 'CONNECTION_REFUSED'
    }
    if (error.code === 'ENOTFOUND') {
      return 'DNS_ERROR'
    }
    // 타임아웃 체크
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'TIMEOUT'
    }
    // No response received (network error)
    if (!error.response) {
      return 'NETWORK_ERROR'
    }
    // HTTP status codes
    if (error.response.status === 404) {
      return 'NOT_FOUND'
    }
    if (error.response.status === 400) {
      return 'VALIDATION_ERROR'
    }
    if (error.response.status === 401 || error.response.status === 403) {
      return 'AUTH_ERROR'
    }
    if (error.response.status >= 500) {
      return 'SERVER_ERROR'
    }
    return 'API_ERROR'
  }

  // 오류 메시지 생성
  private getErrorMessage(errorType: string): string {
    switch (errorType) {
      case 'NETWORK_ERROR':
        return '🔌 네트워크 연결을 확인해주세요.\n\n인터넷 연결 상태를 확인하거나 잠시 후 다시 시도해주세요.'
      case 'CONNECTION_REFUSED':
        return '🔌 서버에 연결할 수 없습니다.\n\n서버가 실행 중인지 확인하거나 잠시 후 다시 시도해주세요.'
      case 'DNS_ERROR':
        return '🌐 서버 주소를 찾을 수 없습니다.\n\n인터넷 연결을 확인해주세요.'
      case 'TIMEOUT':
        return '⏱️ 요청 시간이 초과되었습니다.\n\n네트워크 상태를 확인하고 다시 시도해주세요.'
      case 'SERVER_ERROR':
        return '🔧 서버에 일시적인 문제가 발생했습니다.\n\n잠시 후 다시 시도해주세요.'
      case 'NOT_FOUND':
        return '😕 요청하신 정보를 찾을 수 없습니다.\n\n다른 검색어로 시도해보세요.'
      case 'VALIDATION_ERROR':
        return '⚠️ 요청이 올바르지 않습니다.\n\n입력 내용을 확인하고 다시 시도해주세요.'
      case 'AUTH_ERROR':
        return '🔐 인증이 필요합니다.\n\n로그인 후 다시 시도해주세요.'
      default:
        return '💫 일시적인 오류가 발생했습니다.\n\n잠시 후 다시 시도해주세요.'
    }
  }

  // 지연 함수
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 향수 추천 요청
  public async getRecommendations(preferences: {
    fragranceType?: string[]
    priceRange?: { min: number; max: number }
    brand?: string
    occasion?: string
  }): Promise<ChatResponse> {
    const sessionId = this.getOrCreateSessionId()
    const userId = this.userId

    // 선호도를 메시지로 변환
    const preferenceMessage = this.buildPreferenceMessage(preferences)
    
    // 백엔드 형식으로 요청 데이터 변환
    const backendRequest: BackendUserMessage = convertToBackendUserMessage(
      userId,
      sessionId,
      preferenceMessage
    )

    try {
      // 백엔드 API 호출
      const response = await this.sendMessageWithRetry(backendRequest)
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      return this.convertBackendResponseToFrontend(response)
    } catch (error) {
      console.error('Recommendation API Error:', error)
      
      // 폴백: 로컬 추천 서비스 사용
      try {
        const userPreferences: UserPreferences = {
          fragranceTypes: preferences.fragranceType || [],
          priceRange: preferences.priceRange || { min: 0, max: 300000 },
          favoriteNotes: [],
          preferredBrands: preferences.brand ? [preferences.brand] : [],
          occasions: preferences.occasion ? [preferences.occasion] : [],
          intensity: 'medium',
          purchaseHistory: [],
          viewHistory: [],
          cartHistory: []
        }

        const recommendationResult = await getPersonalizedRecommendations({
          userPreferences,
          limit: 5
        })

        if (recommendationResult.success && recommendationResult.recommendations.length > 0) {
          return {
            success: true,
            message: '취향에 맞는 향수를 찾았어요! 🌸',
            type: 'recommendation',
            recommendations: recommendationResult.recommendations
          }
        }
      } catch (recommendationError) {
        console.error('Personalized Recommendation Error:', recommendationError)
      }
      
      return await this.handleNetworkError(preferenceMessage, error)
    }
  }

  // 선호도를 메시지로 변환
  private buildPreferenceMessage(preferences: {
    fragranceType?: string[]
    priceRange?: { min: number; max: number }
    brand?: string
    occasion?: string
  }): string {
    const parts: string[] = []
    
    if (preferences.fragranceType && preferences.fragranceType.length > 0) {
      parts.push(`${preferences.fragranceType.join(', ')} 계열`)
    }
    
    if (preferences.priceRange) {
      parts.push(`${preferences.priceRange.min}원~${preferences.priceRange.max}원`)
    }
    
    if (preferences.brand) {
      parts.push(`${preferences.brand} 브랜드`)
    }
    
    if (preferences.occasion) {
      parts.push(`${preferences.occasion} 용도`)
    }
    
    return parts.length > 0 
      ? `${parts.join(', ')} 향수를 추천해주세요`
      : '향수를 추천해주세요'
  }

  // FAQ 검색 요청
  public async searchFAQ(query: string): Promise<ChatResponse> {
    try {
      const faqResult = await searchFAQs(query)
      
      if (faqResult.success && faqResult.faqs.length > 0) {
        return {
          success: true,
          message: `"${query}"에 대한 답변을 찾았어요! 📋`,
          type: 'faq',
          faqs: faqResult.faqs
        }
      } else {
        return {
          success: true,
          message: '죄송해요, 관련 정보를 찾을 수 없네요. 다른 질문을 해보시거나 고객센터로 문의해주세요. 😊',
          type: 'text'
        }
      }
    } catch (error) {
      console.error('FAQ Search Error:', error)
      
      return {
        success: false,
        message: 'FAQ 검색 중 오류가 발생했습니다. 다시 시도해주세요.',
        type: 'text',
        error: 'FAQ_ERROR'
      }
    }
  }

  // 카테고리별 FAQ 조회
  public async getFAQsByCategory(category?: string): Promise<ChatResponse> {
    try {
      const faqResult = await getFAQs(category)
      
      if (faqResult.success && faqResult.faqs.length > 0) {
        const categoryText = category ? `${category} 관련` : '자주 묻는'
        return {
          success: true,
          message: `${categoryText} 질문들이에요! 📝`,
          type: 'faq',
          faqs: faqResult.faqs
        }
      } else {
        return {
          success: true,
          message: '현재 표시할 FAQ가 없습니다.',
          type: 'text'
        }
      }
    } catch (error) {
      console.error('FAQ Category Error:', error)
      
      return {
        success: false,
        message: 'FAQ를 불러오는 중 오류가 발생했습니다.',
        type: 'text',
        error: 'FAQ_ERROR'
      }
    }
  }

  // 상품 정보 조회
  public async getProductInfo(productId: string): Promise<ChatResponse> {
    const sessionId = this.getOrCreateSessionId()
    const userId = this.userId

    // 상품 정보 요청 메시지 생성
    const message = `상품 ${productId}의 정보를 알려주세요`
    
    const backendRequest: BackendUserMessage = convertToBackendUserMessage(
      userId,
      sessionId,
      message,
      'show_detail',
      { product_id: productId }
    )

    try {
      const response = await this.sendMessageWithRetry(backendRequest)
      return this.convertBackendResponseToFrontend(response)
    } catch (error) {
      console.error('Product Info API Error:', error)
      
      return {
        success: false,
        message: '상품 정보를 가져올 수 없습니다. 다시 시도해주세요.',
        type: 'text',
        error: 'PRODUCT_NOT_FOUND'
      }
    }
  }

  // 세션 초기화
  public async resetSession(): Promise<void> {
    const sessionId = this.sessionId
    const userId = this.userId

    try {
      if (sessionId) {
        await chatbotApi.post('/api/v1/chatbot/session/clear', null, {
          params: {
            user_id: userId,
            session_id: sessionId
          }
        })
      }
    } catch (error) {
      console.error('Session reset error:', error)
    } finally {
      this.sessionId = null
    }
  }

  // 폴백 응답 생성 (API 오류 시)
  private async getFallbackResponse(message: string): Promise<ChatResponse> {
    const input = message.toLowerCase()
    
    // FAQ 검색 시도
    if (input.includes('문의') || input.includes('질문') || input.includes('도움') || 
        input.includes('배송') || input.includes('교환') || input.includes('반품') ||
        input.includes('보관') || input.includes('사용법')) {
      try {
        const faqResult = await this.searchFAQ(message)
        if (faqResult.success && faqResult.faqs && faqResult.faqs.length > 0) {
          return faqResult
        }
      } catch (error) {
        console.error('Fallback FAQ search error:', error)
      }
    }
    
    // 향수 추천 관련
    if (input.includes('추천') || input.includes('향수')) {
      // 기본 추천 시도
      try {
        const basicPreferences = {
          fragranceType: input.includes('플로럴') ? ['플로럴'] : 
                        input.includes('시트러스') ? ['시트러스'] :
                        input.includes('우디') ? ['우디'] : [],
          priceRange: { min: 0, max: 300000 }
        }
        
        const recommendationResult = await this.getRecommendations(basicPreferences)
        if (recommendationResult.success && recommendationResult.recommendations) {
          return recommendationResult
        }
      } catch (error) {
        console.error('Fallback recommendation error:', error)
      }
      
      return {
        success: true,
        message: '어떤 향을 좋아하시나요? 🌹\n• 플로럴 (장미, 재스민)\n• 시트러스 (레몬, 오렌지)\n• 우디 (샌달우드, 시더)\n• 머스크 (부드럽고 따뜻한 향)\n\n원하시는 향을 말씀해주시면 맞춤 추천해드릴게요!',
        type: 'text'
      }
    }
    
    // 가격 관련
    if (input.includes('가격') || input.includes('얼마')) {
      return {
        success: true,
        message: '퍼퓸퀸에서는 다양한 가격대의 향수를 준비했어요! 💝\n\n• 5만원 이하: 데일리 향수\n• 5-10만원: 프리미엄 향수\n• 10만원 이상: 럭셔리 향수\n\n어떤 가격대를 원하시나요?',
        type: 'text'
      }
    }
    
    // 브랜드 관련
    if (input.includes('브랜드') || input.includes('메이커')) {
      return {
        success: true,
        message: '인기 브랜드를 소개해드릴게요! ✨\n\n• 샤넬 - 클래식하고 우아한 향\n• 딥티크 - 유니크하고 세련된 향\n• 조말론 - 영국의 전통적인 향\n• 르라보 - 모던하고 개성있는 향\n\n어떤 브랜드가 궁금하신가요?',
        type: 'text'
      }
    }
    
    // 기본 응답
    const responses = [
      '더 자세히 알려주시면 더 정확한 추천을 해드릴 수 있어요! 😊',
      '향수에 대해 궁금한 점이 있으시면 언제든 물어보세요! 🌸',
      '어떤 스타일의 향수를 찾고 계신지 알려주세요! ✨',
      '취향에 맞는 완벽한 향수를 찾아드릴게요! 💕'
    ]
    
    return {
      success: true,
      message: responses[Math.floor(Math.random() * responses.length)],
      type: 'text'
    }
  }

  // 세션 ID 생성
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// 싱글톤 인스턴스 내보내기
export const chatbotService = ChatbotService.getInstance()

// 편의 함수들
export const sendChatMessage = (message: string, context?: any): Promise<ChatResponse> => {
  return chatbotService.sendMessage({
    message,
    context
  })
}

export const getFragranceRecommendations = (preferences: any): Promise<ChatResponse> => {
  return chatbotService.getRecommendations(preferences)
}

export const getProductDetails = (productId: string): Promise<ChatResponse> => {
  return chatbotService.getProductInfo(productId)
}

export const resetChatSession = (): Promise<void> => {
  return chatbotService.resetSession()
}