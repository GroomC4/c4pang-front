'use client'

import { CheckoutState } from '@/types/chatbot'
import { CartItem } from '@/types'
import Image from 'next/image'
import { Package, MapPin, CreditCard, X } from 'lucide-react'

interface OrderSummaryProps {
  checkoutState: CheckoutState
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function OrderSummary({ checkoutState, onConfirm, onCancel, isLoading = false }: OrderSummaryProps) {
  const { items, shippingInfo, paymentMethod } = checkoutState

  // 총 금액 계산
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  // 결제 수단 표시 텍스트
  const getPaymentMethodText = () => {
    if (!paymentMethod) return ''
    
    switch (paymentMethod.type) {
      case 'card':
        return '신용/체크카드'
      case 'bank':
        return '계좌이체'
      case 'simple':
        return paymentMethod.provider 
          ? `간편결제 (${getProviderName(paymentMethod.provider)})`
          : '간편결제'
      default:
        return paymentMethod.type
    }
  }

  const getProviderName = (provider: string) => {
    const providerMap: Record<string, string> = {
      'kakaopay': '카카오페이',
      'naverpay': '네이버페이',
      'tosspay': '토스페이',
      'payco': '페이코'
    }
    return providerMap[provider] || provider
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">주문 확인</h3>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          aria-label="취소"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        {/* 상품 목록 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-gray-800">주문 상품 ({totalItems}개)</h4>
          </div>
          <div className="space-y-3">
            {items.map((item: CartItem) => (
              <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-50 to-violet-50">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">{item.brand}</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600">수량: {item.quantity}개</p>
                    <p className="text-sm font-semibold text-purple-600">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 배송지 정보 */}
        {shippingInfo && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-gray-800">배송지 정보</h4>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">수령인</span>
                <span className="text-sm font-medium text-gray-800">{shippingInfo.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">전화번호</span>
                <span className="text-sm font-medium text-gray-800">{shippingInfo.phone}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">주소</span>
                <span className="text-sm font-medium text-gray-800">
                  ({shippingInfo.postalCode}) {shippingInfo.address}
                </span>
                <span className="text-sm font-medium text-gray-800">{shippingInfo.addressDetail}</span>
              </div>
              {shippingInfo.deliveryMessage && (
                <div className="flex flex-col gap-1 pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">배송 요청사항</span>
                  <span className="text-sm text-gray-800">{shippingInfo.deliveryMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 결제 수단 */}
        {paymentMethod && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-gray-800">결제 수단</h4>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-800">{getPaymentMethodText()}</p>
            </div>
          </div>
        )}

        {/* 결제 금액 */}
        <div className="pt-4 border-t-2 border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">상품 금액</span>
              <span className="text-gray-800">{totalAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">배송비</span>
              <span className="text-gray-800">무료</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-800">총 결제 금액</span>
              <span className="text-purple-600">{totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : '결제하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
