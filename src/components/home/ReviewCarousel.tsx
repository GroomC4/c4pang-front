'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, Quote } from 'lucide-react'
import { reviews } from '@/data/mockData'

const ReviewCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.3 }
    )

    if (scrollRef.current) {
      observer.observe(scrollRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView || !scrollRef.current) return

    const container = scrollRef.current
    const scrollWidth = container.scrollWidth
    const clientWidth = container.clientWidth
    let scrollPosition = 0

    const scroll = () => {
      scrollPosition += 1
      if (scrollPosition >= scrollWidth - clientWidth) {
        scrollPosition = 0
      }
      container.scrollLeft = scrollPosition
    }

    const interval = setInterval(scroll, 30)
    return () => clearInterval(interval)
  }, [isInView])

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  // 리뷰를 두 번 반복하여 무한 스크롤 효과
  const duplicatedReviews = [...reviews, ...reviews]

  return (
    <div className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
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
            <Heart className="w-6 h-6 text-red-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 bg-white/70 px-4 py-2 rounded-full">
              고객 후기
            </span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            실제 고객들의 생생한 후기
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI 추천으로 완벽한 향수를 찾은 고객들의 솔직한 이야기를 들어보세요
          </p>
        </motion.div>

        {/* Auto Scrolling Reviews */}
        <div className="relative">
          <motion.div
            ref={scrollRef}
            className="flex gap-6 overflow-x-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {duplicatedReviews.map((review, index) => (
              <motion.div
                key={`${review.id}-${index}`}
                className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
                whileHover={{ y: -5 }}
              >
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="w-8 h-8 text-purple-300 opacity-50" />
                  {review.verified && (
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      구매 인증
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {review.rating}/5
                  </span>
                </div>

                {/* Review Content */}
                <p className="text-gray-700 leading-relaxed mb-6 line-clamp-4">
                  {review.content}
                </p>

                {/* Product Info */}
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-semibold text-purple-800">
                    구매 상품: {review.productName}
                  </p>
                  <p className="text-xs text-purple-600">
                    구매일: {review.purchaseDate}
                  </p>
                </div>

                {/* User Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {review.userName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {review.userName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.userAge}세
                      </p>
                    </div>
                  </div>

                  {/* Helpful Count */}
                  <div className="flex items-center gap-1 text-gray-500">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{review.helpfulCount}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-purple-50 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-indigo-50 to-transparent pointer-events-none" />
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {[
            { value: '4.8/5', label: '평균 만족도', icon: '⭐' },
            { value: '95%', label: '재구매율', icon: '🔄' },
            { value: '10K+', label: '누적 리뷰', icon: '💬' },
            { value: '98%', label: '추천 의향', icon: '👍' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center bg-white rounded-xl p-6 shadow-lg"
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default ReviewCarousel