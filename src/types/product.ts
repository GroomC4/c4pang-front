// Product 관련 타입 정의

export interface Product {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  imageUrl?: string
  thumbnailUrl?: string
  storeId: string
  storeName: string
  categoryId?: string
  categoryName?: string
  stock: number
  isHidden: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductDetail extends Product {
  images: string[]
  fullDescription?: string
}

export interface ProductSearchParams {
  productName?: string
  storeName?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  size?: number
  sort?: string
}

export interface ProductRegisterRequest {
  name: string
  description: string
  price: number
  discountPrice?: number
  stock: number
  categoryId?: string
  images: File[]
}

export interface ProductUpdateRequest {
  name?: string
  description?: string
  price?: number
  discountPrice?: number
  stock?: number
  categoryId?: string
}
