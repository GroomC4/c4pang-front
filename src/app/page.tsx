'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { 
  HeroSection,
  AIChatDemo,
  AIPreviewSection,
  BestSellersSection,
  ReviewCarousel,
  HowItWorksSection,
  NewsletterCTA
} from '@/components/home'
import { useChatbot } from '@/contexts/ChatbotContext'
import { useCart } from '@/contexts/CartContext'
import { Cart } from '@/components/cart/Cart'
import Chatbot from '@/components/chatbot/Chatbot'
import { User } from '@/types'

const HomePage: React.FC = () => {
  const { toggleChatbot } = useChatbot()
  const { 
    items, 
    totalPrice, 
    totalItems, 
    isCartOpen, 
    openCart, 
    closeCart, 
    updateQuantity, 
    removeItem 
  } = useCart()

  // 임시로 user를 null로 설정하여 로그인되지 않은 상태로 표시
  const user: User | null = null

  const handleChatStart = () => {
    toggleChatbot()
  }

  return (
    <main className="min-h-screen">
      <Header 
        user={user} 
        cartItemCount={totalItems}
        onCartClick={openCart}
      />

      {/* Hero Section - 100vh */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <HeroSection onChatStart={handleChatStart} />
      </motion.section>

      {/* AI Chat Demo - Interactive */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <AIChatDemo />
      </motion.section>

      {/* AI Preview Results */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <AIPreviewSection onChatStart={handleChatStart} />
      </motion.section>

      {/* Best Sellers Grid */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <BestSellersSection />
      </motion.section>

      {/* Auto Scrolling Reviews */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <ReviewCarousel />
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <HowItWorksSection onChatStart={handleChatStart} />
      </motion.section>

      {/* Newsletter CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <NewsletterCTA />
      </motion.section>

      {/* Chatbot Component */}
      <Chatbot />
      
      {/* 장바구니 */}
      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        totalPrice={totalPrice}
      />
    </main>
  )
}

export default HomePage