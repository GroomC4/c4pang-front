import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR, Playfair_Display } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatbotProvider } from '@/contexts/ChatbotContext'
import { CartProvider } from '@/contexts/CartContext'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const notoSansKR = Noto_Sans_KR({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-kr',
  display: 'swap'
})

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-playfair',
  display: 'swap'
})

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
      <body className={`${inter.variable} ${notoSansKR.variable} ${playfairDisplay.variable}`}>
        <AuthProvider>
          <CartProvider>
            <ChatbotProvider>
              {children}
            </ChatbotProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}