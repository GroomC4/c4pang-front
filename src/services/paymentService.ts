import { apiService } from './api'
import type { 
  Payment, 
  PaymentCreateRequest,
  PaymentDetail,
  PaymentStatus 
} from '@/types/payment'
import type { PaginatedResponse } from '@/types/api'

class PaymentService {
  private readonly BASE_PATH = '/api/v1/payments'

  /**
   * 결제 요청 생성
   * 인증 필요
   */
  async createPayment(data: PaymentCreateRequest): Promise<Payment> {
    const response = await apiService.instance.post(this.BASE_PATH, data)
    return response.data
  }

  /**
   * 사용자별 결제 목록 조회
   * 인증 필요
   */
  async getMyPayments(params?: { 
    status?: PaymentStatus
    page?: number
    size?: number 
  }): Promise<PaginatedResponse<Payment>> {
    const response = await apiService.instance.get(this.BASE_PATH, { params })
    return response.data
  }

  /**
   * 결제 상세 조회
   * 인증 필요 (본인 결제만)
   */
  async getPaymentById(paymentId: string, includeHistory: boolean = false): Promise<PaymentDetail> {
    const response = await apiService.instance.get(`${this.BASE_PATH}/${paymentId}`, {
      params: { include_history: includeHistory }
    })
    return response.data
  }

  /**
   * 결제 완료 처리 (콜백)
   * 결제 게이트웨이에서 호출
   */
  async completePayment(paymentId: string): Promise<Payment> {
    const response = await apiService.instance.post(`${this.BASE_PATH}/${paymentId}/complete`, {
      status: 'COMPLETED'
    })
    return response.data
  }

  /**
   * 결제 취소
   * 인증 필요 (배송 전)
   */
  async cancelPayment(paymentId: string): Promise<Payment> {
    const response = await apiService.instance.post(`${this.BASE_PATH}/${paymentId}/cancel`, {
      status: 'CANCELLED'
    })
    return response.data
  }
}

export const paymentService = new PaymentService()
export default paymentService
