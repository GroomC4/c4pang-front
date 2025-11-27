'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { howItWorksSteps } from '@/data/mockData'

interface HowItWorksSectionProps {
  onChatStart: () => void
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onChatStart }) => {
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
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            어떻게 작동하나요?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            4단계로 완성되는 간단하고 정확한 향수 쇼핑 경험
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              viewport={{ once: true }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.step}
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                {/* Step Card */}
                <motion.div
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center relative overflow-hidden"
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5`} />

                  {/* Step Number */}
                  <motion.div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} text-white text-xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.step}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="text-5xl mb-4"
                    whileHover={{ scale: 1.2, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.icon}
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line relative z-10">
                    {step.description}
                  </p>

                  {/* Hover Effect Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                    whileHover={{ opacity: 1 }}
                  />
                </motion.div>

                {/* Arrow (Desktop only) */}
                {index < howItWorksSteps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-20"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-purple-500" />
                    </div>
                  </motion.div>
                )}

                {/* Mobile Arrow */}
                {index < howItWorksSteps.length - 1 && (
                  <motion.div
                    className="lg:hidden flex justify-center mt-4"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center transform rotate-90">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-12 max-w-4xl mx-auto border border-purple-100">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              지금 바로 시작해보세요!
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              몇 분의 대화만으로 평생 사용할 완벽한 향수를 찾아드려요
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                onClick={onChatStart}
                className="group bg-gradient-to-r from-purple-500 to-pink-600 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-5 h-5 group-hover:animate-bounce" />
                무료 상담 시작하기
              </motion.button>

              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                평균 응답시간 30초
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { icon: '🆓', title: '완전 무료', desc: '상담 비용 없음' },
                { icon: '⚡', title: '즉시 결과', desc: '실시간 맞춤 추천' },
                { icon: '🎯', title: '100% 맞춤', desc: '당신만을 위한 추천' }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {benefit.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HowItWorksSection