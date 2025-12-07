'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { orderService } from '@/services'
import type { Order, OrderStatus } from '@/types/order'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getMyOrders()
      setOrders(response.content)
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

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('주문을 취소하시겠습니까?')) return

    try {
      await orderService.cancelOrder(orderId)
      alert('주문이 취소되었습니다.')
      fetchOrders()
    } catch (error: any) {
      alert(error.response?.data?.error?.message || '주문 취소에 실패했습니다.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      PENDING: { label: '결제대기', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '주문확인', color: 'bg-blue-100 text-blue-800' },
      SHIPPING: { label: '배송중', color: 'bg-indigo-100 text-indigo-800' },
      DELIVERED: { label: '배송완료', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: '취소됨', color: 'bg-gray-100 text-gray-800' },
      REFUNDED: { label: '환불완료', color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status] || statusConfig.PENDING
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const canCancel = (status: OrderStatus) => {
    return status === 'PENDING' || status === 'CONFIRMED'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              C4ang
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/products" className="text-gray-700 hover:text-indigo-600">
                상품
              </Link>
              <Link href="/orders" className="text-indigo-600 font-semibold">
                주문내역
              </Link>
              <Link href="/cart" className="text-gray-700 hover:text-indigo-600">
                장바구니
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">주문 내역</h1>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        주문일: {formatDate(order.createdAt)}
                      </span>
                      <span className="text-sm text-gray-400">|</span>
                      <span className="text-sm text-gray-600">
                        주문번호: {order.orderId}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.orderItemId} className="flex items-center gap-4">
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

                  {/* Shipping Address */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">배송지 정보</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.recipientName} ({order.shippingAddress.recipientPhone})
                    </p>
                    <p className="text-sm text-gray-600">
                      [{order.shippingAddress.zipCode}] {order.shippingAddress.address} {order.shippingAddress.addressDetail}
                    </p>
                  </div>

                  {/* Total & Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">총 결제금액: </span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/orders/${order.orderId}`}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        상세보기
                      </Link>
                      {canCancel(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          주문취소
                        </button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <button
                          onClick={() => router.push(`/orders/${order.orderId}/refund`)}
                          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                          반품/환불
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              주문 내역이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">첫 주문을 시작해보세요!</p>
            <Link
              href="/products"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              상품 둘러보기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
