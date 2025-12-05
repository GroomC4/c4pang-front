import { apiService } from './api'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  storeId?: string
  storeName?: string
  imageUrl?: string
  stock?: number
  isAvailable?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProductListResponse {
  content: Product[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

class ProductService {
  private readonly BASE_PATH = '/api/v1/products'

  async getAllProducts(params?: {
    page?: number
    size?: number
    sortBy?: string
    sortOrder?: string
  }): Promise<ProductListResponse> {
    const response = await apiService.instance.get(this.BASE_PATH, { params })
    return response.data
  }

  async getProductById(productId: string): Promise<Product> {
    const response = await apiService.instance.get(`${this.BASE_PATH}/${productId}`)
    return response.data
  }

  async searchProducts(keyword: string, params?: {
    page?: number
    size?: number
  }): Promise<ProductListResponse> {
    const response = await apiService.instance.get(this.BASE_PATH, {
      params: { productName: keyword, ...params }
    })
    return response.data
  }
}

export const productService = new ProductService()
export default productService
