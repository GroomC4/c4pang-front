/**
 * Type conversion utilities for backend (snake_case) and frontend (camelCase) data structures
 */

import {
  ProductRecommendation,
  QuickActionItem,
  ShippingInfo,
  PaymentMethod,
  OrderInfo,
  BackendProductCard,
  BackendQuickAction,
  BackendCheckoutForm,
  BackendPaymentMethod,
  BackendOrderConfirmation,
  BackendBotResponse,
  BackendUserMessage,
  BackendActionRequest,
  BackendCartItem,
  Message,
} from '@/types/chatbot'
import { CartItem } from '@/types'

/**
 * Convert backend QuickAction to frontend QuickActionItem
 */
export function convertQuickAction(backendAction: BackendQuickAction): QuickActionItem {
  return {
    id: backendAction.id,
    label: backendAction.label,
    icon: backendAction.icon,
    actionType: backendAction.action_type,
    payload: backendAction.payload,
  }
}

/**
 * Convert backend ProductCard to frontend ProductRecommendation
 */
export function convertProductCard(backendProduct: BackendProductCard): ProductRecommendation {
  const notes: { top: string[]; middle: string[]; base: string[] } | undefined =
    backendProduct.top_notes || backendProduct.middle_notes || backendProduct.base_notes
      ? {
          top: backendProduct.top_notes ? backendProduct.top_notes.split(',').map(n => n.trim()) : [],
          middle: backendProduct.middle_notes ? backendProduct.middle_notes.split(',').map(n => n.trim()) : [],
          base: backendProduct.base_notes ? backendProduct.base_notes.split(',').map(n => n.trim()) : [],
        }
      : undefined

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    brand: backendProduct.brand,
    price: backendProduct.price || 0,
    image: backendProduct.image_url || '',
    description: backendProduct.description || '',
    concentration: backendProduct.concentration,
    mainAccords: backendProduct.main_accords,
    notes,
    detailUrl: backendProduct.detail_url,
    similarityScore: backendProduct.similarity_score,
    quickActions: backendProduct.quick_actions?.map(convertQuickAction),
  }
}

/**
 * Convert backend CheckoutForm to frontend ShippingInfo
 */
export function convertCheckoutForm(backendForm: BackendCheckoutForm): ShippingInfo {
  return {
    recipientName: backendForm.recipient_name,
    phone: backendForm.phone,
    address: backendForm.address,
    addressDetail: backendForm.address_detail,
    postalCode: backendForm.postal_code,
    deliveryMessage: backendForm.delivery_message,
  }
}

/**
 * Convert frontend ShippingInfo to backend CheckoutForm
 */
export function convertShippingInfoToBackend(shippingInfo: ShippingInfo): BackendCheckoutForm {
  return {
    recipient_name: shippingInfo.recipientName,
    phone: shippingInfo.phone,
    address: shippingInfo.address,
    address_detail: shippingInfo.addressDetail,
    postal_code: shippingInfo.postalCode,
    delivery_message: shippingInfo.deliveryMessage,
  }
}

/**
 * Convert backend PaymentMethod to frontend PaymentMethod
 */
export function convertPaymentMethod(backendMethod: BackendPaymentMethod): PaymentMethod {
  return {
    methodId: backendMethod.method_id,
    methodType: backendMethod.method_type,
    displayName: backendMethod.display_name,
    icon: backendMethod.icon,
    isAvailable: backendMethod.is_available,
  }
}

/**
 * Convert backend CartItem to frontend CartItem
 */
export function convertCartItem(backendItem: BackendCartItem): CartItem {
  return {
    id: backendItem.product_id,
    name: backendItem.name,
    brand: backendItem.brand,
    price: backendItem.price,
    quantity: backendItem.quantity,
    image: backendItem.image_url || '',
    description: '', // Not provided by backend cart item
    notes: [], // Not provided by backend cart item
    category: backendItem.concentration || '', // Use concentration as category fallback
  }
}

/**
 * Convert backend OrderConfirmation to frontend OrderInfo
 */
export function convertOrderConfirmation(backendOrder: BackendOrderConfirmation): OrderInfo {
  return {
    orderId: backendOrder.order_id,
    orderDate: backendOrder.order_date,
    estimatedDelivery: backendOrder.estimated_delivery,
    items: backendOrder.items.map(convertCartItem),
    totalAmount: backendOrder.total_amount,
    shippingInfo: convertCheckoutForm(backendOrder.shipping_info),
    paymentMethod: {
      methodId: backendOrder.payment_method,
      methodType: 'credit_card', // Default, should be parsed from payment_method string
      displayName: backendOrder.payment_method,
    },
    status: backendOrder.status as 'pending' | 'confirmed' | 'processing',
  }
}

/**
 * Convert backend BotResponse to frontend Message
 */
export function convertBotResponseToMessage(
  backendResponse: BackendBotResponse,
  messageId: string
): Message {
  return {
    id: messageId,
    content: backendResponse.message,
    sender: 'bot',
    timestamp: new Date(),
    type: backendResponse.response_type,
    data: {
      products: backendResponse.product_cards?.map(convertProductCard),
      quickActions: backendResponse.quick_actions?.map(convertQuickAction),
      cartSummary: backendResponse.cart_summary,
      checkoutForm: backendResponse.checkout_form
        ? { step: 'shipping' as const, data: convertCheckoutForm(backendResponse.checkout_form) }
        : undefined,
      paymentMethods: backendResponse.payment_methods?.map(convertPaymentMethod),
      orderConfirmation: backendResponse.order_confirmation
        ? convertOrderConfirmation(backendResponse.order_confirmation)
        : undefined,
    },
  }
}

/**
 * Convert frontend message to backend UserMessage format
 */
export function convertToBackendUserMessage(
  userId: string,
  sessionId: string,
  message: string,
  actionType?: string,
  actionPayload?: any
): BackendUserMessage {
  return {
    user_id: userId,
    session_id: sessionId,
    message,
    action_type: actionType,
    action_payload: actionPayload,
  }
}

/**
 * Convert frontend action to backend ActionRequest format
 */
export function convertToBackendActionRequest(
  userId: string,
  sessionId: string,
  actionType: string,
  payload: any
): BackendActionRequest {
  return {
    user_id: userId,
    session_id: sessionId,
    action_type: actionType,
    payload,
  }
}

/**
 * Generic snake_case to camelCase converter for object keys
 */
export function snakeToCamel(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(snakeToCamel)

  const camelObj: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      camelObj[camelKey] = snakeToCamel(obj[key])
    }
  }
  return camelObj
}

/**
 * Generic camelCase to snake_case converter for object keys
 */
export function camelToSnake(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(camelToSnake)

  const snakeObj: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      snakeObj[snakeKey] = camelToSnake(obj[key])
    }
  }
  return snakeObj
}
