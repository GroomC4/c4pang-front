'use client'

import React, { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { ChevronLeft, CreditCard, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
    paymentMethod: 'card',
    agreeTerms: false
  })

  const [isProcessing, setIsProcessing] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOrder = async () => {
    if (!orderData.name || !orderData.phone || !orderData.address || !orderData.agreeTerms) {
      alert('필수 정보를 모두 입력해주세요.')
      return
    }

    setIsProcessing(true)
    
    // 결제 처리 시뮬레이션
    setTimeout(() => {
      clearCart()
      router.push('/order-complete')
    }, 2000)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pt-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-purple-800 mb-4">장바구니가 비어있습니다</h1>
          <button
            onClick={() => router.push('/products')}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            상품 둘러보기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-purple-800" />
          </button>
          <h1 className="text-3xl font-bold text-purple-800">주문/결제</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            {/* 배송 정보 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">배송 정보</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">받는 분</label>
                  <input
                    type="text"
                    value={orderData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="이름을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                  <input
                    type="tel"
                    value={orderData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="010-0000-0000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                  <input
                    type="text"
                    value={orderData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                    placeholder="기본 주소"
                  />
                  <input
                    type="text"
                    value={orderData.addressDetail}
                    onChange={(e) => handleInputChange('addressDetail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="상세 주소"
                  />
                </div>
              </div>
            </div>

            {/* 결제 방법 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">결제 방법</h2>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={orderData.paymentMethod === 'card'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>신용카드</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={orderData.paymentMethod === 'bank'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>계좌이체</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="kakaopay"
                    checked={orderData.paymentMethod === 'kakaopay'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>카카오페이</span>
                </label>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                  className="mt-1 text-purple-600 focus:ring-purple-500"
                />
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">[필수] 개인정보 수집·이용 동의</span>
                  <p className="mt-1">주문 처리 및 배송을 위해 개인정보 수집·이용에 동의합니다.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">주문 상품</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">{item.brand}</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{item.quantity}개</p>
                      <p className="text-sm font-semibold text-purple-600">{(item.price * item.quantity).toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>상품 금액</span>
                  <span>{totalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>배송비</span>
                  <span>무료</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-lg font-semibold text-purple-800">
                  <span>총 결제 금액</span>
                  <span>{totalPrice.toLocaleString()}원</span>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={isProcessing}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '결제 처리 중...' : `${totalPrice.toLocaleString()}원 결제하기`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}