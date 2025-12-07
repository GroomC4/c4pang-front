// API 공통 타입 정의

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
