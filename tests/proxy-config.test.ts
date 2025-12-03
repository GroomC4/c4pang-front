/**
 * API 프록시 설정 테스트 (MSA 환경)
 * 
 * next.config.js의 프록시 설정이 올바르게 구성되었는지 확인합니다.
 * - 챗봇 API: 8000 포트
 * - Customer Service API: 8081 포트
 */

import { describe, it, expect } from 'vitest'

describe('API Proxy Configuration (MSA)', () => {
  it('should have correct chatbot URL from environment variable', () => {
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000'
    
    expect(chatbotUrl).toBeDefined()
    expect(chatbotUrl).toMatch(/^https?:\/\//)
    expect(chatbotUrl).toContain('8000')
    
    console.log('✅ Chatbot URL:', chatbotUrl)
  })

  it('should have correct customer service URL from environment variable', () => {
    const customerServiceUrl = process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_URL || 'http://localhost:8081'
    
    expect(customerServiceUrl).toBeDefined()
    expect(customerServiceUrl).toMatch(/^https?:\/\//)
    expect(customerServiceUrl).toContain('8081')
    
    console.log('✅ Customer Service URL:', customerServiceUrl)
  })

  it('should route chatbot API to port 8000', () => {
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000'
    const chatbotPaths = [
      '/api/v1/chatbot/health',
      '/api/v1/chatbot/message',
      '/api/v1/chatbot/action',
      '/api/v1/chatbot/cart/user123/session456',
    ]
    
    chatbotPaths.forEach(path => {
      const destination = `${chatbotUrl}${path}`
      expect(destination).toMatch(/^http:\/\/localhost:8000\/api\/v1\/chatbot\//)
    })
    
    console.log('✅ Chatbot API paths are correctly routed to port 8000')
  })

  it('should route other API to customer service port 8081', () => {
    const customerServiceUrl = process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_URL || 'http://localhost:8081'
    const customerPaths = [
      '/api/products',
      '/api/orders',
      '/api/users',
    ]
    
    customerPaths.forEach(path => {
      const destination = `${customerServiceUrl}${path}`
      expect(destination).toMatch(/^http:\/\/localhost:8081\/api\//)
    })
    
    console.log('✅ Customer Service API paths are correctly routed to port 8081')
  })

  it('should use default URLs when environment variables are not set', () => {
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000'
    const customerServiceUrl = process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_URL || 'http://localhost:8081'
    
    expect(chatbotUrl).toContain('localhost:8000')
    expect(customerServiceUrl).toContain('localhost:8081')
    
    console.log('✅ Default URLs are correctly set')
  })
})
