import { api } from '@/utils/api'
import { Product } from '@/types'
import { UserPreferences, PersonalizedRecommendation, RecommendationFilters } from '@/types/recommendation'

// 추천 API 응답 인터페이스
export interface RecommendationResponse {
  success: boolean
  recommendations: PersonalizedRecommendation[]
  totalCount: number
  message?: string
  error?: string
}

// FAQ 아이템 인터페이스
export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  keywords: string[]
  priority: number
}

// FAQ API 응답 인터페이스
export interface FAQResponse {
  success: boolean
  faqs: FAQItem[]
  totalCount: number
  message?: string
  error?: string
}

// 추천 요청 인터페이스
export interface RecommendationRequest {
  userPreferences: UserPreferences
  filters?: RecommendationFilters
  limit?: number
  excludeProducts?: string[]
}

// 추천 서비스 클래스
export class RecommendationService {
  private static instance: RecommendationService

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  // 개인화된 상품 추천 요청
  public async getPersonalizedRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      const response = await api.post<RecommendationResponse>('/recommendations/personalized', {
        preferences: request.userPreferences,
        filters: request.filters,
        limit: request.limit || 10,
        excludeProducts: request.excludeProducts || []
      })

      return response.data
    } catch (error) {
      console.error('Personalized Recommendation API Error:', error)
      
      // API 오류 시 폴백 추천 로직
      return this.getFallbackRecommendations(request)
    }
  }

  // 유사 상품 추천
  public async getSimilarRecommendations(productId: string, limit: number = 5): Promise<RecommendationResponse> {
    try {
      const response = await api.get<RecommendationResponse>(`/recommendations/similar/${productId}?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Similar Recommendation API Error:', error)
      
      return {
        success: false,
        recommendations: [],
        totalCount: 0,
        message: '유사 상품 추천을 불러올 수 없습니다.',
        error: 'API_ERROR'
      }
    }
  }

  // 트렌딩 상품 추천
  public async getTrendingRecommendations(limit: number = 8): Promise<RecommendationResponse> {
    try {
      const response = await api.get<RecommendationResponse>(`/recommendations/trending?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Trending Recommendation API Error:', error)
      
      return this.getFallbackTrending()
    }
  }

  // FAQ 데이터 조회
  public async getFAQs(category?: string, keywords?: string[]): Promise<FAQResponse> {
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (keywords && keywords.length > 0) {
        keywords.forEach(keyword => params.append('keywords', keyword))
      }

      const response = await api.get<FAQResponse>(`/faqs?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('FAQ API Error:', error)
      
      return this.getFallbackFAQs(category)
    }
  }

  // FAQ 검색
  public async searchFAQs(query: string): Promise<FAQResponse> {
    try {
      const response = await api.get<FAQResponse>(`/faqs/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('FAQ Search API Error:', error)
      
      return this.getFallbackSearchFAQs(query)
    }
  }

  // 사용자 행동 기반 추천
  public async getBehaviorBasedRecommendations(
    userId: string, 
    behaviorType: 'view' | 'cart' | 'purchase',
    limit: number = 6
  ): Promise<RecommendationResponse> {
    try {
      const response = await api.post<RecommendationResponse>('/recommendations/behavior', {
        userId,
        behaviorType,
        limit
      })

      return response.data
    } catch (error) {
      console.error('Behavior-based Recommendation API Error:', error)
      
      return {
        success: false,
        recommendations: [],
        totalCount: 0,
        message: '행동 기반 추천을 불러올 수 없습니다.',
        error: 'API_ERROR'
      }
    }
  }

  // 폴백 추천 로직 (API 오류 시)
  private async getFallbackRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    // 로컬 mock 데이터를 사용한 기본 추천
    const mockProducts: Product[] = [
      {
        id: '1',
        name: '로즈 블룸',
        brand: 'Élégance',
        price: 89000,
        description: '장미와 피오니의 우아한 조화로 여성스러운 매력을 발산하는 플로럴 향수',
        notes: ['장미', '피오니', '머스크'],
        image: 'https://images.unsplash.com/photo-1559681287-729c821646f7',
        category: '플로럴'
      },
      {
        id: '2',
        name: '핑크 드림',
        brand: 'Blossom',
        price: 125000,
        description: '달콤하고 상큼한 프루티 플로럴 향으로 로맨틱한 분위기를 연출',
        notes: ['피치', '프리지아', '바닐라'],
        image: 'https://images.unsplash.com/photo-1678984633768-c4fd5a01732a',
        category: '프루티'
      }
    ]

    const recommendations: PersonalizedRecommendation[] = mockProducts.map(product => ({
      product,
      score: Math.random() * 0.5 + 0.5, // 0.5-1.0 점수
      reasons: ['선호하는 향 노트와 일치', '가격대가 적합', '인기 상품'],
      matchType: 'preference' as const
    }))

    return {
      success: true,
      recommendations,
      totalCount: recommendations.length,
      message: '기본 추천을 제공합니다.'
    }
  }

  // 폴백 트렌딩 추천
  private getFallbackTrending(): RecommendationResponse {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: '로즈 블룸',
        brand: 'Élégance',
        price: 89000,
        description: '장미와 피오니의 우아한 조화',
        notes: ['장미', '피오니', '머스크'],
        image: 'https://images.unsplash.com/photo-1559681287-729c821646f7',
        category: '플로럴'
      }
    ]

    const recommendations: PersonalizedRecommendation[] = mockProducts.map(product => ({
      product,
      score: 0.9,
      reasons: ['인기 급상승 상품'],
      matchType: 'trending' as const
    }))

    return {
      success: true,
      recommendations,
      totalCount: recommendations.length,
      message: '인기 상품을 추천합니다.'
    }
  }

  // 폴백 FAQ
  private getFallbackFAQs(category?: string): FAQResponse {
    const mockFAQs: FAQItem[] = [
      {
        id: '1',
        question: '향수 보관은 어떻게 해야 하나요?',
        answer: '향수는 직사광선을 피하고 서늘하고 건조한 곳에 보관하세요. 냉장고 보관은 권하지 않습니다.',
        category: '보관방법',
        keywords: ['보관', '저장', '관리'],
        priority: 1
      },
      {
        id: '2',
        question: '향수 지속시간은 얼마나 되나요?',
        answer: '일반적으로 오드퍼퓸(EDP)은 6-8시간, 오드뚜왈렛(EDT)은 3-5시간 지속됩니다. 개인의 피부타입에 따라 차이가 있을 수 있습니다.',
        category: '사용법',
        keywords: ['지속시간', '오래', '지속력'],
        priority: 2
      },
      {
        id: '3',
        question: '교환/반품이 가능한가요?',
        answer: '미개봉 상품에 한해 구매 후 7일 이내 교환/반품이 가능합니다. 개봉된 향수는 위생상의 이유로 교환/반품이 어렵습니다.',
        category: '교환/반품',
        keywords: ['교환', '반품', '환불'],
        priority: 3
      },
      {
        id: '4',
        question: '배송은 얼마나 걸리나요?',
        answer: '평일 오후 3시 이전 주문 시 당일 발송되며, 배송은 1-2일 소요됩니다. 주말/공휴일 주문은 다음 영업일에 발송됩니다.',
        category: '배송',
        keywords: ['배송', '택배', '발송'],
        priority: 4
      }
    ]

    const filteredFAQs = category 
      ? mockFAQs.filter(faq => faq.category === category)
      : mockFAQs

    return {
      success: true,
      faqs: filteredFAQs,
      totalCount: filteredFAQs.length,
      message: 'FAQ를 불러왔습니다.'
    }
  }

  // 폴백 FAQ 검색
  private getFallbackSearchFAQs(query: string): FAQResponse {
    const allFAQs = this.getFallbackFAQs().faqs
    const searchQuery = query.toLowerCase()
    
    const filteredFAQs = allFAQs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery) ||
      faq.answer.toLowerCase().includes(searchQuery) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery))
    )

    return {
      success: true,
      faqs: filteredFAQs,
      totalCount: filteredFAQs.length,
      message: filteredFAQs.length > 0 ? '검색 결과입니다.' : '검색 결과가 없습니다.'
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const recommendationService = RecommendationService.getInstance()

// 편의 함수들
export const getPersonalizedRecommendations = (request: RecommendationRequest): Promise<RecommendationResponse> => {
  return recommendationService.getPersonalizedRecommendations(request)
}

export const getSimilarProducts = (productId: string, limit?: number): Promise<RecommendationResponse> => {
  return recommendationService.getSimilarRecommendations(productId, limit)
}

export const getTrendingProducts = (limit?: number): Promise<RecommendationResponse> => {
  return recommendationService.getTrendingRecommendations(limit)
}

export const getFAQs = (category?: string, keywords?: string[]): Promise<FAQResponse> => {
  return recommendationService.getFAQs(category, keywords)
}

export const searchFAQs = (query: string): Promise<FAQResponse> => {
  return recommendationService.searchFAQs(query)
}

export const getBehaviorRecommendations = (
  userId: string, 
  behaviorType: 'view' | 'cart' | 'purchase',
  limit?: number
): Promise<RecommendationResponse> => {
  return recommendationService.getBehaviorBasedRecommendations(userId, behaviorType, limit)
}