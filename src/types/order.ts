// Order 관련 타입 정의

export interface Order {
  orderId: string
  userId: string
  orderItems: OrderItem[]
  totalAmount: number
  status: OrderStatus
  shippingAddress: Address
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  orderItemId: string
  productId: string
  productName: string
  quantity: number
  price: number
  totalPrice: number
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface Address {
  addressId?: string
  recipientName: string
  recipientPhone: string
  zipCode: string
  address: string
  addressDetail: string
}

export interface OrderCreateRequest {
  orderItems: {
    productId: string
    quantity: number
  }[]
  address: Address
}

export interface OrderCancelRequest {
  reason?: string
}

export interface RefundRequest {
  orderItemId: string
  reason: string
}
