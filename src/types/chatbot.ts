import { CartItem } from '@/types'
import { UserPreferences } from '@/types/recommendation'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'product' | 'action' | 'recommendation' | 'faq' | 'checkout' | 'order'
  data?: {
    recommendations?: any[]
    faqs?: any[]
    products?: ProductRecommendation[]
    actions?: string[]
    checkoutForm?: CheckoutFormData
    orderConfirmation?: OrderInfo
    quickActions?: QuickActionItem[]
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
  notes?: {
    top: string[]
    middle: string[]
    base: string[]
  }
  season?: string
  occasion?: string
}

export interface ShippingInfo {
  recipientName: string
  phone: string
  address: string
  addressDetail: string
  postalCode: string
  deliveryRequest?: string
}

export interface PaymentMethod {
  type: 'card' | 'bank' | 'simple'
  provider?: string
  cardNumber?: string
  expiryDate?: string
  cvc?: string
}

export interface CheckoutState {
  mode: 'cart' | 'direct'
  items: CartItem[]
  shippingInfo?: ShippingInfo
  paymentMethod?: PaymentMethod
  step: 'summary' | 'shipping' | 'payment' | 'confirmation'
}

export interface ConversationContext {
  userId?: string
  sessionId: string
  preferences: UserPreferences
  recentProducts: string[]
  purchaseHistory: PurchaseHistory[]
}

export interface PurchaseHistory {
  orderId: string
  productId: string
  purchaseDate: Date
  price: number
}

export interface OrderInfo {
  orderId: string
  orderDate: string
  estimatedDelivery: string
  items: CartItem[]
  totalAmount: number
  shippingInfo: ShippingInfo
  paymentMethod: PaymentMethod
  status: 'pending' | 'confirmed' | 'processing'
}

export interface QuickActionItem {
  id: string
  label: string
  icon?: string
  type: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  payload?: any
}

export interface CheckoutFormData {
  step: 'shipping' | 'payment'
  data?: ShippingInfo | PaymentMethod
}

export interface ChatbotState {
  messages: Message[]
  isOpen: boolean
  isTyping: boolean
  isLoading: boolean
  conversationContext: ConversationContext
  checkoutState: CheckoutState | null
}

export interface ChatbotContextType {
  state: ChatbotState
  sendMessage: (content: string) => Promise<void>
  addProductToCart: (productId: string, quantity: number) => Promise<void>
  viewCart: () => void
  startCheckout: (mode: 'cart' | 'direct', productId?: string) => void
  submitShipping: (info: ShippingInfo) => void
  submitPayment: (method: PaymentMethod) => Promise<void>
  confirmOrder: () => Promise<void>
  cancelCheckout: () => void
  toggleChatbot: () => void
  clearMessages: () => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  updateUserId: (userId?: string) => void
  handleQuickAction: (action: QuickActionItem) => Promise<void>
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

export interface ErrorResponse {
  type: 'network' | 'validation' | 'business'
  message: string
  code: string
  retryable: boolean
  fallbackAction?: QuickActionItem
}