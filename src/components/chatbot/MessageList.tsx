'use client'

import React, { useEffect, useRef } from 'react'
import { Message } from '@/types/chatbot'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

interface MessageListProps {
  messages: Message[]
  isTyping: boolean
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Detect if user is manually scrolling
  const handleScroll = () => {
    if (!scrollAreaRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    // If user is more than 100px from bottom, they're likely scrolling through history
    isUserScrollingRef.current = distanceFromBottom > 100

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Reset user scrolling flag after 1 second of no scroll activity
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false
    }, 1000)
  }

  // Auto-scroll when new messages arrive, but only if user isn't scrolling
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToBottom()
    }
  }, [messages, isTyping])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      ref={scrollAreaRef}
      onScroll={handleScroll}
      style={{
        flex: '1',
        overflowY: 'auto',
        padding: '16px',
        maxHeight: 'calc(100% - 120px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLastMessage={index === messages.length - 1}
        />
      ))}
      
      {isTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList