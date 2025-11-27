'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw } from 'lucide-react'
import { demoMessages } from '@/data/mockData'

const AIChatDemo: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayedMessages, setDisplayedMessages] = useState<typeof demoMessages>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const startDemo = () => {
    setIsPlaying(true)
    setCurrentMessageIndex(0)
    setDisplayedMessages([])
    setTypingText('')
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setCurrentMessageIndex(0)
    setDisplayedMessages([])
    setTypingText('')
    setIsTyping(false)
  }

  useEffect(() => {
    if (!isPlaying || currentMessageIndex >= demoMessages.length) return

    const currentMessage = demoMessages[currentMessageIndex]
    
    if (currentMessage.sender === 'bot') {
      setIsTyping(true)
      setTypingText('')

      // 타이핑 애니메이션
      let charIndex = 0
      const typingInterval = setInterval(() => {
        if (charIndex < currentMessage.content.length) {
          setTypingText(currentMessage.content.slice(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
          
          // 타이핑 완료 후 메시지 추가
          setTimeout(() => {
            setDisplayedMessages(prev => [...prev, currentMessage])
            setTypingText('')
            setCurrentMessageIndex(prev => prev + 1)
          }, 500)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    } else {
      // 사용자 메시지는 즉시 표시
      setDisplayedMessages(prev => [...prev, currentMessage])
      setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1)
      }, 1000)
    }
  }, [isPlaying, currentMessageIndex])

  return (
    <div id="ai-demo" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              AI가 찾아주는 나만의 향수
            </h2>
            <p className="text-lg text-gray-600">
              간단한 대화만으로도 당신의 취향을 완벽하게 파악해요
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Demo Chat Interface */}
          <motion.div
            className="flex-1 max-w-lg mx-auto"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">🌸</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">C4pang AI</h3>
                    <p className="text-sm opacity-90">향수 전문 상담사</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-80 p-4 overflow-y-auto bg-gray-50">
                <AnimatePresence>
                  {displayedMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-purple-500 text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 flex justify-start"
                    >
                      <div className="max-w-xs px-4 py-3 rounded-2xl bg-white text-gray-800 rounded-bl-md shadow-sm">
                        <p className="text-sm leading-relaxed">
                          {typingText}
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="ml-1"
                          >
                            |
                          </motion.span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty State */}
                {!isPlaying && displayedMessages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <span className="text-4xl mb-4 block">💬</span>
                      <p className="text-sm">AI 데모를 시작해보세요</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Demo Controls */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-3">
                  <motion.button
                    onClick={startDemo}
                    disabled={isPlaying}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={!isPlaying ? { scale: 1.02 } : {}}
                    whileTap={!isPlaying ? { scale: 0.98 } : {}}
                  >
                    <Play className="w-4 h-4" />
                    {isPlaying ? '진행 중...' : '데모 시작'}
                  </motion.button>

                  <motion.button
                    onClick={resetDemo}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Demo Description */}
          <motion.div
            className="flex-1 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">
                이렇게 간단해요!
              </h3>
              <p className="text-gray-600 leading-relaxed">
                복잡한 향수 용어나 전문 지식이 필요 없어요. 
                일상적인 대화로 당신의 취향을 알려주세요.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: '🗣️',
                  title: '자연스러운 대화',
                  description: '복잡한 설문지 대신 편안한 대화로'
                },
                {
                  icon: '🎯',
                  title: '정확한 분석',
                  description: 'AI가 당신의 선호도를 정밀하게 파악'
                },
                {
                  icon: '⚡',
                  title: '즉시 추천',
                  description: '실시간으로 맞춤 향수를 제안'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AIChatDemo