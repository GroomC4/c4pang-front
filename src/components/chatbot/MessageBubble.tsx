'use client'

import React from 'react'
import { Message } from '@/types/chatbot'
import { RecommendationView } from './RecommendationView'
import { FAQView } from './FAQView'

interface MessageBubbleProps {
  message: Message
  isLastMessage?: boolean
  onProductClick?: (productId: string) => void
  onSearchFAQ?: (query: string) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLastMessage, onProductClick, onSearchFAQ }) => {
  const isUser = message.sender === 'user'
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp)
  }

  return (
    <div style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'fadeIn 0.3s ease-in'
      }}>
      <div style={{
          maxWidth: '320px',
          order: isUser ? 2 : 1
        }}>
        {/* Avatar */}
        {!isUser && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{
                width: '24px',
                height: '24px',
                background: 'linear-gradient(to right, #f472b6, #ec4899)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px'
              }}>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>🌸</span>
            </div>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>퍼퓸퀸</span>
          </div>
        )}
        
        {/* Message Bubble */}
        <div
          style={{
            position: 'relative',
            padding: '8px 16px',
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            backgroundColor: isUser ? '#ec4899' : '#f3f4f6',
            color: isUser ? 'white' : '#1f2937',
            marginLeft: isUser ? '16px' : '0',
            marginRight: isUser ? '0' : '16px',
            animation: isLastMessage ? 'pulse 1s' : 'none'
          }}
        >
          {/* Message Content */}
          <div style={{
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
            {message.content}
          </div>

          {/* Recommendation View */}
          {!isUser && message.type === 'recommendation' && message.data?.recommendations && (
            <div style={{ marginTop: '12px' }}>
              <RecommendationView 
                recommendations={message.data.recommendations}
                onProductClick={onProductClick}
              />
            </div>
          )}

          {/* FAQ View */}
          {!isUser && message.type === 'faq' && message.data?.faqs && (
            <div style={{ marginTop: '12px' }}>
              <FAQView 
                faqs={message.data.faqs}
                onSearchFAQ={onSearchFAQ}
              />
            </div>
          )}
          
          {/* Timestamp */}
          <div style={{
              fontSize: '12px',
              marginTop: '4px',
              color: isUser ? '#fce7f3' : '#6b7280'
            }}>
            {formatTime(message.timestamp)}
          </div>
          
          {/* Message Tail */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              width: 0,
              height: 0,
              ...(isUser ? {
                right: 0,
                transform: 'translateX(8px)',
                borderLeft: '8px solid #ec4899',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent'
              } : {
                left: 0,
                transform: 'translateX(-8px)',
                borderRight: '8px solid #f3f4f6',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent'
              })
            }}
          />
        </div>
        
        {/* User Avatar */}
        {isUser && (
          <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: '4px'
            }}>
            <span style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500',
                marginRight: '8px'
              }}>나</span>
            <div style={{
                width: '24px',
                height: '24px',
                background: 'linear-gradient(to right, #c084fc, #f472b6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>👤</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble