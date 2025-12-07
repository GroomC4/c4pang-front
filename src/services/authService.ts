import { apiService } from './api'
import type { 
  LoginRequest, 
  LoginResponse, 
  CustomerSignupRequest,
  OwnerSignupRequest,
  RefreshTokenRequest,
  RefreshTokenResponse 
} from '@/types/auth'

class AuthService {
  // Customer 서비스가 /api/v1/auth 엔드포인트를 제공하므로 직접 사용
  private readonly CUSTOMER_AUTH_PATH = '/api/v1/auth/customers'
  private readonly OWNER_AUTH_PATH = '/api/v1/auth/owners'
  private readonly REFRESH_PATH = '/api/v1/auth/refresh'

  /**
   * 일반 고객 회원가입
   */
  async signupCustomer(data: CustomerSignupRequest): Promise<void> {
    await apiService.instance.post(`${this.CUSTOMER_AUTH_PATH}/signup`, data)
  }

  /**
   * 판매자 회원가입
   */
  async signupOwner(data: OwnerSignupRequest): Promise<void> {
    await apiService.instance.post(`${this.OWNER_AUTH_PATH}/signup`, data)
  }

  /**
   * 일반 고객 로그인
   */
  async loginCustomer(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.instance.post(`${this.CUSTOMER_AUTH_PATH}/login`, data)
    const loginData = response.data
    
    // 토큰 저장
    apiService.setAuthTokens(loginData.accessToken, loginData.refreshToken)
    
    return loginData
  }

  /**
   * 판매자 로그인
   */
  async loginOwner(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.instance.post(`${this.OWNER_AUTH_PATH}/login`, data)
    const loginData = response.data
    
    // 토큰 저장
    apiService.setAuthTokens(loginData.accessToken, loginData.refreshToken)
    
    return loginData
  }

  /**
   * 일반 고객 로그아웃
   */
  async logoutCustomer(): Promise<void> {
    await apiService.instance.post(`${this.CUSTOMER_AUTH_PATH}/logout`)
    apiService.logout()
  }

  /**
   * 판매자 로그아웃
   */
  async logoutOwner(): Promise<void> {
    await apiService.instance.post(`${this.OWNER_AUTH_PATH}/logout`)
    apiService.logout()
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiService.instance.post(this.REFRESH_PATH, {
      refreshToken
    })
    const tokenData = response.data
    
    // 새 토큰 저장
    apiService.setAuthTokens(tokenData.accessToken, tokenData.refreshToken)
    
    return tokenData
  }

  /**
   * 현재 로그인 상태 확인
   */
  isAuthenticated(): boolean {
    return apiService.isAuthenticated()
  }

  /**
   * 현재 사용자 ID 가져오기
   */
  getUserId(): string | null {
    return apiService.getUserId()
  }
}

export const authService = new AuthService()
export default authService
