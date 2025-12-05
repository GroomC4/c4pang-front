'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'

export default function SignupPage() {
  const { signup, isAuthenticated, isLoading, error } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    defaultAddress: '',
    defaultPhoneNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setSignupError(null)
    
    if (name === 'confirmPassword' || name === 'password') {
      setPasswordError(null)
    }
  }

  const validateForm = (): boolean => {
    // 이름 검증 (한글만 허용, 2-10자)
    const koreanNameRegex = /^[가-힣]+$/
    if (!koreanNameRegex.test(formData.username)) {
      setSignupError('이름은 한글만 입력 가능합니다.')
      return false
    }
    if (formData.username.length < 2 || formData.username.length > 10) {
      setSignupError('이름은 2-10자 이내로 입력해주세요.')
      return false
    }
    
    // 전화번호 검증 (010-XXXX-XXXX 형식)
    const phoneRegex = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/
    if (!phoneRegex.test(formData.defaultPhoneNumber)) {
      setSignupError('전화번호는 010-0000-0000 형식으로 입력해주세요.')
      return false
    }
    
    // 비밀번호 검증
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.')
      return false
    }
    
    if (formData.password.length < 8) {
      setPasswordError('비밀번호는 8자 이상이어야 합니다.')
      return false
    }
    
    // 주소 검증
    if (formData.defaultAddress.trim().length === 0) {
      setSignupError('주소를 입력해주세요.')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSignupError(null)
    setPasswordError(null)

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        defaultAddress: formData.defaultAddress,
        defaultPhoneNumber: formData.defaultPhoneNumber
      }
      
      await signup(signupData)
      
      // 회원가입 성공 알림
      alert('🎉 회원가입이 완료되었습니다! 자동으로 로그인되었습니다.')
      
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (err) {
      console.error('Signup error:', err)
      setSignupError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">C4ang 회원가입</h1>
          <p className="text-gray-600">향수의 세계로 여행을 시작해보세요</p>
        </div>

        {(error || signupError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{signupError || error?.message}</p>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{passwordError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
              placeholder="한글 이름을 입력하세요 (2-10자)"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
              placeholder="8자 이상의 비밀번호를 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="defaultPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              전화번호
            </label>
            <input
              type="tel"
              id="defaultPhoneNumber"
              name="defaultPhoneNumber"
              value={formData.defaultPhoneNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
              placeholder="010-1234-5678"
            />
          </div>

          <div>
            <label htmlFor="defaultAddress" className="block text-sm font-medium text-gray-700 mb-1">
              주소
            </label>
            <input
              type="text"
              id="defaultAddress"
              name="defaultAddress"
              value={formData.defaultAddress}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
              placeholder="기본 배송지 주소를 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            {isSubmitting ? '회원가입 중...' : '회원가입'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">이미 계정이 있으신가요?</span>
            </div>
          </div>

          <Link href="/login" className="w-full">
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-50 text-primary-600 font-medium py-3 px-4 rounded-lg border border-primary-300 transition duration-200"
            >
              로그인
            </button>
          </Link>
        </form>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">회원가입 혜택</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 개인 맞춤형 향수 추천</li>
            <li>• 신제품 및 할인 정보 우선 제공</li>
            <li>• 포인트 적립 및 리워드 혜택</li>
            <li>• 향수 리뷰 및 평점 참여</li>
          </ul>
        </div>

        <div className="mt-4 bg-indigo-50 rounded-lg p-4">
          <h3 className="font-medium text-indigo-800 mb-2">🏪 판매자이신가요?</h3>
          <p className="text-sm text-indigo-700 mb-3">
            C4ang에서 스토어를 운영하고 상품을 판매해보세요!
          </p>
          <Link href="/signup/seller">
            <button
              type="button"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-sm"
            >
              판매자로 가입하기
            </button>
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          회원가입 시 <Link href="#" className="underline">이용약관</Link>,{' '}
          <Link href="#" className="underline">개인정보처리방침</Link> 및{' '}
          <Link href="#" className="underline">마케팅 정보 수신</Link>에 동의하는 것으로 간주됩니다.
        </div>
      </div>
    </div>
  )
}