export interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'product' | 'action' | 'recommendation' | 'faq'
  data?: {
    recommendations?: any[]
    faqs?: any[]
    products?: ProductRecommendation[]
    actions?: string[]
  }
}

export interface ProductRecommendation {
  id: string
  name: string
  brand: string
  price: number
  image: string
  description: string
  fragrance: string[]
}

export interface ChatbotState {
  messages: Message[]
  isOpen: boolean
  isTyping: boolean
  isLoading: boolean
}

export interface ChatbotContextType {
  state: ChatbotState
  sendMessage: (content: string) => void
  toggleChatbot: () => void
  clearMessages: () => void
}

export interface MessageProps {
  message: Message
}

export interface MessageInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
}

export interface ChatContainerProps {
  isOpen: boolean
  onClose: () => void
}