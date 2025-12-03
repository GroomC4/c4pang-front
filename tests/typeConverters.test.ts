import { describe, it, expect } from 'vitest'
import {
  convertQuickAction,
  convertProductCard,
  convertCheckoutForm,
  convertShippingInfoToBackend,
  convertPaymentMethod,
  convertCartItem,
  convertOrderConfirmation,
  convertBotResponseToMessage,
  convertToBackendUserMessage,
  convertToBackendActionRequest,
  snakeToCamel,
  camelToSnake,
} from '@/utils/typeConverters'
import type {
  BackendQuickAction,
  BackendProductCard,
  BackendCheckoutForm,
  BackendPaymentMethod,
  BackendCartItem,
  BackendOrderConfirmation,
  BackendBotResponse,
  ShippingInfo,
} from '@/types/chatbot'

describe('Type Converters', () => {
  describe('convertQuickAction', () => {
    it('should convert backend quick action to frontend format', () => {
      const backendAction: BackendQuickAction = {
        id: 'action-1',
        label: 'Add to Cart',
        icon: 'cart',
        action_type: 'add_to_cart',
        payload: { productId: 'prod-123' },
      }

      const result = convertQuickAction(backendAction)

      expect(result).toEqual({
        id: 'action-1',
        label: 'Add to Cart',
        icon: 'cart',
        actionType: 'add_to_cart',
        payload: { productId: 'prod-123' },
      })
    })
  })

  describe('convertProductCard', () => {
    it('should convert backend product card to frontend format', () => {
      const backendProduct: BackendProductCard = {
        id: 'prod-1',
        brand: 'Chanel',
        name: 'No. 5',
        image_url: 'https://example.com/image.jpg',
        price: 150000,
        concentration: 'EDP',
        main_accords: 'Floral, Aldehyde',
        top_notes: 'Aldehydes, Neroli',
        middle_notes: 'Jasmine, Rose',
        base_notes: 'Sandalwood, Vanilla',
        description: 'Classic perfume',
        detail_url: 'https://example.com/detail',
        similarity_score: 0.95,
        quick_actions: [],
      }

      const result = convertProductCard(backendProduct)

      expect(result).toEqual({
        id: 'prod-1',
        brand: 'Chanel',
        name: 'No. 5',
        image: 'https://example.com/image.jpg',
        price: 150000,
        concentration: 'EDP',
        mainAccords: 'Floral, Aldehyde',
        notes: {
          top: ['Aldehydes', 'Neroli'],
          middle: ['Jasmine', 'Rose'],
          base: ['Sandalwood', 'Vanilla'],
        },
        description: 'Classic perfume',
        detailUrl: 'https://example.com/detail',
        similarityScore: 0.95,
        quickActions: [],
      })
    })

    it('should handle missing optional fields', () => {
      const backendProduct: BackendProductCard = {
        id: 'prod-2',
        brand: 'Dior',
        name: 'Sauvage',
      }

      const result = convertProductCard(backendProduct)

      expect(result.price).toBe(0)
      expect(result.image).toBe('')
      expect(result.description).toBe('')
      expect(result.notes).toBeUndefined()
    })
  })

  describe('convertCheckoutForm', () => {
    it('should convert backend checkout form to frontend shipping info', () => {
      const backendForm: BackendCheckoutForm = {
        recipient_name: 'John Doe',
        phone: '010-1234-5678',
        address: '123 Main St',
        address_detail: 'Apt 4B',
        postal_code: '12345',
        delivery_message: 'Leave at door',
      }

      const result = convertCheckoutForm(backendForm)

      expect(result).toEqual({
        recipientName: 'John Doe',
        phone: '010-1234-5678',
        address: '123 Main St',
        addressDetail: 'Apt 4B',
        postalCode: '12345',
        deliveryMessage: 'Leave at door',
      })
    })
  })

  describe('convertShippingInfoToBackend', () => {
    it('should convert frontend shipping info to backend format', () => {
      const shippingInfo: ShippingInfo = {
        recipientName: 'Jane Smith',
        phone: '010-9876-5432',
        address: '456 Oak Ave',
        addressDetail: 'Suite 100',
        postalCode: '54321',
        deliveryMessage: 'Ring doorbell',
      }

      const result = convertShippingInfoToBackend(shippingInfo)

      expect(result).toEqual({
        recipient_name: 'Jane Smith',
        phone: '010-9876-5432',
        address: '456 Oak Ave',
        address_detail: 'Suite 100',
        postal_code: '54321',
        delivery_message: 'Ring doorbell',
      })
    })
  })

  describe('convertPaymentMethod', () => {
    it('should convert backend payment method to frontend format', () => {
      const backendMethod: BackendPaymentMethod = {
        method_id: 'pm-1',
        method_type: 'credit_card',
        display_name: 'Credit Card',
        icon: 'credit-card',
        is_available: true,
      }

      const result = convertPaymentMethod(backendMethod)

      expect(result).toEqual({
        methodId: 'pm-1',
        methodType: 'credit_card',
        displayName: 'Credit Card',
        icon: 'credit-card',
        isAvailable: true,
      })
    })
  })

  describe('convertCartItem', () => {
    it('should convert backend cart item to frontend format', () => {
      const backendItem: BackendCartItem = {
        product_id: 'prod-1',
        brand: 'Chanel',
        name: 'No. 5',
        price: 150000,
        quantity: 2,
        image_url: 'https://example.com/image.jpg',
        concentration: 'EDP',
      }

      const result = convertCartItem(backendItem)

      expect(result).toEqual({
        id: 'prod-1',
        brand: 'Chanel',
        name: 'No. 5',
        price: 150000,
        quantity: 2,
        image: 'https://example.com/image.jpg',
        description: '',
        notes: [],
        category: 'EDP',
      })
    })
  })

  describe('convertOrderConfirmation', () => {
    it('should convert backend order confirmation to frontend format', () => {
      const backendOrder: BackendOrderConfirmation = {
        order_id: 'order-123',
        order_date: '2024-01-15T10:30:00Z',
        total_amount: 300000,
        items: [
          {
            product_id: 'prod-1',
            brand: 'Chanel',
            name: 'No. 5',
            price: 150000,
            quantity: 2,
          },
        ],
        shipping_info: {
          recipient_name: 'John Doe',
          phone: '010-1234-5678',
          address: '123 Main St',
          postal_code: '12345',
        },
        payment_method: 'credit_card',
        estimated_delivery: '2024-01-20',
        status: 'pending',
      }

      const result = convertOrderConfirmation(backendOrder)

      expect(result.orderId).toBe('order-123')
      expect(result.totalAmount).toBe(300000)
      expect(result.items).toHaveLength(1)
      expect(result.shippingInfo.recipientName).toBe('John Doe')
      expect(result.status).toBe('pending')
    })
  })

  describe('convertBotResponseToMessage', () => {
    it('should convert backend bot response to frontend message', () => {
      const backendResponse: BackendBotResponse = {
        message: 'Here are some recommendations',
        product_cards: [
          {
            id: 'prod-1',
            brand: 'Chanel',
            name: 'No. 5',
            price: 150000,
          },
        ],
        quick_actions: [
          {
            id: 'action-1',
            label: 'View Cart',
            action_type: 'view_cart',
          },
        ],
        response_type: 'recommendation',
      }

      const result = convertBotResponseToMessage(backendResponse, 'msg-1')

      expect(result.id).toBe('msg-1')
      expect(result.content).toBe('Here are some recommendations')
      expect(result.sender).toBe('bot')
      expect(result.type).toBe('recommendation')
      expect(result.data?.products).toHaveLength(1)
      expect(result.data?.quickActions).toHaveLength(1)
    })
  })

  describe('convertToBackendUserMessage', () => {
    it('should convert frontend message to backend format', () => {
      const result = convertToBackendUserMessage(
        'user-123',
        'session-456',
        'Show me floral perfumes',
        'search',
        { category: 'floral' }
      )

      expect(result).toEqual({
        user_id: 'user-123',
        session_id: 'session-456',
        message: 'Show me floral perfumes',
        action_type: 'search',
        action_payload: { category: 'floral' },
      })
    })
  })

  describe('convertToBackendActionRequest', () => {
    it('should convert frontend action to backend format', () => {
      const result = convertToBackendActionRequest('user-123', 'session-456', 'add_to_cart', {
        productId: 'prod-1',
        quantity: 1,
      })

      expect(result).toEqual({
        user_id: 'user-123',
        session_id: 'session-456',
        action_type: 'add_to_cart',
        payload: { productId: 'prod-1', quantity: 1 },
      })
    })
  })

  describe('snakeToCamel', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        user_id: '123',
        session_id: '456',
        product_name: 'Test Product',
        nested_object: {
          inner_key: 'value',
        },
      }

      const result = snakeToCamel(input)

      expect(result).toEqual({
        userId: '123',
        sessionId: '456',
        productName: 'Test Product',
        nestedObject: {
          innerKey: 'value',
        },
      })
    })

    it('should handle arrays', () => {
      const input = [
        { user_id: '1', user_name: 'Alice' },
        { user_id: '2', user_name: 'Bob' },
      ]

      const result = snakeToCamel(input)

      expect(result).toEqual([
        { userId: '1', userName: 'Alice' },
        { userId: '2', userName: 'Bob' },
      ])
    })

    it('should handle null and undefined', () => {
      expect(snakeToCamel(null)).toBeNull()
      expect(snakeToCamel(undefined)).toBeUndefined()
    })
  })

  describe('camelToSnake', () => {
    it('should convert camelCase keys to snake_case', () => {
      const input = {
        userId: '123',
        sessionId: '456',
        productName: 'Test Product',
        nestedObject: {
          innerKey: 'value',
        },
      }

      const result = camelToSnake(input)

      expect(result).toEqual({
        user_id: '123',
        session_id: '456',
        product_name: 'Test Product',
        nested_object: {
          inner_key: 'value',
        },
      })
    })

    it('should handle arrays', () => {
      const input = [
        { userId: '1', userName: 'Alice' },
        { userId: '2', userName: 'Bob' },
      ]

      const result = camelToSnake(input)

      expect(result).toEqual([
        { user_id: '1', user_name: 'Alice' },
        { user_id: '2', user_name: 'Bob' },
      ])
    })

    it('should handle null and undefined', () => {
      expect(camelToSnake(null)).toBeNull()
      expect(camelToSnake(undefined)).toBeUndefined()
    })
  })
})
