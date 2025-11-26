'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const { user, error, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) return <div>로딩 중...</div>
  if (error) {
    console.warn('Auth0 오류 (개발 모드):', error.message)
    // 개발 모드에서는 Auth0 오류를 무시하고 계속 진행
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">퍼퓸퀸</h1>
          <p className="text-gray-600">향수로 당신만의 스타일을 완성하세요</p>
        </div>

        <div className="space-y-4">
          <Link href="/api/auth/login" className="w-full">
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
              로그인
            </button>
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <Link href="/signup" className="w-full">
            <button className="w-full bg-white hover:bg-gray-50 text-primary-600 font-medium py-3 px-4 rounded-lg border border-primary-300 transition duration-200">
              회원가입
            </button>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-primary-600 transition duration-200">
            비밀번호를 잊으셨나요?
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          로그인하면 <Link href="#" className="underline">이용약관</Link>과{' '}
          <Link href="#" className="underline">개인정보처리방침</Link>에 동의하는 것으로 간주됩니다.
        </div>
      </div>
    </div>
  )
}