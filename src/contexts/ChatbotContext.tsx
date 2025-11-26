'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { ChatbotState, ChatbotContextType, Message } from '@/types/chatbot'

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

    // 타이핑 효과 시작
    dispatch({ type: 'SET_TYPING', payload: true })

    // 봇 응답 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      const botResponse = generateBotResponse(content)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      
      dispatch({ type: 'SET_TYPING', payload: false })
      dispatch({ type: 'ADD_MESSAGE', payload: botMessage })
    }, 1000 + Math.random() * 1000)
  }, [])

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

// 간단한 봇 응답 생성기 (실제로는 백엔드 API 호출)
const generateBotResponse = (userInput: string): string => {
  const input = userInput.toLowerCase()
  
  // 향수 추천 관련
  if (input.includes('추천') || input.includes('향수')) {
    return '어떤 향을 좋아하시나요? 🌹\n• 플로럴 (장미, 재스민)\n• 시트러스 (레몬, 오렌지)\n• 우디 (샌달우드, 시더)\n• 머스크 (부드럽고 따뜻한 향)\n\n원하시는 향을 말씀해주시면 맞춤 추천해드릴게요!'
  }
  
  // 가격 관련
  if (input.includes('가격') || input.includes('얼마')) {
    return '퍼퓸퀸에서는 다양한 가격대의 향수를 준비했어요! 💝\n\n• 5만원 이하: 데일리 향수\n• 5-10만원: 프리미엄 향수\n• 10만원 이상: 럭셔리 향수\n\n어떤 가격대를 원하시나요?'
  }
  
  // 브랜드 관련
  if (input.includes('브랜드') || input.includes('메이커')) {
    return '인기 브랜드를 소개해드릴게요! ✨\n\n• 샤넬 - 클래식하고 우아한 향\n• 딥티크 - 유니크하고 세련된 향\n• 조말론 - 영국의 전통적인 향\n• 르라보 - 모던하고 개성있는 향\n\n어떤 브랜드가 궁금하신가요?'
  }
  
  // 기본 응답
  const responses = [
    '더 자세히 알려주시면 더 정확한 추천을 해드릴 수 있어요! 😊',
    '향수에 대해 궁금한 점이 있으시면 언제든 물어보세요! 🌸',
    '어떤 스타일의 향수를 찾고 계신지 알려주세요! ✨',
    '취향에 맞는 완벽한 향수를 찾아드릴게요! 💕'
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}