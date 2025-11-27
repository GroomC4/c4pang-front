import { api } from '@/utils/api'
import { Message, ProductRecommendation } from '@/types/chatbot'
import { getPersonalizedRecommendations, searchFAQs, getFAQs } from './recommendationService'
import { UserPreferences } from '@/types/recommendation'

// 채팅 응답 인터페이스
export interface ChatResponse {
  success: boolean
  message: string
  type: 'text' | 'product' | 'action' | 'recommendation' | 'faq'
  products?: ProductRecommendation[]
  recommendations?: any[]
  faqs?: any[]
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
      return await this.getFallbackResponse(request.message)
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
      // 기존 API 호출 시도
      const response = await api.post<ChatResponse>('/chatbot/recommendations', {
        preferences,
        sessionId: this.sessionId || this.generateSessionId()
      })

      return response.data
    } catch (error) {
      console.error('Recommendation API Error:', error)
      
      // 새로운 추천 서비스 사용
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
      
      return {
        success: false,
        message: '죄송합니다. 추천 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        type: 'text',
        error: 'API_ERROR'
      }
    }
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