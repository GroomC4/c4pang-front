'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import Chatbot from '@/components/chatbot/Chatbot'
import { Cart } from '@/components/cart/Cart'
import { useCart } from '@/contexts/CartContext'
import { User } from '@/types'

export default function Home() {
  // 임시로 user를 null로 설정하여 로그인되지 않은 상태로 표시
  const user: User | null = null
  const { 
    items, 
    totalPrice, 
    totalItems, 
    isCartOpen, 
    openCart, 
    closeCart, 
    updateQuantity, 
    removeItem 
  } = useCart()

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <Header 
        user={user} 
        cartItemCount={totalItems}
        onCartClick={openCart}
      />

      <div className="flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-purple-700 mb-6">
            C4pang
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            20대 여성을 위한 향수 이커머스 플랫폼
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            당신만의 시그니처 향수를 찾아보세요. 
            개인 맞춤형 추천과 전문가 리뷰로 완벽한 향수를 만나보실 수 있습니다.
          </p>

          {!user && (
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link href="/products">
                <button className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-200 shadow-lg hover:shadow-xl">
                  향수 둘러보기
                </button>
              </Link>
              <Link href="/signup">
                <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-purple-600 font-bold py-4 px-8 rounded-lg border-2 border-purple-300 text-lg transition duration-200">
                  회원가입
                </button>
              </Link>
            </div>
          )}

        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">맞춤형 추천</h3>
            <p className="text-gray-600 text-sm">
              AI가 당신의 취향을 분석하여 완벽한 향수를 추천해드립니다.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">프리미엄 브랜드</h3>
            <p className="text-gray-600 text-sm">
              전 세계 유명 브랜드의 정품 향수를 합리적인 가격에 만나보세요.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">안전한 배송</h3>
            <p className="text-gray-600 text-sm">
              신속하고 안전한 배송으로 소중한 향수를 완벽하게 보호합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 챗봇 */}
      <Chatbot />
      
      {/* 장바구니 */}
      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        totalPrice={totalPrice}
      />
    </main>
  )
}