import { CartItem } from '@/types'
import { UserPreferences } from '@/types/recommendation'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'recommendation' | 'cart' | 'checkout' | 'confirmation' | 'error' | 'product' | 'action' | 'order' | 'faq'
  data?: {
    products?: ProductRecommendation[]
    recommendations?: any[]
    faqs?: any[]
    actions?: string[]
    quickActions?: QuickActionItem[]
    cartSummary?: any
    checkoutForm?: CheckoutFormData | any
    paymentMethods?: PaymentMethod[]
    orderConfirmation?: OrderInfo
  }
}

export interface ProductRecommendation {
  id: string
  name: string
  brand: string
  price: number
  image: string
  description: string
  concentration?: string
  mainAccords?: string
  notes?: {
    top: string[]
    middle: string[]
    base: string[]
  }
  detailUrl?: string
  similarityScore?: number
  quickActions?: QuickActionItem[]
  fragrance?: string[]
  season?: string
  occasion?: string
}

export interface ShippingInfo {
  recipientName: string
  phone: string
  address: string
  addressDetail?: string
  postalCode: string
  deliveryMessage?: string
}

export interface PaymentMethod {
  methodId?: string
  methodType?: 'credit_card' | 'bank_transfer' | 'kakaopay' | 'naverpay' | 'tosspay'
  displayName?: string
  icon?: string
  isAvailable?: boolean
  
  // For checkout form
  type?: 'card' | 'bank' | 'simple'
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
  actionType: 'add_to_cart' | 'buy_now' | 'show_detail' | 'next_page' | 'previous_page' | 'view_cart' | 'checkout' | 'custom'
  payload?: any
  type?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
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

// Backend API Types (snake_case from Python)
export interface BackendQuickAction {
  id: string
  label: string
  icon?: string
  action_type: 'add_to_cart' | 'buy_now' | 'show_detail' | 'next_page' | 'previous_page' | 'view_cart' | 'checkout' | 'custom'
  payload?: any
}

export interface BackendProductCard {
  id: string
  brand: string
  name: string
  image_url?: string
  price?: number
  concentration?: string
  main_accords?: string
  top_notes?: string
  middle_notes?: string
  base_notes?: string
  description?: string
  detail_url?: string
  similarity_score?: number
  quick_actions?: BackendQuickAction[]
}

export interface BackendCartItem {
  product_id: string
  brand: string
  name: string
  price: number
  quantity: number
  image_url?: string
  concentration?: string
}

export interface BackendCheckoutForm {
  recipient_name: string
  phone: string
  address: string
  address_detail?: string
  postal_code: string
  delivery_message?: string
}

export interface BackendPaymentMethod {
  method_id: string
  method_type: 'credit_card' | 'bank_transfer' | 'kakaopay' | 'naverpay' | 'tosspay'
  display_name: string
  icon?: string
  is_available?: boolean
}

export interface BackendOrderConfirmation {
  order_id: string
  order_date: string
  total_amount: number
  items: BackendCartItem[]
  shipping_info: BackendCheckoutForm
  payment_method: string
  estimated_delivery: string
  status: string
}

export interface BackendBotResponse {
  message: string
  product_cards?: BackendProductCard[]
  quick_actions?: BackendQuickAction[]
  cart_summary?: any
  checkout_form?: BackendCheckoutForm
  payment_methods?: BackendPaymentMethod[]
  order_confirmation?: BackendOrderConfirmation
  response_type: 'text' | 'recommendation' | 'cart' | 'checkout' | 'confirmation' | 'error'
  is_typing?: boolean
}

export interface BackendUserMessage {
  user_id: string
  session_id: string
  message: string
  action_type?: string
  action_payload?: any
}

export interface BackendActionRequest {
  user_id: string
  session_id: string
  action_type: string
  payload: any
}