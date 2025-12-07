'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { productService } from '@/services'
import type { Product } from '@/types/product'
import type { PaginatedResponse } from '@/types/api'

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '')

  useEffect(() => {
    fetchProducts()
  }, [searchParams])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const keyword = searchParams.get('keyword') || ''
      const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
      const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
      const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0

      const response: PaginatedResponse<Product> = await productService.searchProducts({
        productName: keyword,
        minPrice,
        maxPrice,
        page,
        size: 20
      })

      setProducts(response.content)
      setPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      })
    } catch (error) {
      console.error('상품 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchKeyword) params.set('keyword', searchKeyword)
    router.push(`/products?${params.toString()}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
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
              <Link href="/cart" className="text-gray-700 hover:text-indigo-600">
                장바구니
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-indigo-600">
                로그인
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="상품명, 스토어명으로 검색"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              검색
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Info */}
        {pagination && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              총 <span className="font-semibold text-indigo-600">{pagination.totalElements}</span>개의 상품
            </p>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>최신순</option>
              <option>가격 낮은순</option>
              <option>가격 높은순</option>
              <option>인기순</option>
            </select>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition group"
              >
                <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.storeName}</p>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <>
                        <span className="text-lg font-bold text-indigo-600">
                          {formatPrice(product.discountPrice)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  {product.stock !== undefined && (
                    <p className="text-xs text-gray-500 mt-2">
                      재고: {product.stock > 0 ? `${product.stock}개` : '품절'}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600">다른 검색어로 시도해보세요</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', i.toString())
                  router.push(`/products?${params.toString()}`)
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  i === pagination.currentPage
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
