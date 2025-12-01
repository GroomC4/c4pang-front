'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { 
  ChatbotState, 
  ChatbotContextType, 
  Message, 
  CheckoutState, 
  ShippingInfo, 
  PaymentMethod,
  ConversationContext 
} from '@/types/chatbot'
import { sendChatMessage } from '@/services/chatbotService'
import { useCart } from './CartContext'
import { usePreferences } from './PreferenceContext'
import { CartItem } from '@/types'

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const initialState: ChatbotState = {
  messages: [
    {
      id: '1',
      content: '안녕하세요! C4pang입니다. 🌸\n어떤 향수를 찾고 계신가요? 취향에 맞는 향수를 추천해드릴게요!',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ],
  isOpen: false,
  isTyping: false,
  isLoading: false,
  conversationContext: {
    sessionId: generateSessionId(),
    preferences: {
      fragranceTypes: [],
      priceRange: { min: 0, max: 300000 },
      favoriteNotes: [],
      preferredBrands: [],
      occasions: [],
      intensity: 'medium',
      purchaseHistory: [],
      viewHistory: [],
      cartHistory: []
    },
    recentProducts: [],
    purchaseHistory: []
  },
  checkoutState: null
}

type ChatbotAction =
  | { type: 'TOGGLE_CHATBOT' }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'UPDATE_CONVERSATION_CONTEXT'; payload: Partial<ConversationContext> }
  | { type: 'START_CHECKOUT'; payload: { mode: 'cart' | 'direct'; items: CartItem[] } }
  | { type: 'UPDATE_CHECKOUT_STEP'; payload: CheckoutState['step'] }
  | { type: 'SET_SHIPPING_INFO'; payload: ShippingInfo }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'CANCEL_CHECKOUT' }
  | { type: 'COMPLETE_CHECKOUT' }

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
      return { 
        ...state, 
        messages: [initialState.messages[0]],
        conversationContext: {
          ...state.conversationContext,
          sessionId: generateSessionId(),
          recentProducts: []
        }
      }
    case 'UPDATE_CONVERSATION_CONTEXT':
      return {
        ...state,
        conversationContext: {
          ...state.conversationContext,
          ...action.payload
        }
      }
    case 'START_CHECKOUT':
      return {
        ...state,
        checkoutState: {
          mode: action.payload.mode,
          items: action.payload.items,
          step: 'summary'
        }
      }
    case 'UPDATE_CHECKOUT_STEP':
      if (!state.checkoutState) return state
      return {
        ...state,
        checkoutState: {
          ...state.checkoutState,
          step: action.payload
        }
      }
    case 'SET_SHIPPING_INFO':
      if (!state.checkoutState) return state
      return {
        ...state,
        checkoutState: {
          ...state.checkoutState,
          shippingInfo: action.payload,
          step: 'payment'
        }
      }
    case 'SET_PAYMENT_METHOD':
      if (!state.checkoutState) return state
      return {
        ...state,
        checkoutState: {
          ...state.checkoutState,
          paymentMethod: action.payload,
          step: 'confirmation'
        }
      }
    case 'CANCEL_CHECKOUT':
      return {
        ...state,
        checkoutState: null
      }
    case 'COMPLETE_CHECKOUT':
      return {
        ...state,
        checkoutState: null
      }
    default:
      return state
  }
}

const ChatbotContext = createContext<ChatbotContextType | null>(null)

