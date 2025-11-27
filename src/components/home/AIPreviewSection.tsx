'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Sparkles, MessageSquare } from 'lucide-react'
import { previewRecommendations } from '@/data/mockData'
import { useCart } from '@/contexts/CartContext'

interface AIPreviewSectionProps {
  onChatStart: () => void
}

const AIPreviewSection: React.FC<AIPreviewSectionProps> = ({ onChatStart }) => {
  const { addItem } = useCart()

  const handleAddToCart = (recommendation: typeof previewRecommendations[0]) => {
    addItem(recommendation.product)
  }

  return (
    <div className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
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
            <Sparkles className="w-6 h-6 text-pink-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 bg-white/70 px-4 py-2 rounded-full">
              AI 추천 결과 미리보기
            </span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            당신을 위한 맞춤 추천
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            "달콤하고 플로럴한 향수"를 찾는 20대 여성을 위한 AI 추천 결과예요
          </p>
        </motion.div>

        {/* Recommendation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {previewRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.product.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                  recommendation.score >= 0.9 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : recommendation.score >= 0.85
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'  
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {Math.round(recommendation.score * 100)}% 일치
                </div>
              </div>

              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">🌸</span>
                  </div>
                </div>
                
                {/* Hover Overlay */}
                <motion.div
                  className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <button
                    onClick={() => handleAddToCart(recommendation)}
                    className="bg-white text-gray-800 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    장바구니 담기
                  </button>
                </motion.div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" fill="currentColor" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {recommendation.matchType === 'preference' ? '취향 맞춤' : '인기 상품'}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-1">{recommendation.product.brand}</p>
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                  {recommendation.product.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {recommendation.product.description}
                </p>

                {/* Notes */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {recommendation.product.notes.slice(0, 3).map((note, noteIndex) => (
                    <span
                      key={noteIndex}
                      className="px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded-full border border-pink-100"
                    >
                      {note}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-pink-600">
                    {recommendation.product.price.toLocaleString()}원
                  </span>
                  <span className="text-sm text-gray-500">
                    {recommendation.product.category}
                  </span>
                </div>

                {/* Reasons */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-semibold text-pink-600">추천 이유:</span>
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {recommendation.reasons.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              나만의 추천도 받아보세요!
            </h3>
            <p className="text-gray-600 mb-6">
              위 결과는 예시입니다. 실제 상담을 통해 더 정확한 추천을 받아보세요.
            </p>
            
            <motion.button
              onClick={onChatStart}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className="w-5 h-5" />
              나만의 향수 찾기 시작
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AIPreviewSection