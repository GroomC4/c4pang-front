import { apiService } from './api'

export interface Store {
  id: string
  name: string
  description?: string
  ownerUserId?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface RegisterStoreRequest {
  name: string
  description?: string
}

export interface UpdateStoreRequest {
  name?: string
  description?: string
}

class StoreService {
  private readonly BASE_PATH = '/api/v1/stores'

  async getStoreById(storeId: string): Promise<Store> {
    const response = await apiService.instance.get(`${this.BASE_PATH}/${storeId}`)
    return response.data
  }

  async getMyStore(): Promise<Store> {
    const response = await apiService.instance.get(`${this.BASE_PATH}/mine`)
    return response.data
  }

  async registerStore(data: RegisterStoreRequest): Promise<Store> {
    const response = await apiService.instance.post(this.BASE_PATH, data)
    return response.data
  }

  async updateStore(storeId: string, data: UpdateStoreRequest): Promise<Store> {
    const response = await apiService.instance.patch(`${this.BASE_PATH}/${storeId}`, data)
    return response.data
  }

  async deleteStore(storeId: string): Promise<void> {
    await apiService.instance.delete(`${this.BASE_PATH}/${storeId}`)
  }
}

export const storeService = new StoreService()
export default storeService
