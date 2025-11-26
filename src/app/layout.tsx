import type { Metadata } from 'next'
import { ChatbotProvider } from '@/contexts/ChatbotContext'
import './globals.css'

export const metadata: Metadata = {
  title: '퍼퓸퀸 - 20대 여성을 위한 향수 이커머스',
  description: '20대 여성을 위한 향수 이커머스 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <ChatbotProvider>
          {children}
        </ChatbotProvider>
      </body>
    </html>
  )
}