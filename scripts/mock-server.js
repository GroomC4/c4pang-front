// Simple mock server for testing chatbot API
const express = require('express')
const cors = require('cors')

const app = express()
const port = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Sample chatbot responses
const responses = {
  '향수 추천': {
    success: true,
    message: '어떤 향을 좋아하시나요? 🌹\n• 플로럴 (장미, 재스민)\n• 시트러스 (레몬, 오렌지)\n• 우디 (샌달우드, 시더)\n• 머스크 (부드럽고 따뜻한 향)',
    type: 'text'
  },
  '인기 브랜드': {
    success: true,
    message: '인기 브랜드를 소개해드릴게요! ✨\n\n• 샤넬 - 클래식하고 우아한 향\n• 딥티크 - 유니크하고 세련된 향\n• 조말론 - 영국의 전통적인 향\n• 르라보 - 모던하고 개성있는 향',
    type: 'text'
  },
  '가격 정보': {
    success: true,
    message: '퍼퓸퀸에서는 다양한 가격대의 향수를 준비했어요! 💝\n\n• 5만원 이하: 데일리 향수\n• 5-10만원: 프리미엄 향수\n• 10만원 이상: 럭셔리 향수',
    type: 'text'
  }
}

// Routes
app.post('/api/chatbot/message', (req, res) => {
  const { message } = req.body
  
  console.log('Received message:', message)
  
  // Simulate processing delay
  setTimeout(() => {
    const keywords = Object.keys(responses)
    const matchedKeyword = keywords.find(keyword => message.includes(keyword))
    
    if (matchedKeyword) {
      res.json(responses[matchedKeyword])
    } else {
      res.json({
        success: true,
        message: '더 자세히 알려주시면 더 정확한 추천을 해드릴 수 있어요! 😊\n\n"향수 추천", "인기 브랜드", "가격 정보" 등을 물어보세요!',
        type: 'text'
      })
    }
  }, 1000)
})

app.post('/api/chatbot/recommendations', (req, res) => {
  res.json({
    success: true,
    message: '맞춤 추천 결과입니다! 🌸',
    type: 'product',
    products: [
      {
        id: '1',
        name: '미스 디올',
        brand: '디올',
        price: 125000,
        image: '/images/perfume1.jpg',
        description: '로맨틱한 플로럴 향',
        fragrance: ['플로럴', '로즈', '자스민']
      }
    ]
  })
})

app.get('/api/chatbot/product/:id', (req, res) => {
  res.json({
    success: true,
    message: '상품 상세 정보입니다.',
    type: 'text'
  })
})

app.delete('/api/chatbot/session/:id', (req, res) => {
  res.json({ success: true })
})

app.listen(port, () => {
  console.log(`Mock chatbot server running at http://localhost:${port}`)
  console.log('Available endpoints:')
  console.log('- POST /api/chatbot/message')
  console.log('- POST /api/chatbot/recommendations')
  console.log('- GET /api/chatbot/product/:id')
  console.log('- DELETE /api/chatbot/session/:id')
})