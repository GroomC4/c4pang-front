'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, Check, Gift, Sparkles } from 'lucide-react'

interface FloatingElement {
  id: number
  left: number
  top: number
  delay: number
  duration: number
}

const NewsletterCTA: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const elements = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: (i * 17 + 23) % 100,
      top: (i * 31 + 11) % 100,
      delay: (i * 0.3) % 2,
      duration: 3 + (i % 3),
    }))
    setFloatingElements(elements)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
      setEmail('')
    }, 1500)
  }

  return (
    <div className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {isMounted && floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <motion.div
            className="mb-8"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-yellow-300 mr-3" />
              <Gift className="w-8 h-8 text-pink-300" />
              <Sparkles className="w-8 h-8 text-yellow-300 ml-3" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              특별한 혜택을<br />
              <span className="bg-gradient-to-r from-pink-300 to-yellow-300 bg-clip-text text-transparent">
                가장 먼저 받아보세요
              </span>
            </h2>
            
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              새로운 향수 출시 소식부터 독점 할인까지,<br className="hidden md:block" />
              향수 애호가를 위한 프리미엄 정보를 매주 전해드려요
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: '🎁',
                title: '신규 가입 15% 할인',
                desc: '첫 구매 시 즉시 적용'
              },
              {
                icon: '⚡',
                title: '신상품 얼리버드',
                desc: '출시 전 미리 체험'
              },
              {
                icon: '💎',
                title: 'VIP 전용 이벤트',
                desc: '특별 혜택과 샘플'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-purple-200 text-sm">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Newsletter Form */}
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일 주소를 입력하세요"
                    className="w-full px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-200" />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-8 rounded-full font-semibold text-lg shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  whileHover={!isLoading && email ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isLoading && email ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      처리 중...
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      특별 혜택 받기
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  구독 완료!
                </h3>
                <p className="text-purple-200">
                  15% 할인 쿠폰을 이메일로 발송했어요 💌
                </p>
              </motion.div>
            )}

            <p className="text-xs text-purple-300 mt-4 leading-relaxed">
              언제든지 구독을 해지할 수 있습니다. 
              <br />개인정보는 안전하게 보호됩니다.
            </p>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="mt-12 flex items-center justify-center gap-8 text-purple-200"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">12K+</div>
              <div className="text-sm">구독자</div>
            </div>
            <div className="w-px h-8 bg-purple-400/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.9/5</div>
              <div className="text-sm">만족도</div>
            </div>
            <div className="w-px h-8 bg-purple-400/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">매주</div>
              <div className="text-sm">발송</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default NewsletterCTA