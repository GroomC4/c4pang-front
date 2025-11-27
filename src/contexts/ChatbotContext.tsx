'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { ChatbotState, ChatbotContextType, Message } from '@/types/chatbot'
import { sendChatMessage } from '@/services/chatbotService'

const initialState: ChatbotState = {
  messages: [
    {
      id: '1',
      content: '안녕하세요! 퍼퓸퀸입니다. 🌸\n어떤 향수를 찾고 계신가요? 취향에 맞는 향수를 추천해드릴게요!',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ],
  isOpen: false,
  isTyping: false,
  isLoading: false
}

type ChatbotAction =
  | { type: 'TOGGLE_CHATBOT' }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }

const chatbotReducer = (state: ChatbotState, action: ChatbotAction): ChatbotState => {
  switch (action.type) {
    case 'TOGGLE_CHATBOT':
      return { ...state, isOpen: !state.isOpen }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [initialState.messages[0]] }
    default:
      return state
  }
}

const ChatbotContext = createContext<ChatbotContextType | null>(null)

export const ChatbotProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(chatbotReducer, initialState)

  const sendMessage = useCallback(async (content: string) => {
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

    // 로딩 상태 설정
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_TYPING', payload: true })

    try {
      // 실제 API 호출
      const response = await sendChatMessage(content, {
        previousMessages: state.messages.slice(-10), // 최근 10개 메시지만 컨텍스트로 전송
      })

      // API 응답을 메시지로 변환
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type || 'text'
      }
      
      dispatch({ type: 'ADD_MESSAGE', payload: botMessage })
      
    } catch (error) {
      console.error('Failed to send message:', error)
      
      // 오류 시 폴백 메시지
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 🙏',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
      dispatch({ type: 'SET_TYPING', payload: false })
    }
  }, [state.messages])

  const toggleChatbot = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHATBOT' })
  }, [])

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' })
  }, [])

  const value = {
    state,
    sendMessage,
    toggleChatbot,
    clearMessages
  }

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
}

export const useChatbot = () => {
  const context = useContext(ChatbotContext)
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider')
  }
  return context
}

