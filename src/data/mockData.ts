// Mock Data for Home Page

export const demoMessages = [
  {
    id: '1',
    sender: 'user' as const,
    content: '달콤하고 플로럴한 향수 추천해주세요',
    timestamp: new Date(),
    type: 'text' as const
  },
  {
    id: '2',
    sender: 'bot' as const,
    content: '달콤하고 플로럴한 향이 좋으시는군요! 몇 가지 질문드릴게요.',
    timestamp: new Date(),
    type: 'text' as const
  },
  {
    id: '3',
    sender: 'bot' as const,
    content: '나이대가 어떻게 되시나요? 그리고 주로 언제 사용하실 예정인가요?',
    timestamp: new Date(),
    type: 'text' as const
  },
  {
    id: '4',
    sender: 'user' as const,
    content: '20대 초반이고, 데일리로 사용하려고 해요',
    timestamp: new Date(),
    type: 'text' as const
  }
]

export const previewRecommendations = [
  {
    product: {
      id: 'preview-1',
      name: 'Bloom Eternal',
      brand: 'GUCCI',
      price: 89000,
      description: '피오니와 재스민의 조화로운 플로럴 향',
      notes: ['피오니', '재스민', '화이트머스크'],
      image: '/images/p1065591406141189_714_thum.jpg',
      category: 'Floral'
    },
    matchType: 'preference' as const,
    score: 0.95,
    reasons: ['달콤한 플로럴 노트', '20대 여성 인기', '데일리 사용 적합']
  },
  {
    product: {
      id: 'preview-2',
      name: 'Miss Dior',
      brand: 'DIOR',
      price: 125000,
      description: '로맨틱하고 우아한 플로럴 부케',
      notes: ['로즈', '피치', '바닐라'],
      image: '/images/Fragrance-Trends-2023-Website-Featured-Image.jpg',
      category: 'Floral'
    },
    matchType: 'preference' as const,
    score: 0.92,
    reasons: ['달콤한 플로럴', '우아한 느낌', '롱라스팅']
  },
  {
    product: {
      id: 'preview-3',
      name: 'Coco Mademoiselle',
      brand: 'CHANEL',
      price: 142000,
      description: '모던하고 세련된 오리엔탈 플로럴',
      notes: ['베르가못', '재스민', '바닐라'],
      image: '/images/e856171e-a9b3-48fe-842c-cdbab18f1750.jpg',
      category: 'Oriental Floral'
    },
    matchType: 'preference' as const,
    score: 0.88,
    reasons: ['세련된 향', '플로럴 베이스', '프리미엄 품질']
  }
]

export const bestSellers = [
  {
    id: 'best-1',
    name: 'Black Opium',
    brand: 'YVES SAINT LAURENT',
    price: 135000,
    description: '매혹적이고 중독성 있는 오리엔탈 향',
    notes: ['커피', '바닐라', '화이트플라워'],
    image: '/images/p1065591406141189_714_thum.jpg',
    category: 'Oriental',
    rank: 1,
    salesCount: 1250
  },
  {
    id: 'best-2',
    name: 'Good Girl',
    brand: 'CAROLINA HERRERA',
    price: 118000,
    description: '달콤하고 관능적인 플로럴 오리엔탈',
    notes: ['튜베로즈', '재스민', '코코아'],
    image: '/images/Fragrance-Trends-2023-Website-Featured-Image.jpg',
    category: 'Floral Oriental',
    rank: 2,
    salesCount: 980
  },
  {
    id: 'best-3',
    name: 'Libre',
    brand: 'YVES SAINT LAURENT',
    price: 132000,
    description: '자유롭고 대담한 플로럴 아로마틱',
    notes: ['라벤더', '오렌지블라섬', '바닐라'],
    image: '/images/e856171e-a9b3-48fe-842c-cdbab18f1750.jpg',
    category: 'Floral Aromatic',
    rank: 3,
    salesCount: 876
  },
  {
    id: 'best-4',
    name: 'Flowerbomb',
    brand: 'VIKTOR & ROLF',
    price: 128000,
    description: '화려하고 폭발적인 플로럴 부케',
    notes: ['프리지아', '로즈', '패출리'],
    image: '/images/2021123101001036600063001.jpg',
    category: 'Floral',
    rank: 4,
    salesCount: 743
  }
]

export const reviews = [
  {
    id: 'review-1',
    userName: '향수러버',
    userAge: 23,
    rating: 5,
    content: 'AI 추천이 정말 정확해요! 제 취향을 완벽하게 파악해서 추천해준 향수가 정말 마음에 들어요. 앞으로도 계속 이용할 예정입니다.',
    productName: 'Miss Dior',
    purchaseDate: '2024-11-15',
    helpfulCount: 47,
    verified: true
  },
  {
    id: 'review-2',
    userName: '플로럴퀸',
    userAge: 25,
    rating: 5,
    content: '챗봇과 대화하면서 향수를 고르니까 훨씬 쉽고 재미있어요. 마치 친구와 상담받는 느낌이에요!',
    productName: 'Bloom Eternal',
    purchaseDate: '2024-11-10',
    helpfulCount: 32,
    verified: true
  },
  {
    id: 'review-3',
    userName: '향기공주',
    userAge: 22,
    rating: 4,
    content: '배송도 빠르고 포장도 꼼꼼해서 좋았어요. 특히 샘플도 함께 보내주셔서 다른 향수도 체험해볼 수 있어서 좋았습니다.',
    productName: 'Coco Mademoiselle',
    purchaseDate: '2024-11-08',
    helpfulCount: 28,
    verified: true
  },
  {
    id: 'review-4',
    userName: '센트마니아',
    userAge: 27,
    rating: 5,
    content: '향수 종류가 정말 다양하고, 가격도 합리적이에요. AI가 추천해준 향수들이 모두 제 스타일과 잘 맞아서 놀랐어요!',
    productName: 'Black Opium',
    purchaseDate: '2024-11-05',
    helpfulCount: 55,
    verified: true
  },
  {
    id: 'review-5',
    userName: '향수초보',
    userAge: 21,
    rating: 5,
    content: '향수를 처음 사는데 챗봇이 친절하게 설명해줘서 쉽게 선택할 수 있었어요. 받아본 향수도 정말 만족스러워요!',
    productName: 'Good Girl',
    purchaseDate: '2024-11-01',
    helpfulCount: 41,
    verified: true
  }
]

export const howItWorksSteps = [
  {
    step: 1,
    title: '취향 대화',
    description: 'AI 챗봇과 대화하며\n선호하는 향을 알려주세요',
    icon: '💬',
    color: 'from-pink-400 to-pink-600'
  },
  {
    step: 2,
    title: '맞춤 분석',
    description: 'AI가 당신의 취향을\n정확하게 분석합니다',
    icon: '🧠',
    color: 'from-purple-400 to-purple-600'
  },
  {
    step: 3,
    title: '완벽한 추천',
    description: '당신에게 딱 맞는\n향수를 추천해드려요',
    icon: '✨',
    color: 'from-blue-400 to-blue-600'
  },
  {
    step: 4,
    title: '간편한 구매',
    description: '마음에 든 향수를\n바로 구매하세요',
    icon: '🛍️',
    color: 'from-emerald-400 to-emerald-600'
  }
]

export type DemoMessage = typeof demoMessages[0]
export type PreviewRecommendation = typeof previewRecommendations[0]
export type BestSeller = typeof bestSellers[0]
export type Review = typeof reviews[0]
export type HowItWorksStep = typeof howItWorksSteps[0]