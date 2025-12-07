'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { orderService } from '@/services'
import type { Order, OrderStatus } from '@/types/order'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrderById(orderId)
      setOrder(data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        console.error('주문 조회 실패:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('주문을 취소하시겠습니까?')) return

    try {
      await orderService.cancelOrder(orderId)
      alert('주문이 취소되었습니다.')
      fetchOrder()
    } catch (error: any) {
      alert(error.response?.data?.error?.message || '주문 취소에 실패했습니다.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: OrderStatus) => {
    const statusConfig = {
      PENDING: { label: '결제대기', color: 'text-yellow-600', icon: '⏳' },
      CONFIRMED: { label: '주문확인', color: 'text-blue-600', icon: '✓' },
      SHIPPING: { label: '배송중', color: 'text-indigo-600', icon: '🚚' },
      DELIVERED: { label: '배송완료', color: 'text-green-600', icon: '✓' },
      CANCELLED: { label: '취소됨', color: 'text-gray-600', icon: '✕' },
      REFUNDED: { label: '환불완료', color: 'text-red-600', icon: '↩' }
    }
    return statusConfig[status] || statusConfig.PENDING
  }

  const canCancel = (status: OrderStatus) => {
    return status === 'PENDING' || status === 'CONFIRMED'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">주문을 찾을 수 없습니다</h2>
          <Link href="/orders" className="text-indigo-600 hover:underline">
            주문 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              C4ang
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-indigo-600">
              ← 주문 목록
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{statusInfo.icon}</div>
            <h1 className={`text-3xl font-bold ${statusInfo.color} mb-2`}>
              {statusInfo.label}
            </h1>
            <p className="text-gray-600">주문번호: {order.orderId}</p>
          </div>

          {/* Order Timeline */}
          <div className="flex justify-between items-center mb-8 relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
            {['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'].map((status, index) => {
              const isActive = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'].indexOf(order.status) >= index
              return (
                <div key={status} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isActive ? '✓' : index + 1}
                  </div>
                  <span className="text-xs text-gray-600 mt-2">
                    {getStatusInfo(status as OrderStatus).label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">주문일시:</span>
              <span className="ml-2 font-medium">{formatDate(order.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-600">최종 수정:</span>
              <span className="ml-2 font-medium">{formatDate(order.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">주문 상품</h2>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.orderItemId} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  📦
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                  <p className="text-sm text-gray-600">
                    {formatPrice(item.price)} × {item.quantity}개
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">배송지 정보</h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="w-24 text-gray-600">수취인:</span>
              <span className="font-medium">{order.shippingAddress.recipientName}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-600">연락처:</span>
              <span className="font-medium">{order.shippingAddress.recipientPhone}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-600">주소:</span>
              <div>
                <p className="font-medium">[{order.shippingAddress.zipCode}]</p>
                <p className="font-medium">{order.shippingAddress.address}</p>
                <p className="font-medium">{order.shippingAddress.addressDetail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">결제 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">상품 금액</span>
              <span className="font-medium">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">배송비</span>
              <span className="font-medium text-green-600">무료</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="text-lg font-bold text-gray-900">총 결제금액</span>
              <span className="text-2xl font-bold text-indigo-600">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {canCancel(order.status) && (
            <button
              onClick={handleCancelOrder}
              className="flex-1 py-4 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
            >
              주문 취소
            </button>
          )}
          {order.status === 'DELIVERED' && (
            <button
              onClick={() => router.push(`/orders/${order.orderId}/refund`)}
              className="flex-1 py-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              반품/환불 신청
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
