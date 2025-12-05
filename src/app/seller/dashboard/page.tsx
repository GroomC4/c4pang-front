'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { storeService, Store } from '@/services/storeService'
import { useAuth } from '@/contexts/AuthContext'

export default function SellerDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated) {
      fetchMyStore()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchMyStore = async () => {
    try {
      setLoading(true)
      const myStore = await storeService.getMyStore()
      setStore(myStore)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('등록된 스토어가 없습니다.')
      } else {
        setError('스토어 정보를 불러오는데 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                C4ang
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">판매자 센터</span>
            </div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              쇼핑몰로 이동
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              스토어가 없습니다
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/seller/store/register"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              스토어 등록하기
            </Link>
          </div>
        ) : store ? (
          <>
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {store.name}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {store.description || '스토어 설명이 없습니다.'}
                    </p>
                  </div>
                  <Link
                    href="/seller/store/edit"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
                  >
                    스토어 정보 수정
                  </Link>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">0</p>
                  <p className="text-sm text-gray-500">등록 상품</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-sm text-gray-500">신규 주문</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-500">이번 달 매출</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">-</p>
                  <p className="text-sm text-gray-500">평균 평점</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">📦</div>
                <h3 className="font-semibold text-gray-800">상품 관리</h3>
                <p className="text-sm text-gray-500 mt-1">
                  상품 등록, 수정, 삭제
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">➕</div>
                <h3 className="font-semibold text-gray-800">상품 등록</h3>
                <p className="text-sm text-gray-500 mt-1">
                  새 상품 등록하기
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-800">주문 관리</h3>
                <p className="text-sm text-gray-500 mt-1">
                  주문 확인 및 처리
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="font-semibold text-gray-800">리뷰 관리</h3>
                <p className="text-sm text-gray-500 mt-1">
                  고객 리뷰 확인
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
