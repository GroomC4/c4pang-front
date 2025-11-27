import axios from 'axios'

// API 기본 설정
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 요청 로깅
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    
    // 인증 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 응답 로깅
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('Response Error:', error)
    
    // 공통 에러 처리
    if (error.response?.status === 401) {
      // 인증 만료 시 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api