'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { productService } from '@/services'
import type { ProductDetail } from '@/types/product'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const data = await productService.getProductById(productId)
      setProduct(data)
    } catch (error) {
      console.error('상품 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const handleAddToCart = () => {
    // TODO: 장바구니 추가 로직
    alert(`${product?.name} ${quantity}개를 장바구니에 담았습니다.`)
  }

  const handleBuyNow = () => {
    // TODO: 바로 구매 로직
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">상품을 찾을 수 없습니다</h2>
          <Link href="/products" className="text-indigo-600 hover:underline">
            상품 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images || [product.imageUrl].filter(Boolean)
  const currentPrice = product.discountPrice && product.discountPrice < product.price 
    ? product.discountPrice 
    : product.price
  const discountRate = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

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
              <Link href="/cart" className="text-gray-700 hover:text-indigo-600">
                장바구니
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-9xl">📦</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square bg-gray-200 rounded-lg overflow-hidden ${
                        idx === selectedImage ? 'ring-2 ring-indigo-600' : ''
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <Link href={`/stores/${product.storeId}`} className="text-sm text-indigo-600 hover:underline">
                  {product.storeName}
                </Link>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="mb-6">
                {discountRate > 0 && (
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-red-600">{discountRate}%</span>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                )}
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4 mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">배송비</span>
                  <span className="font-semibold">무료배송</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">재고</span>
                  <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock}개` : '품절'}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수량
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                    disabled={product.stock === 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2"
                    disabled={product.stock === 0}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                    disabled={product.stock === 0}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">총 상품금액</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {formatPrice(currentPrice * quantity)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  장바구니
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  바로구매
                </button>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">상품 상세정보</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {product.description || product.fullDescription || '상품 설명이 없습니다.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
