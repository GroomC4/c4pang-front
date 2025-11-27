'use client'

import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

export default function CartPage() {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart()
  const router = useRouter()

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-purple-800 mb-12">장바구니</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-xl font-semibold text-gray-600 mb-4">장바구니가 비어있어요</h2>
            <p className="text-gray-500 mb-8">마음에 드는 향수를 담아보세요!</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
            >
              상품 둘러보기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-800">장바구니</h1>
          <button
            onClick={clearCart}
            className="text-gray-500 hover:text-red-500 transition-colors text-sm"
          >
            전체 삭제
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
                    <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-purple-600 font-bold">{item.price.toLocaleString()}원</p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">주문 요약</h2>
              
              <div className="space-y-3 mb-6">
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
                onClick={handleCheckout}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                주문하기
              </button>

              <button
                onClick={() => router.push('/products')}
                className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                쇼핑 계속하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}