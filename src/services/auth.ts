import apiService from './api'

export interface SignupRequest {
  username: string
  email: string
  password: string
  defaultAddress: string
  defaultPhoneNumber: string
}

export interface SignupResponse {
  userId: string
  username: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

class AuthService {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    console.log('AuthService.signup - URL:', apiService.instance.defaults.baseURL + '/api/v1/auth/customers/signup')
    console.log('AuthService.signup - Data:', data)
    const response = await apiService.instance.post('/api/v1/auth/customers/signup', data)
    console.log('AuthService.signup - Response:', response.data)
    return response.data
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.instance.post('/api/v1/auth/customers/login', data)
    
    if (response.data.accessToken && response.data.refreshToken) {
      apiService.setAuthTokens(response.data.accessToken, response.data.refreshToken)
    }
    
    return response.data
  }

  async logout(): Promise<void> {
    try {
      const userId = apiService.getUserId()
      if (userId) {
        await apiService.instance.post('/api/v1/auth/customers/logout', {}, {
          headers: {
            'X-User-Id': userId
          }
        })
      }
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      apiService.logout()
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiService.instance.post('/api/v1/auth/refresh', {
      refreshToken
    })
    
    if (response.data.accessToken && response.data.refreshToken) {
      apiService.setAuthTokens(response.data.accessToken, response.data.refreshToken)
    }
    
    return response.data
  }

  isAuthenticated(): boolean {
    return apiService.isAuthenticated()
  }

  getCurrentUserId(): string | null {
    return apiService.getUserId()
  }
}

export const authService = new AuthService()
export default authService