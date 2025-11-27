'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Package, Home } from 'lucide-react'

export default function OrderCompletePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pt-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">주문이 완료되었습니다!</h1>
          <p className="text-gray-600 mb-8">
            소중한 주문 감사드립니다.<br />
            주문하신 상품을 빠르게 준비하여 배송해드리겠습니다.
          </p>

          <div className="bg-purple-50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-purple-800">배송 안내</h2>
            </div>
            <div className="text-left space-y-2 text-sm text-gray-600">
              <p>• 주문 확인: 주문 후 24시간 이내</p>
              <p>• 배송 기간: 2-3일 (영업일 기준)</p>
              <p>• 배송비: 무료</p>
              <p>• 배송 조회: 주문 확인 후 SMS로 송장번호 발송</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/products')}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              다른 상품 보기
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              홈으로 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}