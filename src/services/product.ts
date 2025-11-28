import apiService from './api'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  categoryId: string
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductListResponse {
  content: Product[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  categoryId: string
  stock: number
  imageUrl?: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  categoryId?: string
  stock?: number
  imageUrl?: string
  isActive?: boolean
}

class ProductService {
  async getProducts(page = 0, size = 20): Promise<ProductListResponse> {
    const response = await apiService.instance.get('/api/v1/products', {
      params: { page, size }
    })
    return response.data
  }

  async getProduct(id: string): Promise<Product> {
    const response = await apiService.instance.get(`/api/v1/products/${id}`)
    return response.data
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await apiService.instance.post('/api/v1/products', data)
    return response.data
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await apiService.instance.put(`/api/v1/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: string): Promise<void> {
    await apiService.instance.delete(`/api/v1/products/${id}`)
  }

  async searchProducts(query: string, page = 0, size = 20): Promise<ProductListResponse> {
    const response = await apiService.instance.get('/api/v1/products/search', {
      params: { query, page, size }
    })
    return response.data
  }

  async getProductsByCategory(categoryId: string, page = 0, size = 20): Promise<ProductListResponse> {
    const response = await apiService.instance.get('/api/v1/products/category', {
      params: { categoryId, page, size }
    })
    return response.data
  }
}

export const productService = new ProductService()
export default productService