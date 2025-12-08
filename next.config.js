/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['ui-avatars.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    unoptimized: true,
  },
  async rewrites() {
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000'
    const customerServiceUrl = process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_URL || 'http://localhost:8081'
    
    return [
      // 챗봇 API는 8000 포트로 라우팅
      {
        source: '/api/v1/chatbot/:path*',
        destination: `${chatbotUrl}/api/v1/chatbot/:path*`,
      },
      // 나머지 API는 customer service (8081)로 라우팅
      {
        source: '/api/:path*',
        destination: `${customerServiceUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig