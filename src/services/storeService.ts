import { apiService } from './api'
import type { Store, StoreRegisterRequest, StoreUpdateRequest } from '@/types/store'

class StoreService {
  private readonly BASE_PATH = '/api/v1/stores'

  /**
   * 스토어 상세 조회
   * 인증 불필요 (누구나 조회 가능)
   */
  async getStoreById(storeId: string, includeRating: boolean = false): Promise<Store> {
    const response = await apiService.instance.get(`${this.BASE_PATH}/${storeId}`, {
      params: { include_rating: includeRating }
    })
    return response.data
  }

  /**
   * 내 스토어 조회
   * 인증 필요 (Owner)
   */
  async getMyStore(): Promise<Store> {
    const response = await apiService.instance.get(`${this.BASE_PATH}/mine`)
    return response.data
  }

  /**
   * 스토어 등록
   * 인증 필요 (승인된 사용자)
   */
  async registerStore(data: StoreRegisterRequest): Promise<Store> {
    const response = await apiService.instance.post(this.BASE_PATH, data)
    return response.data
  }

  /**
   * 스토어 정보 수정
   * 인증 필요 (Owner, 본인 스토어만)
   */
  async updateStore(storeId: string, data: StoreUpdateRequest): Promise<Store> {
    const response = await apiService.instance.patch(`${this.BASE_PATH}/${storeId}`, data)
    return response.data
  }

  /**
   * 스토어 삭제 (소프트 삭제)
   * 인증 필요 (Owner, 본인 스토어만)
   * cascade로 연관 데이터 삭제
   */
  async deleteStore(storeId: string): Promise<void> {
    await apiService.instance.delete(`${this.BASE_PATH}/${storeId}`)
  }
}

export const storeService = new StoreService()
export default storeService
