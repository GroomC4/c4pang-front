'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Sparkles, MessageCircle, ArrowDown } from 'lucide-react'

interface HeroSectionProps {
  onChatStart: () => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ onChatStart }) => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/pngtree-perfume-morning-silk-perfume-pearl-indoor-background-photography-picture-image_840595.jpg"
          alt="Perfume Background"
          fill
          className="object-cover"
          priority
          onError={() => {
            console.log('Hero background image failed to load')
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 via-pink-50/90 to-rose-50/90 z-10" />
        <div className="absolute inset-0 bg-white/30 z-10" />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-pink-200 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-pink-500 mr-3" />
            </motion.div>
            <span className="text-sm font-medium text-gray-600 bg-white/70 px-4 py-2 rounded-full backdrop-blur-sm">
              AI Personal Perfume Concierge
            </span>
          </div>

          <h1 className="display-font text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            C4pang
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-4 font-semibold leading-tight">
            당신만을 위한 향수를 찾아드려요
          </p>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            AI가 당신의 취향을 분석하여 완벽한 향수를 추천하고,
            <br className="hidden md:block" />
            바로 구매까지 연결해드리는 스마트한 쇼핑 경험
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <motion.button
              onClick={onChatStart}
              className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5" />
              AI와 향수 상담 시작하기
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>

            <motion.button
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full font-semibold text-lg border border-gray-200 hover:border-pink-300 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                document.getElementById('ai-demo')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              먼저 데모 보기
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">98%</div>
              <div className="text-sm text-gray-600">추천 만족도</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">500+</div>
              <div className="text-sm text-gray-600">브랜드</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">10K+</div>
              <div className="text-sm text-gray-600">만족 고객</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <span className="text-sm">스크롤해서 더보기</span>
          <ArrowDown className="w-5 h-5" />
        </div>
      </motion.div>
    </div>
  )
}

export default HeroSection