// Auth 관련 타입 정의

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userId: string
  email: string
  role: UserRole
}

// 고객 회원가입 요청
export interface CustomerSignupRequest {
  username: string
  email: string
  password: string
  defaultAddress: string
  defaultPhoneNumber: string
}

// 판매자 회원가입 요청
export interface OwnerSignupRequest {
  username: string
  email: string
  password: string
  phoneNumber: string
}

// 공통 회원가입 요청 (호환성)
export interface SignupRequest {
  email: string
  password: string
  name: string
  phone: string
  address: {
    zipCode: string
    address: string
    addressDetail: string
  }
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}
