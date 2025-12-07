import { apiService } from './api'
import type { 
  Order, 
  OrderCreateRequest, 
  OrderCancelRequest,
  RefundRequest 
} from '@/types/order'
import type { PaginatedResponse } from '@/types/api'

class OrderService {
  private readonly BASE_PATH = '/api/v1/orders'

  /**
   * 주문 생성
   * 인증 필요 (Customer)
   */
  async createOrder(data: OrderCreateRequest): Promise<Order> {
    const response = await apiService.instance.post(this.BASE_PATH, data)
    return response.data
  }

  /**
   * 내 주문 목록 조회
   * 인증 필요
   */
  async getMyOrders(params?: { page?: number; size?: number }): Promise<PaginatedResponse<Order>> {
    const response = await apiService.instance.get(this.BASE_PATH, { params })
    return response.data
  }

  /**
   * 주문 상세 조회
   * 인증 필요 (본인 주문만)
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiService.instance.get(`${this.BASE_PATH}/${orderId}`)
    return response.data
  }

  /**
   * 주문 취소
   * 인증 필요 (본인 주문만, 배송 출발 전까지만 가능)
   */
  async cancelOrder(orderId: string, data?: OrderCancelRequest): Promise<Order> {
    const response = await apiService.instance.post(`${this.BASE_PATH}/${orderId}/cancel`, data)
    return response.data
  }

  /**
   * 반품/환불 요청
   * 인증 필요 (배송중이거나 완료된 주문)
   */
  async requestRefund(orderId: string, data: RefundRequest): Promise<Order> {
    const response = await apiService.instance.post(`${this.BASE_PATH}/${orderId}/refund`, data)
    return response.data
  }
}

export const orderService = new OrderService()
export default orderService
