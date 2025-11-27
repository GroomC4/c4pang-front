'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Crown, TrendingUp } from 'lucide-react'
import { bestSellers } from '@/data/mockData'
import { useCart } from '@/contexts/CartContext'

const BestSellersSection: React.FC = () => {
  const { addItem } = useCart()

  const handleAddToCart = (product: typeof bestSellers[0]) => {
    addItem(product)
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center mb-6">
            <Crown className="w-6 h-6 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
              Best Sellers
            </span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            가장 사랑받는 향수
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            수많은 고객들이 선택한 베스트셀러 향수를 만나보세요
          </p>
        </motion.div>

        {/* Best Sellers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map((product, index) => (
            <motion.div
              key={product.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                  product.rank === 1 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                    : product.rank === 2
                    ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
                    : product.rank === 3
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
                    : 'bg-gradient-to-r from-purple-400 to-purple-600 text-white'
                }`}>
                  #{product.rank}
                </div>
              </div>

              {/* Sales Count Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {product.salesCount}
                </div>
              </div>

              {/* Product Image */}
              <div className="aspect-[4/5] bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl">💎</span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6"
                >
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-white text-gray-800 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    장바구니
                  </button>
                </motion.div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-sm text-gray-500 font-medium">{product.brand}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Notes */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.notes.slice(0, 2).map((note, noteIndex) => (
                    <span
                      key={noteIndex}
                      className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full border border-purple-100"
                    >
                      {note}
                    </span>
                  ))}
                  {product.notes.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                      +{product.notes.length - 2}
                    </span>
                  )}
                </div>

                {/* Price and Category */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-purple-600">
                    {product.price.toLocaleString()}원
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    {product.category}
                  </span>
                </div>

                {/* Best Seller Indicator */}
                <motion.div
                  className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-semibold">베스트셀러</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            모든 상품 보기
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default BestSellersSection