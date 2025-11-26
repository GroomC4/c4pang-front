'use client'

import React from 'react'

const TypingIndicator: React.FC = () => {
  return (
    <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        animation: 'fadeIn 0.3s ease-in'
      }}>
      <div style={{ maxWidth: '320px' }}>
        {/* Avatar */}
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
        
        {/* Typing Bubble */}
        <div style={{
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            padding: '12px 16px',
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginRight: '16px',
            position: 'relative'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#9ca3af',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite'
                }}></div>
              <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#9ca3af',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite',
                  animationDelay: '0.1s'
                }}></div>
              <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#9ca3af',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite',
                  animationDelay: '0.2s'
                }}></div>
            </div>
            <span style={{
                fontSize: '12px',
                color: '#6b7280',
                marginLeft: '8px'
              }}>입력중...</span>
          </div>
          
          {/* Message Tail */}
          <div style={{
              position: 'absolute',
              top: '12px',
              left: 0,
              transform: 'translateX(-8px)',
              borderRight: '8px solid #f3f4f6',
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent'
            }} />
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator