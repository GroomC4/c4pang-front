import apiService from './api'
import { Product } from './product'

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
  totalPrice: number
}

export interface Order {
  id: string
  customerId: string
  orderNumber: string
  items: OrderItem[]
  totalAmount: number
  totalQuantity: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  shippingAddress: string
  phoneNumber: string
  orderDate: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  shippingAddress: string
  phoneNumber: string
  paymentMethod: 'CARD' | 'CASH' | 'TRANSFER'
}

export interface OrderListResponse {
  content: Order[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

class OrderService {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiService.instance.post('/api/v1/orders', data)
    return response.data
  }

  async getOrders(page = 0, size = 20): Promise<OrderListResponse> {
    const response = await apiService.instance.get('/api/v1/orders', {
      params: { page, size }
    })
    return response.data
  }

  async getOrder(id: string): Promise<Order> {
    const response = await apiService.instance.get(`/api/v1/orders/${id}`)
    return response.data
  }

  async cancelOrder(id: string): Promise<Order> {
    const response = await apiService.instance.put(`/api/v1/orders/${id}/cancel`)
    return response.data
  }
}

export const orderService = new OrderService()
export default orderService