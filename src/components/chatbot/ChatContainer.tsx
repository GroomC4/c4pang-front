'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useChatbot } from '@/contexts/ChatbotContext'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

interface ChatContainerProps {
  isOpen: boolean
  onClose: () => void
}

const ChatContainer: React.FC<ChatContainerProps> = ({ isOpen, onClose }) => {
  const { state, sendMessage, clearMessages } = useChatbot()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.focus()
    }
  }, [isOpen])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      ...(isFullscreen ? {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      } : {
        bottom: '90px',
        right: '20px',
        zIndex: 50
      })
    }}>
      <div 
        ref={containerRef}
        className="chatbot-container"
        style={{
          backgroundColor: 'white',
          borderRadius: isFullscreen ? '0' : 'var(--radius-large)',
          boxShadow: 'var(--shadow-strong)',
          border: '1px solid var(--neutral-200)',
          width: isFullscreen ? '100vw' : 'min(400px, calc(100vw - 40px))',
          height: isFullscreen ? '100vh' : 'min(600px, calc(100vh - 140px))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(252,231,243,0.95) 100%)'
        }}
        tabIndex={-1}
      >
        {/* Header */}
        <div style={{
          background: 'var(--bg-gradient-secondary)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 'var(--radius-large) var(--radius-large) 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>🌸</span>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '700', 
                margin: 0,
                fontFamily: 'var(--font-elegant)',
                letterSpacing: '-0.02em'
              }}>C4pang AI</h3>
              <p style={{ 
                fontSize: '13px', 
                color: 'rgba(255, 255, 255, 0.8)', 
                margin: 0,
                fontWeight: '500'
              }}>향수 추천 전문가 ✨</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleFullscreen}
              style={{
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: 'var(--radius-small)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              title={isFullscreen ? '일반 모드' : '전체화면'}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {isFullscreen ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('대화 내역을 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                  clearMessages()
                }
              }}
              style={{
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: 'var(--radius-small)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              title="대화 내용 지우기"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: 'var(--radius-small)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              title="챗봇 닫기"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ 
          flex: 1, 
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <MessageList messages={state.messages} isTyping={state.isTyping} />
        </div>

        {/* Loading Indicator */}
        {state.isLoading && (
          <div style={{
            padding: '8px 16px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ec4899',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              AI가 응답을 생성하고 있어요...
            </span>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-3">
          <MessageInput 
            onSendMessage={sendMessage} 
            disabled={state.isLoading || state.isTyping}
          />
        </div>

        {/* Quick Actions */}
        <div className="border-t p-3" style={{
          borderColor: 'var(--neutral-200)',
          background: 'linear-gradient(135deg, var(--neutral-100) 0%, var(--accent-pearl) 100%)'
        }}>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => !state.isLoading && !state.isTyping && sendMessage('향수 추천해주세요')}
              disabled={state.isLoading || state.isTyping}
              style={{
                fontSize: '13px',
                backgroundColor: state.isLoading || state.isTyping ? 'var(--neutral-200)' : 'var(--neutral-100)',
                color: state.isLoading || state.isTyping ? 'var(--neutral-400)' : 'var(--primary-pink)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-xl)',
                border: state.isLoading || state.isTyping ? '1px solid var(--neutral-300)' : '2px solid var(--primary-pink)',
                cursor: state.isLoading || state.isTyping ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: state.isLoading || state.isTyping ? 0.5 : 1,
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                if (!state.isLoading && !state.isTyping) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-pink)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!state.isLoading && !state.isTyping) {
                  e.currentTarget.style.backgroundColor = 'var(--neutral-100)'
                  e.currentTarget.style.color = 'var(--primary-pink)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              ✨ 향수 추천
            </button>
            <button
              onClick={() => !state.isLoading && !state.isTyping && sendMessage('인기 브랜드가 뭐예요?')}
              disabled={state.isLoading || state.isTyping}
              style={{
                fontSize: '13px',
                backgroundColor: state.isLoading || state.isTyping ? 'var(--neutral-200)' : 'var(--neutral-100)',
                color: state.isLoading || state.isTyping ? 'var(--neutral-400)' : 'var(--primary-pink)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-xl)',
                border: state.isLoading || state.isTyping ? '1px solid var(--neutral-300)' : '2px solid var(--primary-pink)',
                cursor: state.isLoading || state.isTyping ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: state.isLoading || state.isTyping ? 0.5 : 1,
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                if (!state.isLoading && !state.isTyping) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-pink)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!state.isLoading && !state.isTyping) {
                  e.currentTarget.style.backgroundColor = 'var(--neutral-100)'
                  e.currentTarget.style.color = 'var(--primary-pink)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              🔥 인기 브랜드
            </button>
            <button
              onClick={() => !state.isLoading && !state.isTyping && sendMessage('가격대별로 알려주세요')}
              disabled={state.isLoading || state.isTyping}
              style={{
                fontSize: '13px',
                backgroundColor: state.isLoading || state.isTyping ? 'var(--neutral-200)' : 'var(--neutral-100)',
                color: state.isLoading || state.isTyping ? 'var(--neutral-400)' : 'var(--primary-pink)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-xl)',
                border: state.isLoading || state.isTyping ? '1px solid var(--neutral-300)' : '2px solid var(--primary-pink)',
                cursor: state.isLoading || state.isTyping ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: state.isLoading || state.isTyping ? 0.5 : 1,
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                if (!state.isLoading && !state.isTyping) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-pink)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!state.isLoading && !state.isTyping) {
                  e.currentTarget.style.backgroundColor = 'var(--neutral-100)'
                  e.currentTarget.style.color = 'var(--primary-pink)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              💰 가격 정보
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatContainer