import { apiService } from './api'
import type { 
  Product, 
  ProductDetail, 
  ProductSearchParams, 
  ProductRegisterRequest,
  ProductUpdateRequest 
} from '@/types/product'
import type { PaginatedResponse } from '@/types/api'

class ProductService {
  private readonly BASE_PATH = '/api/v1/products'

  /**
   * 상품 목록 조회 및 검색
   * 숨김 처리된 상품은 제외됨
   */
  async searchProducts(params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    const response = await apiService.instance.get(this.BASE_PATH, { params })
    return response.data
  }

  /**
   * 상품 상세 조회
   */
  async getProductById(productId: string): Promise<ProductDetail> {
    const response = await apiService.instance.get(`${this.BASE_PATH}/${productId}`)
    return response.data
  }

  /**
   * 판매자 본인 상품 목록 조회
   * 인증 필요 (Owner)
   */
  async getMyProducts(params?: { page?: number; size?: number }): Promise<PaginatedResponse<Product>> {
    const response = await apiService.instance.get(`${this.BASE_PATH}/owner`, { params })
    return response.data
  }

  /**
   * 상품 등록
   * 인증 필요 (Owner)
   */
  async registerProduct(data: ProductRegisterRequest): Promise<Product> {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('price', data.price.toString())
    if (data.discountPrice) {
      formData.append('discountPrice', data.discountPrice.toString())
    }
    formData.append('stock', data.stock.toString())
    if (data.categoryId) {
      formData.append('categoryId', data.categoryId)
    }
    
    // 이미지 파일 추가
    data.images.forEach((image) => {
      formData.append('images', image)
    })

    const response = await apiService.instance.post(`${this.BASE_PATH}/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  /**
   * 상품 수정
   * 인증 필요 (Owner, 본인 상품만)
   */
  async updateProduct(productId: string, data: ProductUpdateRequest): Promise<Product> {
    const response = await apiService.instance.patch(`${this.BASE_PATH}/${productId}`, data)
    return response.data
  }

  /**
   * 상품 삭제
   * 인증 필요 (Owner, 본인 상품만)
   */
  async deleteProduct(productId: string): Promise<void> {
    await apiService.instance.delete(`${this.BASE_PATH}/${productId}`)
  }

  /**
   * 상품 숨김/복원 처리
   * 인증 필요 (Owner, 본인 상품만)
   */
  async toggleProductVisibility(productId: string): Promise<Product> {
    const response = await apiService.instance.patch(`${this.BASE_PATH}/${productId}/hide`)
    return response.data
  }

  /**
   * 상품 이미지 업로드
   */
  async uploadProductImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiService.instance.post(`${this.BASE_PATH}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

export const productService = new ProductService()
export default productService
