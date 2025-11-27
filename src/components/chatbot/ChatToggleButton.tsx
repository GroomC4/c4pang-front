'use client'

import React, { useState, useEffect } from 'react'
import { useChatbot } from '@/contexts/ChatbotContext'

const ChatToggleButton: React.FC = () => {
  const { state, toggleChatbot } = useChatbot()
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!state.isOpen && state.messages.length > 1) {
      setHasNewMessage(true)
    } else {
      setHasNewMessage(false)
    }
  }, [state.isOpen, state.messages.length])

  const handleClick = () => {
    toggleChatbot()
    setHasNewMessage(false)
  }

  return (
    <div className="chatbot-toggle" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 40
    }}>
      {/* 힌트 */}
      {!state.isOpen && (isHovered || hasNewMessage) && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '0px',
          backgroundColor: 'white',
          color: 'var(--neutral-700)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-medium)',
          boxShadow: 'var(--shadow-medium)',
          border: '2px solid var(--neutral-200)',
          fontSize: '14px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(252,231,243,0.9) 100%)',
          animation: 'float 2s ease-in-out infinite'
        }}>
          {hasNewMessage ? '새 메시지가 있어요! 💌' : '향수 추천받기 🌸'}
        </div>
      )}

      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          boxShadow: 'var(--shadow-strong)',
          background: 'var(--bg-gradient-secondary)',
          color: 'white',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
          backdropFilter: 'blur(10px)'
        }}
        aria-label={state.isOpen ? '챗봇 닫기' : '챗봇 열기'}
      >
        {/* 새 메시지 알림 점 */}
        {hasNewMessage && !state.isOpen && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '16px',
            height: '16px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid white'
          }} />
        )}

        {/* 아이콘 */}
        <div>
          {state.isOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </div>
      </button>
    </div>
  )
}

export default ChatToggleButton