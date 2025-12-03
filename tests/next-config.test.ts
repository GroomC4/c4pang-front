/**
 * Next.js 설정 파일 테스트 (MSA 환경)
 * 
 * next.config.js가 MSA 환경에 맞게 올바르게 구성되었는지 확인합니다.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Next.js Configuration (MSA)', () => {
  it('should have rewrites configuration in next.config.js', () => {
    const configPath = join(process.cwd(), 'next.config.js')
    const configContent = readFileSync(configPath, 'utf-8')
    
    // rewrites 함수가 존재하는지 확인
    expect(configContent).toContain('async rewrites()')
    
    // MSA 환경 변수를 사용하는지 확인
    expect(configContent).toContain('NEXT_PUBLIC_CHATBOT_URL')
    expect(configContent).toContain('NEXT_PUBLIC_CUSTOMER_SERVICE_URL')
    
    console.log('✅ next.config.js has correct MSA rewrites configuration')
  })

  it('should have separate routes for chatbot and customer service', () => {
    const configPath = join(process.cwd(), 'next.config.js')
    const configContent = readFileSync(configPath, 'utf-8')
    
    // 챗봇 API 라우트 확인
    expect(configContent).toContain("source: '/api/v1/chatbot/:path*'")
    
    // 일반 API 라우트 확인
    expect(configContent).toContain("source: '/api/:path*'")
    
    console.log('✅ Separate routes for chatbot and customer service are configured')
  })

  it('should use port 8000 for chatbot', () => {
    const configPath = join(process.cwd(), 'next.config.js')
    const configContent = readFileSync(configPath, 'utf-8')
    
    // 챗봇 포트 8000 확인
    expect(configContent).toContain('8000')
    
    console.log('✅ Port 8000 is configured for chatbot')
  })

  it('should use port 8081 for customer service', () => {
    const configPath = join(process.cwd(), 'next.config.js')
    const configContent = readFileSync(configPath, 'utf-8')
    
    // Customer Service 포트 8081 확인
    expect(configContent).toContain('8081')
    
    console.log('✅ Port 8081 is configured for customer service')
  })

  it('should have correct route priority (chatbot before general API)', () => {
    const configPath = join(process.cwd(), 'next.config.js')
    const configContent = readFileSync(configPath, 'utf-8')
    
    // 챗봇 라우트가 일반 API 라우트보다 먼저 정의되어야 함
    const chatbotIndex = configContent.indexOf("source: '/api/v1/chatbot/:path*'")
    const generalIndex = configContent.indexOf("source: '/api/:path*'")
    
    expect(chatbotIndex).toBeGreaterThan(-1)
    expect(generalIndex).toBeGreaterThan(-1)
    expect(chatbotIndex).toBeLessThan(generalIndex)
    
    console.log('✅ Route priority is correct (chatbot routes come first)')
  })
})
