import { ProductRecommendation } from '@/types/chatbot'

interface ProductDescription {
  productIndex: number
  description: string
}

/**
 * LLM 응답에서 각 상품별 설명을 추출합니다.
 * 예: "1. **브랜드 - 상품명**\n   - 설명..." 형식을 파싱
 */
export function parseProductDescriptions(
  message: string,
  products: ProductRecommendation[]
): Map<number, string> {
  const descriptions = new Map<number, string>()
  
  // 숫자로 시작하는 항목을 찾기 (1., 2., 3. 등)
  const itemPattern = /(\d+)\.\s*\*\*([^*]+)\*\*\s*([\s\S]*?)(?=\n\d+\.\s*\*\*|\n\n|$)/g
  
  let match
  while ((match = itemPattern.exec(message)) !== null) {
    const index = parseInt(match[1]) - 1 // 0-based index
    const title = match[2].trim()
    const content = match[3].trim()
    
    if (index >= 0 && index < products.length) {
      descriptions.set(index, content)
    }
  }
  
  // 패턴이 매칭되지 않으면 간단한 방식으로 시도
  if (descriptions.size === 0) {
    const simplePattern = /(\d+)\.\s+([^\n]+)\n([\s\S]*?)(?=\n\d+\.|\n\n|$)/g
    
    while ((match = simplePattern.exec(message)) !== null) {
      const index = parseInt(match[1]) - 1
      const content = match[3].trim()
      
      if (index >= 0 && index < products.length) {
        descriptions.set(index, content)
      }
    }
  }
  
  return descriptions
}

/**
 * 메시지에서 인트로 텍스트를 추출합니다 (상품 설명 전의 텍스트)
 */
export function extractIntroText(message: string): string {
  // 첫 번째 "1."이 나오기 전까지의 텍스트를 추출
  const match = message.match(/^([\s\S]*?)(?=\n*1\.\s*\*\*|1\.\s+)/m)
  
  if (match && match[1]) {
    return match[1].trim()
  }
  
  return ''
}

/**
 * 메시지에서 아웃트로 텍스트를 추출합니다 (상품 설명 후의 텍스트)
 */
export function extractOutroText(message: string, productCount: number): string {
  // 마지막 상품 설명 이후의 텍스트를 추출
  const pattern = new RegExp(`${productCount}\\.\\s*\\*\\*[^*]+\\*\\*[\\s\\S]*?\\n\\n([\\s\\S]*)$`)
  const match = message.match(pattern)
  
  if (match && match[1]) {
    return match[1].trim()
  }
  
  // 간단한 패턴으로 재시도
  const simplePattern = new RegExp(`${productCount}\\.\\s+[^\\n]+[\\s\\S]*?\\n\\n([\\s\\S]*)$`)
  const simpleMatch = message.match(simplePattern)
  
  if (simpleMatch && simpleMatch[1]) {
    return simpleMatch[1].trim()
  }
  
  return ''
}
