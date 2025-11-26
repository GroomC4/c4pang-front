'use client'

import React, { useEffect, useRef } from 'react'
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

  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      zIndex: 50
    }}>
      <div 
        ref={containerRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb',
          width: '350px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        tabIndex={-1}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #ec4899, #db2777)',
          color: 'white',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>🌸</span>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>퍼퓸퀸 어시스턴트</h3>
              <p style={{ fontSize: '12px', color: '#fce7f3', margin: 0 }}>향수 추천 전문가</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={clearMessages}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              title="대화 내용 지우기"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              title="챗봇 닫기"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageList messages={state.messages} isTyping={state.isTyping} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3">
          <MessageInput 
            onSendMessage={sendMessage} 
            disabled={state.isLoading || state.isTyping}
          />
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-100 p-2 bg-gray-50">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => sendMessage('향수 추천해주세요')}
              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full hover:bg-primary-200 transition-colors"
            >
              향수 추천
            </button>
            <button
              onClick={() => sendMessage('인기 브랜드가 뭐예요?')}
              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full hover:bg-primary-200 transition-colors"
            >
              인기 브랜드
            </button>
            <button
              onClick={() => sendMessage('가격대별로 알려주세요')}
              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full hover:bg-primary-200 transition-colors"
            >
              가격 정보
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatContainer