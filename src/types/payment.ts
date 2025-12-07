// Payment 관련 타입 정의

export interface Payment {
  paymentId: string
  orderId: string
  userId: string
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  createdAt: string
  updatedAt: string
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
  MOBILE = 'MOBILE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface PaymentCreateRequest {
  orderId: string
  paymentMethod: PaymentMethod
}

export interface PaymentDetail extends Payment {
  orderInfo: {
    orderId: string
    orderItems: Array<{
      productName: string
      quantity: number
      price: number
    }>
  }
  history?: PaymentHistory[]
}

export interface PaymentHistory {
  status: PaymentStatus
  timestamp: string
  note?: string
}
