'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { 
  ChatbotState, 
  ChatbotContextType, 
  Message, 
  CheckoutState, 
  ShippingInfo, 
  PaymentMethod,
  ConversationContext,
  QuickActionItem
} from '@/types/chatbot'
import { sendChatMessage } from '@/services/chatbotService'
import { sendMockChatMessage } from '@/services/mockChatbotService'
import { useCart } from './CartContext'
import { CartItem } from '@/types'
import { 
  parseError, 
  getErrorActions, 
  shouldUseFallback, 
  recordFailure, 
  resetFailures,
  getFailureCount 
} from '@/utils/errorHandler'

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Improved message ID generation to ensure uniqueness and prevent collisions
let messageIdCounter = 0
const generateMessageId = (): string => {
  messageIdCounter += 1
  return `msg_${Date.now()}_${messageIdCounter}_${Math.random().toString(36).substr(2, 9)}`
}

const initialState: ChatbotState = {
  messages: [
    {
      id: '1',
      content: '안녕하세요! C4ang AI입니다. 🌸\n어떤 향수를 찾고 계신가요? 취향에 맞는 향수를 추천해드릴게요!',
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
  const cart = useCart()

  // Initialize cart session when conversation context is loaded
  useEffect(() => {
    if (state.conversationContext.sessionId) {
      const userId = 'guest' // Always use 'guest' for now
      console.log('🔑 Setting cart session:', state.conversationContext.sessionId, userId)
      cart.setSession(state.conversationContext.sessionId, userId)
      
      // Sync cart with backend after a short delay to ensure session is set
      setTimeout(() => {
        cart.syncWithBackend().catch(error => {
          console.error('Failed to sync cart:', error)
        })
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.conversationContext.sessionId])

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
      id: generateMessageId(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

    // 로딩 상태 설정
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_TYPING', payload: true })

    // 3초 후 대기 메시지 표시
    let delayMessageId: string | null = null
    const delayTimeout = setTimeout(() => {
      delayMessageId = generateMessageId()
      const delayMessage: Message = {
        id: delayMessageId,
        content: '조금만 기다려주세요... 최적의 답변을 준비하고 있어요! ⏳',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      dispatch({ type: 'ADD_MESSAGE', payload: delayMessage })
    }, 3000)

    try {
      // 실제 API 호출
      const response = await sendChatMessage(content, {
        previousMessages: state.messages.slice(-10), // 최근 10개 메시지만 컨텍스트로 전송
        conversationContext: state.conversationContext
      })

      // 대기 메시지가 표시되었다면 제거
      clearTimeout(delayTimeout)

      // 백엔드 응답 형식 처리 - response.type을 기반으로 메시지 타입 결정
      let messageType: Message['type'] = 'text'
      let messageData: Message['data'] = {}

      // 응답 타입에 따라 메시지 타입과 데이터 설정
      switch (response.type) {
        case 'recommendation':
          messageType = 'recommendation'
          messageData = {
            products: response.products,
            quickActions: response.quickActions
          }
          break
        
        case 'product':
          messageType = 'recommendation'
          messageData = {
            products: response.products,
            quickActions: response.quickActions
          }
          break
        
        case 'action':
        case 'cart':
          messageType = 'cart'
          messageData = {
            quickActions: response.quickActions,
            cartSummary: response.backendResponse?.cart_summary
          }
          // 장바구니 액션인 경우 프론트엔드 장바구니도 동기화
          if (response.type === 'cart') {
            console.log('🔄 장바구니 동기화 시작')
            cart.syncWithBackend().catch(error => {
              console.error('Failed to sync cart after action:', error)
            })
          }
          break
        
        case 'faq':
          messageType = 'text'
          messageData = {
            quickActions: response.quickActions
          }
          break
        
        default:
          messageType = 'text'
          messageData = {
            products: response.products,
            quickActions: response.quickActions,
            cartSummary: response.backendResponse?.cart_summary
          }
          break
      }

      // API 응답을 메시지로 변환
      const botMessage: Message = {
        id: generateMessageId(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: messageType,
        data: messageData
      }
      
      dispatch({ type: 'ADD_MESSAGE', payload: botMessage })
      
      // Reset failure counter on success
      resetFailures()
      
    } catch (error: any) {
      console.error('Failed to send message:', error)
      
      // 대기 메시지 타이머 정리
      clearTimeout(delayTimeout)
      
      // Record failure for consecutive failure tracking
      const shouldSuggestNetworkCheck = recordFailure()
      
      // Parse error using error handler utility
      const errorResponse = parseError(error)
      
      // Try fallback to mock data for network errors
      if (shouldUseFallback(error)) {
        try {
          console.log('Attempting fallback to mock data...')
          const mockResponse = await sendMockChatMessage(content, {
            previousMessages: state.messages.slice(-10),
            conversationContext: state.conversationContext
          })

          const fallbackMessage: Message = {
            id: generateMessageId(),
            content: `⚠️ 오프라인 모드로 전환되었습니다.\n\n${mockResponse.message}`,
            sender: 'bot',
            timestamp: new Date(),
            type: mockResponse.type || 'text',
            data: {
              products: mockResponse.products,
              recommendations: mockResponse.recommendations,
              quickActions: [
                {
                  id: 'retry_connection',
                  label: '🔄 다시 연결 시도',
                  actionType: 'custom',
                  payload: { action: 'retry_message', content }
                }
              ]
            }
          }
          
          dispatch({ type: 'ADD_MESSAGE', payload: fallbackMessage })
          return
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
        }
      }
      
      // Get appropriate quick actions
      const quickActions = getErrorActions(errorResponse, { action: 'retry_message', content })
      
      // Add network check suggestion if multiple consecutive failures
      let errorContent = errorResponse.message
      if (shouldSuggestNetworkCheck) {
        errorContent += '\n\n⚠️ 여러 번 연속으로 오류가 발생했습니다.\n네트워크 연결 상태를 확인해주세요.'
      }
      
      // 오류 메시지
      const errorMessage: Message = {
        id: generateMessageId(),
        content: errorContent,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        data: {
          quickActions: quickActions.length > 0 ? quickActions : undefined
        }
      }
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
      dispatch({ type: 'SET_TYPING', payload: false })
    }
  }, [state.messages, state.conversationContext])

  const addProductToCart = useCallback(async (productId: string, quantity: number = 1) => {
    console.log('🛒 Adding to cart:', productId, 'quantity:', quantity)
    try {
      // Check if product already exists in cart
      const existingItem = cart.items.find(item => item.id === productId)
      console.log('Existing item:', existingItem)
      
      if (existingItem) {
        // Product already in cart - show confirmation message
        const confirmMessage: Message = {
          id: generateMessageId(),
          content: `이미 장바구니에 있는 상품입니다. 수량을 증가시킬까요?\n현재 수량: ${existingItem.quantity}개`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
          data: {
            quickActions: [
              {
                id: `increase_${productId}`,
                label: '수량 증가',
                actionType: 'custom',
                payload: { action: 'increase', productId, currentQuantity: existingItem.quantity }
              },
              {
                id: `cancel_${productId}`,
                label: '취소',
                actionType: 'custom'
              }
            ]
          }
        }
        dispatch({ type: 'ADD_MESSAGE', payload: confirmMessage })
        return
      }

      // Fetch product details from the messages to get full product info
      // Look for the product in recent messages
      console.log('🔍 Searching for product:', productId, 'in', state.messages.length, 'messages')
      let productInfo = null
      for (const message of state.messages) {
        if (message.data?.products) {
          console.log('  Found message with', message.data.products.length, 'products')
          productInfo = message.data.products.find((p: any) => p.id === productId)
          if (productInfo) {
            console.log('  ✅ Found product:', productInfo.name)
            break
          }
        }
      }

      if (!productInfo) {
        // If product not found in messages, show error
        console.error('❌ Product not found:', productId)
        const errorMessage: Message = {
          id: generateMessageId(),
          content: '상품 정보를 찾을 수 없습니다. 다시 시도해주세요.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
        dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
        return
      }

      // Convert ProductRecommendation to Product format for CartContext
      const productForCart = {
        id: productInfo.id,
        name: productInfo.name,
        brand: productInfo.brand,
        price: productInfo.price,
        description: productInfo.description,
        notes: productInfo.notes?.top || [],
        image: productInfo.image,
        category: productInfo.concentration || 'general'
      }

      // Add to cart (this will sync with backend automatically)
      await cart.addItem(productForCart)
      console.log('✅ Cart updated, items:', cart.items.length, 'totalItems:', cart.totalItems)

      // Update conversation context
      dispatch({
        type: 'UPDATE_CONVERSATION_CONTEXT',
        payload: {
          preferences: {
            ...state.conversationContext.preferences,
            cartHistory: [...state.conversationContext.preferences.cartHistory, productId]
          }
        }
      })

      // Show success message with updated cart status from backend
      const successMessage: Message = {
        id: generateMessageId(),
        content: `✅ ${productInfo.name}이(가) 장바구니에 추가되었습니다!\n\n현재 장바구니: ${cart.totalItems}개 상품, 총 ${cart.totalPrice.toLocaleString()}원`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        data: {
          quickActions: [
            {
              id: 'view_cart',
              label: '장바구니 보기',
              actionType: 'view_cart',
              payload: { action: 'view_cart' }
            },
            {
              id: 'continue_shopping',
              label: '쇼핑 계속하기',
              actionType: 'custom'
            }
          ]
        }
      }
      dispatch({ type: 'ADD_MESSAGE', payload: successMessage })

    } catch (error) {
      console.error('Failed to add product to cart:', error)
      
      const errorMessage: Message = {
        id: generateMessageId(),
        content: '장바구니에 상품을 추가하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages, state.conversationContext, dispatch])

  const startCheckout = useCallback(async (mode: 'cart' | 'direct', productId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const userId = state.conversationContext.userId || 'guest'
      const sessionId = state.conversationContext.sessionId

      // Get items based on mode
      let items: CartItem[] = []
      
      if (mode === 'direct' && productId) {
        // For direct purchase, find the product in recent messages
        let productInfo = null
        for (const message of state.messages) {
          if (message.data?.products) {
            productInfo = message.data.products.find((p: any) => p.id === productId)
            if (productInfo) break
          }
        }

        if (!productInfo) {
          const errorMessage: Message = {
            id: generateMessageId(),
            content: '상품 정보를 찾을 수 없습니다. 다시 시도해주세요.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          }
          dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
          return
        }

        // Create temporary cart item for direct purchase
        items = [{
          id: productInfo.id,
          name: productInfo.name,
          brand: productInfo.brand,
          price: productInfo.price,
          description: productInfo.description,
          notes: productInfo.notes?.top || [],
          image: productInfo.image,
          category: productInfo.concentration || 'general',
          quantity: 1
        }]
      } else {
        // For cart mode, get items from CartContext
        if (cart.items.length === 0) {
          const emptyMessage: Message = {
            id: generateMessageId(),
            content: '장바구니가 비어있습니다. 😊\n상품을 먼저 담아주세요.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          }
          dispatch({ type: 'ADD_MESSAGE', payload: emptyMessage })
          return
        }
        items = cart.items
      }

      // Call backend checkout action to get payment methods and cart summary
      const response = await fetch('/api/v1/chatbot/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          action_type: 'checkout',
          payload: {}
        })
      })

      let paymentMethods: PaymentMethod[] = []
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.payment_methods) {
          // Convert backend format to frontend format
          paymentMethods = data.payment_methods.map((m: any) => ({
            methodId: m.method_id,
            methodType: m.method_type,
            displayName: m.display_name,
            icon: m.icon,
            isAvailable: m.is_available
          }))
        }
      } else {
        // Fallback: try direct payment methods endpoint
        const fallbackResponse = await fetch('/api/v1/chatbot/payment-methods', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json()
          if (data.success && data.methods) {
            paymentMethods = data.methods.map((m: any) => ({
              methodId: m.method_id,
              methodType: m.method_type,
              displayName: m.display_name,
              icon: m.icon,
              isAvailable: m.is_available
            }))
          }
        }
      }

      dispatch({ 
        type: 'START_CHECKOUT', 
        payload: { mode, items } 
      })

      // Add checkout start message with payment methods
      const checkoutMessage: Message = {
        id: generateMessageId(),
        content: '결제를 시작합니다. 배송지 정보를 입력해주세요.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'checkout',
        data: {
          checkoutForm: {
            step: 'shipping'
          },
          paymentMethods: paymentMethods.length > 0 ? paymentMethods : undefined
        }
      }
      dispatch({ type: 'ADD_MESSAGE', payload: checkoutMessage })

    } catch (error) {
      console.error('Failed to start checkout:', error)
      
      const errorMessage: Message = {
        id: generateMessageId(),
        content: '결제를 시작하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages, state.conversationContext, dispatch])

  const submitShipping = useCallback(async (info: ShippingInfo) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      // Validate shipping info locally first
      if (!info.recipientName || !info.phone || !info.address || !info.postalCode) {
        const errorMessage: Message = {
          id: generateMessageId(),
          content: '배송지 정보를 모두 입력해주세요.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
        dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
        return
      }

      // Basic phone number validation
      const phoneRegex = /^[0-9-]+$/
      if (!phoneRegex.test(info.phone)) {
        const errorMessage: Message = {
          id: generateMessageId(),
          content: '올바른 전화번호 형식을 입력해주세요.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
        dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
        return
      }

      // Update state with shipping info (backend validation happens at order creation)
      dispatch({ type: 'SET_SHIPPING_INFO', payload: info })

      // Add payment selection message
      const paymentMessage: Message = {
        id: generateMessageId(),
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

    } catch (error) {
      console.error('Failed to submit shipping info:', error)
      
      const errorMessage: Message = {
        id: generateMessageId(),
        content: '배송지 정보 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [dispatch])

  const submitPayment = useCallback(async (method: PaymentMethod) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      // Validate payment method
      if (!method.methodId || !method.methodType) {
        const errorMessage: Message = {
          id: generateMessageId(),
          content: '결제 수단을 선택해주세요.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
        dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
        return
      }

      // Check if payment method is available
      if (!method.isAvailable) {
        const errorMessage: Message = {
          id: generateMessageId(),
          content: '선택하신 결제 수단은 현재 사용할 수 없습니다. 다른 결제 수단을 선택해주세요.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
        dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
        return
      }

      // Update state with payment method (backend processes payment at order creation)
      dispatch({ type: 'SET_PAYMENT_METHOD', payload: method })

      // Show confirmation step with order summary
      const confirmMessage: Message = {
        id: generateMessageId(),
        content: `결제 수단이 선택되었습니다. (${method.displayName})\n주문 내용을 확인하고 결제를 완료해주세요.`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'checkout',
        data: {
          checkoutForm: {
            step: 'confirmation'
          }
        }
      }
      dispatch({ type: 'ADD_MESSAGE', payload: confirmMessage })

    } catch (error) {
      console.error('Failed to submit payment method:', error)
      
      const errorMessage: Message = {
        id: generateMessageId(),
        content: '결제 수단 선택 중 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [dispatch])

  const confirmOrder = useCallback(async () => {
    if (!state.checkoutState || !state.checkoutState.shippingInfo || !state.checkoutState.paymentMethod) {
      const errorMessage: Message = {
        id: generateMessageId(),
        content: '배송지 정보 또는 결제 수단이 누락되었습니다.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const userId = state.conversationContext.userId || 'guest'
      const sessionId = state.conversationContext.sessionId

      // Prepare checkout form in backend format
      const checkoutForm = {
        recipient_name: state.checkoutState.shippingInfo.recipientName,
        phone: state.checkoutState.shippingInfo.phone,
        address: state.checkoutState.shippingInfo.address,
        address_detail: state.checkoutState.shippingInfo.addressDetail || '',
        postal_code: state.checkoutState.shippingInfo.postalCode,
        delivery_message: state.checkoutState.shippingInfo.deliveryMessage || ''
      }

      // Map payment method type to backend format
      const paymentMethodMap: Record<string, string> = {
        'credit_card': 'credit_card',
        'bank_transfer': 'bank_transfer',
        'kakaopay': 'kakaopay',
        'naverpay': 'naverpay',
        'tosspay': 'tosspay'
      }

      const paymentMethod = paymentMethodMap[state.checkoutState.paymentMethod.methodType] || 'credit_card'

      // Call backend chatbot order API
      const response = await fetch('/api/v1/chatbot/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          checkout_form: checkoutForm,
          payment_method: paymentMethod
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || '주문 처리 중 오류가 발생했습니다.')
      }

      const orderData = await response.json()

      if (!orderData.success) {
        throw new Error(orderData.message || '주문 처리 중 오류가 발생했습니다.')
      }

      // Extract order confirmation from response
      const orderConfirmation = orderData.order

      // Convert backend format to frontend format
      const orderMessage: Message = {
        id: generateMessageId(),
        content: '주문이 완료되었습니다! 🎉',
        sender: 'bot',
        timestamp: new Date(),
        type: 'order',
        data: {
          orderConfirmation: {
            orderId: orderConfirmation.order_id,
            orderDate: orderConfirmation.order_date,
            estimatedDelivery: orderConfirmation.estimated_delivery,
            items: state.checkoutState.items,
            totalAmount: orderConfirmation.total_amount,
            shippingInfo: state.checkoutState.shippingInfo,
            paymentMethod: state.checkoutState.paymentMethod,
            status: orderConfirmation.status || 'confirmed'
          }
        }
      }

      dispatch({ type: 'ADD_MESSAGE', payload: orderMessage })
      dispatch({ type: 'COMPLETE_CHECKOUT' })

      // Reset failure counter on successful order
      resetFailures()

      // Clear cart if checkout was from cart mode
      if (state.checkoutState.mode === 'cart') {
        await cart.clearCart()
      }

      // Update conversation context with purchase
      dispatch({
        type: 'UPDATE_CONVERSATION_CONTEXT',
        payload: {
          purchaseHistory: [
            ...state.conversationContext.purchaseHistory,
            ...state.checkoutState.items.map((item: CartItem) => ({
              orderId: orderConfirmation.order_id,
              productId: item.id,
              purchaseDate: new Date(),
              price: item.price
            }))
          ]
        }
      })

    } catch (error: any) {
      console.error('Failed to confirm order:', error)
      
      // Record failure
      recordFailure()
      
      // Parse error using error handler utility
      const errorResponse = parseError(error)
      
      // IMPORTANT: Cart is preserved automatically - we don't clear it on failure
      // The cart contents remain intact for retry
      
      // Get appropriate quick actions
      const quickActions = getErrorActions(errorResponse, { action: 'retry_order' })
      
      // Add back to cart action for all errors
      quickActions.push({
        id: 'back_to_cart',
        label: '🛒 장바구니 확인',
        actionType: 'view_cart',
        payload: { action: 'view_cart' }
      })
      
      // Add cancel checkout action
      quickActions.push({
        id: 'cancel_checkout',
        label: '결제 취소',
        actionType: 'custom',
        payload: { action: 'cancel_checkout' }
      })
      
      // Construct error message with cart preservation notice
      let errorContent = errorResponse.message
      errorContent += '\n\n💡 장바구니 내용은 안전하게 보관되었습니다.'
      
      const errorMessage: Message = {
        id: generateMessageId(),
        content: errorContent,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        data: {
          quickActions: quickActions.length > 0 ? quickActions : undefined
        }
      }
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.checkoutState, state.conversationContext, cart, dispatch])

  const cancelCheckout = useCallback(() => {
    dispatch({ type: 'CANCEL_CHECKOUT' })

    const cancelMessage: Message = {
      id: generateMessageId(),
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

  // View cart contents
  const viewCart = useCallback(async () => {
    console.log('🛒 viewCart called')
    console.log('  - cart items:', cart.items.length)
    console.log('  - cart sessionId:', cart.sessionId)
    console.log('  - cart userId:', cart.userId)
    console.log('  - chatbot sessionId:', state.conversationContext.sessionId)
    
    // CartContext의 sessionId가 없으면 설정
    if (!cart.sessionId && state.conversationContext.sessionId) {
      console.log('🔧 Setting cart session from chatbot context')
      cart.setSession(state.conversationContext.sessionId, 'guest')
      // 약간의 지연 후 동기화
      await new Promise(resolve => setTimeout(resolve, 100))
      await cart.syncWithBackend()
    }
    
    // 동기화 후에도 비어있으면 백엔드에서 직접 조회
    if (cart.items.length === 0 && state.conversationContext.sessionId) {
      console.log('🔍 Fetching cart from backend directly')
      try {
        const { chatbotApi } = await import('@/utils/api')
        const response = await chatbotApi.get(
          `/api/v1/chatbot/cart/guest/${state.conversationContext.sessionId}`
        )
        
        if (response.data.success && response.data.cart.total_items > 0) {
          // 백엔드에 장바구니가 있으면 표시
          const cartData = response.data.cart
          const cartMessage: Message = {
            id: generateMessageId(),
            content: `🛒 장바구니 (${cartData.total_items}개 상품, 총 ${cartData.total_amount.toLocaleString()}원)`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
            data: {
              quickActions: [
                {
                  id: 'checkout',
                  label: '결제하기',
                  actionType: 'checkout',
                  payload: { action: 'checkout' }
                },
                {
                  id: 'continue_shopping',
                  label: '쇼핑 계속하기',
                  actionType: 'custom',
                  payload: { action: 'continue_shopping' }
                }
              ]
            }
          }
          dispatch({ type: 'ADD_MESSAGE', payload: cartMessage })
          return
        }
      } catch (error) {
        console.error('Failed to fetch cart from backend:', error)
      }
    }
    
    if (cart.items.length === 0) {
      const emptyMessage: Message = {
        id: generateMessageId(),
        content: '장바구니가 비어있습니다. 😊\n마음에 드는 향수를 찾아볼까요?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      dispatch({ type: 'ADD_MESSAGE', payload: emptyMessage })
      return
    }

    // Convert CartItems to ProductRecommendations for display
    const cartProducts = cart.items.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      image: item.image,
      description: item.description,
      fragrance: item.notes || [],
      notes: {
        top: item.notes?.slice(0, 3) || [],
        middle: [],
        base: []
      }
    }))

    // Create QuickActions for each cart item
    const cartMessage: Message = {
      id: generateMessageId(),
      content: `🛒 장바구니 (${cart.totalItems}개 상품, 총 ${cart.totalPrice.toLocaleString()}원)`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'product',
      data: {
        products: cartProducts,
        quickActions: [
          {
            id: 'checkout',
            label: '결제하기',
            actionType: 'checkout',
            payload: { action: 'checkout' }
          },
          {
            id: 'clear_cart',
            label: '장바구니 비우기',
            actionType: 'custom',
            payload: { action: 'clear_cart' }
          },
          {
            id: 'continue_shopping',
            label: '쇼핑 계속하기',
            actionType: 'custom',
            payload: { action: 'continue_shopping' }
          }
        ]
      }
    }
    dispatch({ type: 'ADD_MESSAGE', payload: cartMessage })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.conversationContext.sessionId])

  // Handle QuickAction clicks
  const handleQuickAction = useCallback(async (action: QuickActionItem) => {
    console.log('🎯 QuickAction clicked:', action)
    
    // Handle actions based on actionType first (standardized action types)
    switch (action.actionType) {
      case 'add_to_cart':
        // Add product to cart from quick action
        if (action.payload?.productId) {
          await addProductToCart(action.payload.productId, action.payload.quantity || 1)
        }
        return
      
      case 'buy_now':
        // Direct purchase - add to cart and start checkout
        if (action.payload?.productId) {
          await addProductToCart(action.payload.productId, 1)
          // Start direct checkout with the product
          await startCheckout('direct', action.payload.productId)
        }
        return
      
      case 'view_cart':
        // Show cart contents
        viewCart()
        return
      
      case 'checkout':
        // Start checkout process from cart
        await startCheckout('cart')
        return
      
      case 'show_detail':
        // Show product detail (could be implemented to show more info)
        if (action.payload?.productId) {
          const detailMessage: Message = {
            id: generateMessageId(),
            content: `상품 상세 정보를 확인하시려면 상품을 클릭해주세요.`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          }
          dispatch({ type: 'ADD_MESSAGE', payload: detailMessage })
        }
        return
      
      case 'next_page':
      case 'previous_page':
        // Pagination actions - could be implemented for product lists
        console.log('📄 Page action:', action.actionType)
        const pageMessage: Message = {
          id: generateMessageId(),
          content: '페이지 이동 기능은 곧 추가될 예정입니다. 😊',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
        dispatch({ type: 'ADD_MESSAGE', payload: pageMessage })
        console.log('📄 Page message dispatched')
        return
      
      case 'custom':
        // Handle custom actions via payload
        break
      
      default:
        // Unknown action type
        break
    }

    // Handle custom actions via payload.action
    if (!action.payload) return

    const { action: actionType, productId, content } = action.payload

    switch (actionType) {
      case 'add_to_cart':
        // Add product to cart
        if (productId) {
          await addProductToCart(productId, action.payload.quantity || 1)
        }
        break

      case 'retry_message':
        // Retry sending the message
        if (content) {
          await sendMessage(content)
        }
        break
      
      case 'retry':
        // Generic retry action - check what to retry
        if (content) {
          await sendMessage(content)
        }
        break

      case 'increase':
        // Increase quantity in cart
        if (productId) {
          const item = cart.items.find(i => i.id === productId)
          if (item) {
            const oldQuantity = item.quantity
            await cart.updateQuantity(productId, item.quantity + 1)
            
            const message: Message = {
              id: generateMessageId(),
              content: `✅ 수량이 증가되었습니다. (${oldQuantity} → ${oldQuantity + 1}개)\n\n현재 장바구니: ${cart.totalItems + 1}개 상품, 총 ${(cart.totalPrice + item.price).toLocaleString()}원`,
              sender: 'bot',
              timestamp: new Date(),
              type: 'text',
              data: {
                quickActions: [
                  {
                    id: 'view_cart_after_increase',
                    label: '장바구니 보기',
                    actionType: 'view_cart',
                    payload: { action: 'view_cart' }
                  }
                ]
              }
            }
            dispatch({ type: 'ADD_MESSAGE', payload: message })
          }
        }
        break

      case 'decrease':
        // Decrease quantity in cart
        if (productId) {
          const item = cart.items.find(i => i.id === productId)
          if (item) {
            const oldQuantity = item.quantity
            if (item.quantity > 1) {
              await cart.updateQuantity(productId, item.quantity - 1)
              
              const message: Message = {
                id: generateMessageId(),
                content: `✅ 수량이 감소되었습니다. (${oldQuantity} → ${oldQuantity - 1}개)\n\n현재 장바구니: ${cart.totalItems - 1}개 상품, 총 ${(cart.totalPrice - item.price).toLocaleString()}원`,
                sender: 'bot',
                timestamp: new Date(),
                type: 'text',
                data: {
                  quickActions: [
                    {
                      id: 'view_cart_after_decrease',
                      label: '장바구니 보기',
                      actionType: 'view_cart',
                      payload: { action: 'view_cart' }
                    }
                  ]
                }
              }
              dispatch({ type: 'ADD_MESSAGE', payload: message })
            } else {
              // Quantity is 1, will be removed
              const itemName = item.name
              await cart.updateQuantity(productId, 0)
              
              const message: Message = {
                id: generateMessageId(),
                content: `✅ ${itemName}이(가) 장바구니에서 제거되었습니다.\n\n현재 장바구니: ${Math.max(0, cart.totalItems - 1)}개 상품, 총 ${Math.max(0, cart.totalPrice - item.price).toLocaleString()}원`,
                sender: 'bot',
                timestamp: new Date(),
                type: 'text',
                data: {
                  quickActions: [
                    {
                      id: 'view_cart_after_remove',
                      label: '장바구니 보기',
                      actionType: 'view_cart',
                      payload: { action: 'view_cart' }
                    }
                  ]
                }
              }
              dispatch({ type: 'ADD_MESSAGE', payload: message })
            }
          }
        }
        break

      case 'remove':
        // Remove item from cart
        if (productId) {
          const item = cart.items.find(i => i.id === productId)
          if (item) {
            const itemName = item.name
            const itemPrice = item.price * item.quantity
            await cart.removeItem(productId)
            
            const message: Message = {
              id: generateMessageId(),
              content: `✅ ${itemName}이(가) 장바구니에서 제거되었습니다.\n\n현재 장바구니: ${Math.max(0, cart.totalItems - item.quantity)}개 상품, 총 ${Math.max(0, cart.totalPrice - itemPrice).toLocaleString()}원`,
              sender: 'bot',
              timestamp: new Date(),
              type: 'text',
              data: {
                quickActions: cart.items.length > 1 ? [
                  {
                    id: 'view_cart_after_remove',
                    label: '장바구니 보기',
                    actionType: 'view_cart',
                    payload: { action: 'view_cart' }
                  }
                ] : undefined
              }
            }
            dispatch({ type: 'ADD_MESSAGE', payload: message })
          }
        }
        break

      case 'view_cart':
        // Show cart contents
        viewCart()
        break

      case 'clear_cart':
        // Clear all items from cart
        await cart.clearCart()
        const clearMessage: Message = {
          id: generateMessageId(),
          content: '✅ 장바구니가 비워졌습니다.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
          data: {
            quickActions: [
              {
                id: 'continue_after_clear',
                label: '쇼핑 계속하기',
                actionType: 'custom',
                payload: { action: 'continue_shopping' }
              }
            ]
          }
        }
        dispatch({ type: 'ADD_MESSAGE', payload: clearMessage })
        break

      case 'checkout':
        // Start checkout process
        await startCheckout('cart')
        break

      case 'continue_shopping':
        // Just acknowledge
        const continueMessage: Message = {
          id: generateMessageId(),
          content: '어떤 향수를 찾고 계신가요? 😊',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
        dispatch({ type: 'ADD_MESSAGE', payload: continueMessage })
        break

      case 'retry_order':
        // Retry order confirmation
        await confirmOrder()
        break

      case 'cancel_checkout':
        // Cancel checkout
        cancelCheckout()
        const cancelCheckoutMessage: Message = {
          id: generateMessageId(),
          content: '✅ 결제가 취소되었습니다.\n\n장바구니 내용은 그대로 유지됩니다.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
          data: {
            quickActions: [
              {
                id: 'view_cart_after_cancel',
                label: '장바구니 보기',
                actionType: 'view_cart',
                payload: { action: 'view_cart' }
              },
              {
                id: 'continue_after_cancel',
                label: '쇼핑 계속하기',
                actionType: 'custom',
                payload: { action: 'continue_shopping' }
              }
            ]
          }
        }
        dispatch({ type: 'ADD_MESSAGE', payload: cancelCheckoutMessage })
        break
      
      case 'help':
        // Show help message
        const helpMessage: Message = {
          id: generateMessageId(),
          content: '💬 도움이 필요하신가요?\n\n다음과 같은 질문을 해보세요:\n• "향수 추천해줘"\n• "가격대별 향수 보여줘"\n• "배송 관련 문의"\n• "교환/반품 정책"\n\n무엇을 도와드릴까요?',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
        dispatch({ type: 'ADD_MESSAGE', payload: helpMessage })
        break
      
      case 'contact_support':
        // Show contact support message
        const supportMessage: Message = {
          id: generateMessageId(),
          content: '📞 고객센터 안내\n\n• 전화: 1588-XXXX\n• 이메일: support@c4pang.com\n• 운영시간: 평일 09:00-18:00\n\n문의사항을 남겨주시면 빠르게 도와드리겠습니다! 😊',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
          data: {
            quickActions: [
              {
                id: 'continue_after_support',
                label: '돌아가기',
                actionType: 'custom',
                payload: { action: 'continue_shopping' }
              }
            ]
          }
        }
        dispatch({ type: 'ADD_MESSAGE', payload: supportMessage })
        break
      
      case 'cancel':
        // Just acknowledge cancellation
        const cancelMessage: Message = {
          id: generateMessageId(),
          content: '알겠습니다. 다른 도움이 필요하시면 말씀해주세요! 😊',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
        dispatch({ type: 'ADD_MESSAGE', payload: cancelMessage })
        break

      default:
        // Unknown action - log for debugging
        console.warn('Unknown quick action:', actionType, action)
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, viewCart, startCheckout, sendMessage, confirmOrder, cancelCheckout, addProductToCart])

  const value: ChatbotContextType = {
    state,
    sendMessage,
    addProductToCart,
    viewCart,
    startCheckout,
    submitShipping,
    submitPayment,
    confirmOrder,
    cancelCheckout,
    toggleChatbot,
    clearMessages,
    updatePreferences,
    updateUserId,
    handleQuickAction
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

