'use client'

import { OrderInfo } from '@/types/chatbot'
import { CartItem } from '@/types'
import Image from 'next/image'
import { CheckCircle2, Package, Calendar, Truck, MapPin, CreditCard, ShoppingBag, FileText } from 'lucide-react'

interface OrderConfirmationProps {
  order: OrderInfo
  onViewOrder: (orderId: string) => void
  onContinueShopping: () => void
}

export function OrderConfirmation({ order, onViewOrder, onContinueShopping }: OrderConfirmationProps) {
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 결제 수단 표시 텍스트
  const getPaymentMethodText = () => {
    switch (order.paymentMethod.type) {
      case 'card':
        return '신용/체크카드'
      case 'bank':
        return '계좌이체'
      case 'simple':
        return order.paymentMethod.provider 
          ? `간편결제 (${getProviderName(order.paymentMethod.provider)})`
          : '간편결제'
      default:
        return order.paymentMethod.type
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

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* 성공 헤더 */}
      <div className="text-center mb-6 pb-6 border-b border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">주문이 완료되었습니다!</h3>
        <p className="text-sm text-gray-600">
          주문해주셔서 감사합니다. 빠르게 배송해드리겠습니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* 주문 번호 및 날짜 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">주문번호</span>
            </div>
            <p className="text-sm font-bold text-gray-800">{order.orderId}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">주문일자</span>
            </div>
            <p className="text-sm font-bold text-gray-800">{formatDate(order.orderDate)}</p>
          </div>
        </div>

        {/* 배송 예정일 */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">배송 예정일</span>
          </div>
          <p className="text-base font-bold text-gray-800">{formatDate(order.estimatedDelivery)}</p>
          <p className="text-xs text-gray-600 mt-1">영업일 기준 2-3일 소요됩니다</p>
        </div>

        {/* 주문 상품 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-gray-800">주문 상품 ({totalItems}개)</h4>
          </div>
          <div className="space-y-3">
            {order.items.map((item: CartItem) => (
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
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-gray-800">배송지 정보</h4>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">수령인</span>
              <span className="text-sm font-medium text-gray-800">{order.shippingInfo.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">전화번호</span>
              <span className="text-sm font-medium text-gray-800">{order.shippingInfo.phone}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">주소</span>
              <span className="text-sm font-medium text-gray-800">
                ({order.shippingInfo.postalCode}) {order.shippingInfo.address}
              </span>
              <span className="text-sm font-medium text-gray-800">{order.shippingInfo.addressDetail}</span>
            </div>
            {order.shippingInfo.deliveryMessage && (
              <div className="flex flex-col gap-1 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">배송 요청사항</span>
                <span className="text-sm text-gray-800">{order.shippingInfo.deliveryMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* 결제 정보 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-gray-800">결제 정보</h4>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">결제 수단</span>
              <span className="text-sm font-medium text-gray-800">{getPaymentMethodText()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">상품 금액</span>
              <span className="text-sm text-gray-800">{order.totalAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">배송비</span>
              <span className="text-sm text-gray-800">무료</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-800">총 결제 금액</span>
              <span className="text-purple-600">{order.totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => onViewOrder(order.orderId)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>주문 조회</span>
          </button>
          <button
            onClick={onContinueShopping}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>쇼핑 계속하기</span>
          </button>
        </div>
      </div>
    </div>
  )
}
