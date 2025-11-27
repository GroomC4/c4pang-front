import { api } from '@/utils/api'
import { Message, ProductRecommendation } from '@/types/chatbot'

// 채팅 응답 인터페이스
export interface ChatResponse {
  success: boolean
  message: string
  type: 'text' | 'product' | 'action'
  products?: ProductRecommendation[]
  actions?: string[]
  error?: string
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

  // 메시지 전송 및 응답 받기
  public async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const requestData = {
        ...request,
        sessionId: this.sessionId || this.generateSessionId(),
        timestamp: new Date().toISOString()
      }

      const response = await api.post<ChatResponse>('/chatbot/message', requestData)
      
      // 세션 ID가 없다면 생성된 세션 ID 저장
      if (!this.sessionId && response.data.success) {
        this.sessionId = requestData.sessionId
      }

      return response.data
    } catch (error) {
      console.error('Chatbot API Error:', error)
      
      // API 오류 시 폴백 응답
      return this.getFallbackResponse(request.message)
    }
  }

  // 향수 추천 요청
  public async getRecommendations(preferences: {
    fragranceType?: string[]
    priceRange?: { min: number; max: number }
    brand?: string
    occasion?: string
  }): Promise<ChatResponse> {
    try {
      const response = await api.post<ChatResponse>('/chatbot/recommendations', {
        preferences,
        sessionId: this.sessionId || this.generateSessionId()
      })

      return response.data
    } catch (error) {
      console.error('Recommendation API Error:', error)
      
      return {
        success: false,
        message: '죄송합니다. 추천 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        type: 'text',
        error: 'API_ERROR'
      }
    }
  }

  // 상품 정보 조회
  public async getProductInfo(productId: string): Promise<ChatResponse> {
    try {
      const response = await api.get<ChatResponse>(`/chatbot/product/${productId}`)
      return response.data
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
    try {
      if (this.sessionId) {
        await api.delete(`/chatbot/session/${this.sessionId}`)
      }
    } catch (error) {
      console.error('Session reset error:', error)
    } finally {
      this.sessionId = null
    }
  }

  // 폴백 응답 생성 (API 오류 시)
  private getFallbackResponse(message: string): ChatResponse {
    const input = message.toLowerCase()
    
    // 향수 추천 관련
    if (input.includes('추천') || input.includes('향수')) {
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