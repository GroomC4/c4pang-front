'use client'

import React, { useState, useRef, useEffect } from 'react'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const maxLength = 500

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setMessage('')
      
      // 포커스 유지
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const remainingChars = maxLength - message.length
  const isNearLimit = remainingChars <= 50

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Character Counter */}
      {isNearLimit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{
              fontSize: '12px',
              color: remainingChars <= 10 ? '#ef4444' : '#9ca3af'
            }}>
            {remainingChars}자 남음
          </span>
        </div>
      )}
      
      {/* Input Container */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "응답을 기다리고 있어요..." : "메시지를 입력하세요..."}
            disabled={disabled}
            maxLength={maxLength}
            style={{
              width: '100%',
              padding: '8px 48px 8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '9999px',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: disabled ? '#f3f4f6' : 'white',
              color: disabled ? '#9ca3af' : '#1f2937',
              cursor: disabled ? 'not-allowed' : 'text',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.border = '2px solid #ec4899'
              e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid #d1d5db'
              e.target.style.boxShadow = 'none'
            }}
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            style={{
              position: 'absolute',
              right: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              backgroundColor: !message.trim() || disabled ? '#e5e7eb' : '#ec4899',
              color: !message.trim() || disabled ? '#9ca3af' : 'white',
              cursor: !message.trim() || disabled ? 'not-allowed' : 'pointer',
              boxShadow: !message.trim() || disabled ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!(!message.trim() || disabled)) {
                e.currentTarget.style.backgroundColor = '#db2777'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!(!message.trim() || disabled)) {
                e.currentTarget.style.backgroundColor = '#ec4899'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {disabled ? (
              <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #d1d5db',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
            ) : (
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Helpful Tips */}
      <div style={{
          fontSize: '12px',
          color: '#6b7280',
          padding: '0 4px'
        }}>
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
          <span>💡</span>
          <span>"향수 추천", "가격 정보", "브랜드 문의" 등을 물어보세요!</span>
        </span>
      </div>
    </form>
  )
}

export default MessageInput