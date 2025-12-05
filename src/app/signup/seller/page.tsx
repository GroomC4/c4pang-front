'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import authService from '@/services/auth'
import { storeService } from '@/services/storeService'

export default function SellerSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    defaultAddress: '',
    defaultPhoneNumber: '',
    storeName: '',
    storeDescription: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateStep1 = (): boolean => {
    if (formData.username.length < 2 || formData.username.length > 10) {
      setError('이름은 2-10자 이내로 입력해주세요.')
      return false
    }
    
    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return false
    }
    
    const phoneRegex = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/
    if (!phoneRegex.test(formData.defaultPhoneNumber)) {
      setError('전화번호는 010-0000-0000 형식으로 입력해주세요.')
      return false
    }
    
    return true
  }

  const validateStep2 = (): boolean => {
    if (formData.storeName.trim().length < 2) {
      setError('스토어 이름은 2자 이상 입력해주세요.')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        defaultAddress: formData.defaultAddress,
        defaultPhoneNumber: formData.defaultPhoneNumber
      }
      
      await authService.signup(signupData)
      await authService.login({
        email: formData.email,
        password: formData.password
      })
      
      try {
        await storeService.registerStore({
          name: formData.storeName,
          description: formData.storeDescription || undefined
        })
        
        alert('🎉 판매자 회원가입이 완료되었습니다!\n\n✅ 계정 생성 완료\n✅ 스토어 생성 완료')
        router.push('/seller/dashboard')
      } catch (storeError: any) {
        alert('✅ 회원가입이 완료되었습니다!\n\n⚠️ 스토어 등록은 실패했습니다.\n대시보드에서 다시 시도해주세요.')
        router.push('/seller/dashboard')
      }
      
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">판매자 회원가입</h1>
          <p className="text-gray-600">C4ang에서 스토어를 운영해보세요</p>
          
          <div className="flex items-center justify-center mt-6 gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>2</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {step === 1 ? '기본 정보 입력' : '스토어 정보 입력'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="이름 (2-10자)"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="이메일"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="8자 이상"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="비밀번호 재입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input
                  type="tel"
                  name="defaultPhoneNumber"
                  value={formData.defaultPhoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                <input
                  type="text"
                  name="defaultAddress"
                  value={formData.defaultAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="사업장 주소"
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                다음 단계
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  스토어 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="스토어 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  스토어 설명
                </label>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="스토어에 대한 설명을 입력하세요 (선택사항)"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 font-medium py-3 px-4 rounded-lg transition duration-200 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isSubmitting ? '가입 중...' : '가입 완료'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
