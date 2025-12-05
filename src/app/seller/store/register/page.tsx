'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { storeService } from '@/services/storeService'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterStorePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.name.trim().length < 2) {
      setError('스토어 이름은 2자 이상 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await storeService.registerStore({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      })
      alert('🎉 스토어가 등록되었습니다!')
      router.push('/seller/dashboard')
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('스토어 등록 권한이 없습니다.')
      } else if (err.response?.status === 500) {
        setError('서버 오류가 발생했습니다.\nCustomer Service와 Store Service가 실행 중인지 확인하세요.')
      } else {
        setError(err.message || '스토어 등록에 실패했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏪</div>
            <h1 className="text-2xl font-bold text-gray-900">스토어 등록</h1>
            <p className="text-gray-600 mt-2">
              나만의 스토어를 만들어보세요
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스토어 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="스토어 이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스토어 설명
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="스토어에 대한 설명을 입력하세요 (선택사항)"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-medium py-3 px-4 rounded-lg transition duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSubmitting ? '등록 중...' : '스토어 등록'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/seller/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← 대시보드로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
