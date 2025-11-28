import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

class ApiService {
  private axiosInstance: AxiosInstance

  constructor() {
    console.log('ApiService constructor - API_BASE_URL:', API_BASE_URL)
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = this.getRefreshToken()
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken)
              this.setTokens(response.accessToken, response.refreshToken)
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.accessToken}`
              }
              
              return this.axiosInstance(originalRequest)
            }
          } catch (refreshError) {
            this.clearTokens()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  private async refreshAccessToken(refreshToken: string) {
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
      refreshToken
    })
    return response.data
  }

  get instance() {
    return this.axiosInstance
  }

  setAuthTokens(accessToken: string, refreshToken: string) {
    this.setTokens(accessToken, refreshToken)
  }

  logout() {
    this.clearTokens()
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  getUserId(): string | null {
    const token = this.getAccessToken()
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.sub || payload.userId || null
    } catch {
      return null
    }
  }
}

export const apiService = new ApiService()
export default apiService