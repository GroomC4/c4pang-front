import { ProductRecommendation } from '@/types/chatbot'

/**
 * Mock chatbot service for fallback when API fails
 */

const mockProducts: ProductRecommendation[] = [
  {
    id: 'mock-1',
    name: '블랙 오피움',
    brand: '입생로랑',
    price: 145000,
    image: '/images/products/black-opium.jpg',
    description: '관능적이고 중독적인 향수',
    fragrance: ['커피', '바닐라', '화이트 플라워'],
    notes: {
      top: ['핑크 페퍼', '오렌지 블라썸', '배'],
      middle: ['커피', '자스민', '비터 아몬드'],
      base: ['바닐라', '파출리', '시더우드']
    },
    season: 'fall',
    occasion: 'evening'
  },
  {
    id: 'mock-2',
    name: '라비 에 벨',
    brand: '랑콤',
    price: 125000,
    image: '/images/products/la-vie-est-belle.jpg',
    description: '달콤하고 우아한 여성스러운 향수',
    fragrance: ['아이리스', '파출리', '바닐라'],
    notes: {
      top: ['블랙커런트', '배'],
      middle: ['아이리스', '자스민', '오렌지 블라썸'],
      base: ['파출리', '바닐라', '통카빈']
    },
    season: 'spring',
    occasion: 'daily'
  },
  {
    id: 'mock-3',
    name: '샤넬 No.5',
    brand: '샤넬',
    price: 165000,
    image: '/images/products/chanel-no5.jpg',
    description: '클래식하고 우아한 플로럴 향수',
    fragrance: ['알데하이드', '자스민', '로즈'],
    notes: {
      top: ['알데하이드', '네롤리', '일랑일랑'],
      middle: ['자스민', '로즈', '릴리 오브 더 밸리'],
      base: ['샌달우드', '바닐라', '베티버']
    },
    season: 'all',
    occasion: 'formal'
  }
]

const mockResponses: Record<string, string> = {
  default: '죄송합니다. 현재 서버와 연결할 수 없어 제한된 기능만 제공됩니다. 잠시 후 다시 시도해주세요.',
  recommendation: '현재 인기 있는 향수를 추천해드릴게요! 😊',
  price: '가격대별 향수를 보여드릴게요.',
  brand: '인기 브랜드의 향수를 소개해드릴게요.'
}

export interface MockChatResponse {
  message: string
  type: 'text' | 'product' | 'recommendation'
  products?: ProductRecommendation[]
  recommendations?: any[]
}

/**
 * Get mock response based on user input
 */
export const getMockChatResponse = (userMessage: string): MockChatResponse => {
  const lowerMessage = userMessage.toLowerCase()

  // Check for recommendation keywords
  if (lowerMessage.includes('추천') || lowerMessage.includes('향수')) {
    return {
      message: mockResponses.recommendation,
      type: 'product',
      products: mockProducts
    }
  }

  // Check for price keywords
  if (lowerMessage.includes('가격') || lowerMessage.includes('얼마')) {
    return {
      message: mockResponses.price,
      type: 'product',
      products: mockProducts
    }
  }

  // Check for brand keywords
  if (lowerMessage.includes('브랜드')) {
    return {
      message: mockResponses.brand,
      type: 'product',
      products: mockProducts
    }
  }

  // Default response
  return {
    message: mockResponses.default,
    type: 'text'
  }
}

/**
 * Simulate API delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock chat message with delay
 */
export const sendMockChatMessage = async (
  content: string,
  context?: any
): Promise<MockChatResponse> => {
  // Simulate network delay
  await delay(500 + Math.random() * 1000)

  return getMockChatResponse(content)
}