export const ChatbotProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(chatbotReducer, initialState)

  // Load preferences from sessionStorage on mount
  useEffect(() => {
    const loadConversationContext = () => {
      try {
        const savedContext = sessionStorage.getItem('conversationContext')
        if (savedContext) {
          const parsedContext = JSON.parse(savedContext)
          dispatch({
            type: 'UPDATE_CONVERSATION_CONTEXT',
            payload: parsedContext
          })
        }
      } catch (error) {
        console.error('Failed to load conversation context:', error)
      }
    }

    loadConversationContext()
  }, [])

  // Save conversation context to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('conversationContext', JSON.stringify(state.conversationContext))
    } catch (error) {
      console.error('Failed to save conversation context:', error)
    }
  }, [state.conversationContext])

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
        conversationContext: state.conversationContext
      })

      // API 응답을 메시지로 변환
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type || 'text',
        data: {
          recommendations: response.recommendations,
          faqs: response.faqs,
          products: response.products,
          actions: response.actions
        }
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
  }, [state.messages, state.conversationContext])

  const addProductToCart = useCallback(async (productId: string, quantity: number) => {
    // This will be implemented when integrating with CartContext
    // For now, just add a confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      content: `상품이 장바구니에 추가되었습니다. (상품 ID: ${productId}, 수량: ${quantity})`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
    dispatch({ type: 'ADD_MESSAGE', payload: confirmMessage })
  }, [])

  const startCheckout = useCallback((mode: 'cart' | 'direct', productId?: string) => {
    // Get items based on mode
    let items: CartItem[] = []
    
    if (mode === 'direct' && productId) {
      // For direct purchase, create a temporary cart with single item
      // This will be properly implemented when we have product data
      items = []
    } else {
      // For cart mode, get items from CartContext
      // This will be properly implemented when integrating with CartContext
      items = []
    }

    dispatch({ 
      type: 'START_CHECKOUT', 
      payload: { mode, items } 
    })

    // Add checkout start message
    const checkoutMessage: Message = {
      id: Date.now().toString(),
      content: '결제를 시작합니다. 배송지 정보를 입력해주세요.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'checkout',
      data: {
        checkoutForm: {
          step: 'shipping'
        }
      }
    }
    dispatch({ type: 'ADD_MESSAGE', payload: checkoutMessage })
  }, [])

  const submitShipping = useCallback((info: ShippingInfo) => {
    dispatch({ type: 'SET_SHIPPING_INFO', payload: info })

    // Add payment selection message
    const paymentMessage: Message = {
      id: Date.now().toString(),
      content: '배송지 정보가 저장되었습니다. 결제 수단을 선택해주세요.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'checkout',
      data: {
        checkoutForm: {
          step: 'payment'
        }
      }
    }
    dispatch({ type: 'ADD_MESSAGE', payload: paymentMessage })
  }, [])

  const submitPayment = useCallback(async (method: PaymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method })

    // Show confirmation step
    const confirmMessage: Message = {
      id: Date.now().toString(),
      content: '결제 수단이 선택되었습니다. 주문을 확인해주세요.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'checkout'
    }
    dispatch({ type: 'ADD_MESSAGE', payload: confirmMessage })
  }, [])

  const confirmOrder = useCallback(async () => {
    if (!state.checkoutState) return

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      // Here we would call the order API
      // For now, just simulate success
      
      const orderId = `ORD${Date.now()}`
      const orderDate = new Date().toISOString()
      const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

      const orderMessage: Message = {
        id: Date.now().toString(),
        content: '주문이 완료되었습니다! 🎉',
        sender: 'bot',
        timestamp: new Date(),
        type: 'order',
        data: {
          orderConfirmation: {
            orderId,
            orderDate,
            estimatedDelivery,
            items: state.checkoutState.items,
            totalAmount: state.checkoutState.items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0),
            shippingInfo: state.checkoutState.shippingInfo!,
            paymentMethod: state.checkoutState.paymentMethod!,
            status: 'confirmed'
          }
        }
      }

      dispatch({ type: 'ADD_MESSAGE', payload: orderMessage })
      dispatch({ type: 'COMPLETE_CHECKOUT' })

      // Update conversation context with purchase
      const productIds = state.checkoutState.items.map((item: CartItem) => item.id)
      dispatch({
        type: 'UPDATE_CONVERSATION_CONTEXT',
        payload: {
          purchaseHistory: [
            ...state.conversationContext.purchaseHistory,
            ...state.checkoutState.items.map((item: CartItem) => ({
              orderId,
              productId: item.id,
              purchaseDate: new Date(),
              price: item.price
            }))
          ]
        }
      })

    } catch (error) {
      console.error('Failed to confirm order:', error)
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.checkoutState, state.conversationContext])

  const cancelCheckout = useCallback(() => {
    dispatch({ type: 'CANCEL_CHECKOUT' })

    const cancelMessage: Message = {
      id: Date.now().toString(),
      content: '결제가 취소되었습니다.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
    dispatch({ type: 'ADD_MESSAGE', payload: cancelMessage })
  }, [])

  const toggleChatbot = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHATBOT' })
  }, [])

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' })
    // Clear sessionStorage when clearing messages
    try {
      sessionStorage.removeItem('conversationContext')
    } catch (error) {
      console.error('Failed to clear conversation context:', error)
    }
  }, [])

  // Method to update conversation context preferences
  const updatePreferences = useCallback((preferences: Partial<ConversationContext['preferences']>) => {
    dispatch({
      type: 'UPDATE_CONVERSATION_CONTEXT',
      payload: {
        preferences: {
          ...state.conversationContext.preferences,
          ...preferences
        }
      }
    })
  }, [state.conversationContext.preferences])

  // Method to update user ID when user logs in
  const updateUserId = useCallback((userId?: string) => {
    dispatch({
      type: 'UPDATE_CONVERSATION_CONTEXT',
      payload: { userId }
    })
  }, [])

  const value: ChatbotContextType = {
    state,
    sendMessage,
    addProductToCart,
    startCheckout,
    submitShipping,
    submitPayment,
    confirmOrder,
    cancelCheckout,
    toggleChatbot,
    clearMessages,
    updatePreferences,
    updateUserId
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

