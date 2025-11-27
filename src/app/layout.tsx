import type { Metadata } from 'next'
import { ChatbotProvider } from '@/contexts/ChatbotContext'
import { CartProvider } from '@/contexts/CartContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'C4pang - 향수 이커머스',
  description: '향수 이커머스 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <CartProvider>
          <ChatbotProvider>
            {children}
          </ChatbotProvider>
        </CartProvider>
      </body>
    </html>
  )
}