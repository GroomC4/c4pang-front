애플리케이션 아키텍처 (Application Architecture)

본 프로젝트는 Next.js 16과 React 19 기반의 계층형 아키텍처를 따른다.
프레임워크 설정 → UI 컴포넌트 → 서비스 계층 → 데이터 계층 순으로 구성되어 있다.

핵심 아키텍처 패턴
패턴	구현 요소	목적
Context API	AuthProvider, CartProvider, ChatbotProvider	전역 상태 관리
Singleton	ChatbotService	챗봇 로직 단일 인스턴스 관리
API Proxy	next.config.js rewrites	/api/* 요청을 localhost:8081로 프록시
Mock Data	mockData.ts	개발/데모용 데이터
Layout System	RootLayout	전역 레이아웃 및 폰트 설정
핵심 시스템 (Core Systems)

애플리케이션은 다음의 5개 주요 시스템으로 구성된다.

1. 인증 시스템 (Authentication System)

Auth0 기반 로그인, 회원가입, 세션 관리

useAuth() 훅 제공

주요 위치: AuthContext, /app/login, /app/signup

2. 이커머스 시스템 (E-commerce System)

장바구니 추가/삭제/수량 변경

상품 목록 및 상세 페이지

주문 처리 흐름

주요 위치: CartContext, components/cart/*

3. AI 챗봇 시스템 (AI Chatbot System)

대화 기반 향수 추천

실시간 메시지 처리 및 타이핑 애니메이션

백엔드 연동 실패 시 mockData 기반 fallback

주요 위치: ChatbotContext, ChatbotService, Chatbot.tsx

4. 내비게이션 및 레이아웃 시스템 (Navigation & Layout)

상단 헤더, 카트 표시, 인증 UI

페이지 간 라우팅

전역 레이아웃 구성

주요 위치: Header.tsx, app/layout.tsx

5. 홈 페이지 경험 (Home Page Experience)

랜딩 페이지 섹션

데모 챗봇 경험

상품 프리뷰 및 베스트셀러 섹션

주요 위치: app/page.tsx, components/home/*

기술 스택 (Technology Stack)
분류	기술	버전	역할
Framework	Next.js	16.0.4	SSR/SSG React 프레임워크
UI Library	React	19.2.0	컴포넌트 기반 UI
Language	TypeScript	5.9.3	정적 타입
Styling	Tailwind CSS	3.4.18	유틸리티 CSS
Animation	Framer Motion	12.23.24	애니메이션
Icons	lucide-react	0.555.0	아이콘
HTTP Client	axios	1.13.2	API 호출
Authentication	Auth0 SDK	4.13.1	인증
State Management	Context API	내장	전역 상태
Build Tools	PostCSS, Autoprefixer	8.5.6, 10.4.22	CSS 전처리
프로젝트 구조 (Project Structure)
src/
 ├─ app/                  # Next.js App Router 라우팅
 ├─ components/           # 재사용 가능한 UI 컴포넌트
 ├─ contexts/             # 전역 상태 관리 (Auth, Cart, Chatbot)
 ├─ services/             # 비즈니스 로직 및 API 통신
 ├─ data/                 # 개발 및 테스트용 mock 데이터
 ├─ types/                # 타입 정의
 └─ utils/                # 공통 유틸 함수

데이터 플로우 아키텍처 (Data Flow Architecture)

애플리케이션 데이터 흐름은 단방향(unidirectional) 구조를 따른다.

사용자 → 컴포넌트: 이벤트 발생

컴포넌트 → Hook: useAuth, useCart, useChatbot 사용

Hook → Provider: Context provider에서 상태 제공

Provider → Service: 비즈니스 로직 수행

Service → API: axios로 백엔드 호출

API → Backend: next.config.js 프록시 설정 기반 요청 전달

Backend → Service: 응답 수신

Service → Provider: 상태 업데이트

Provider → Component: UI 리렌더링

Fallback 전략

백엔드 API가 실패할 경우 ChatbotService는 mockData.ts를 사용해 챗봇 기능을 계속 제공한다.

개발 워크플로우 (Development Workflow)
NPM Scripts
명령어	설명
npm run dev	개발 서버 실행 (http://localhost:3000
)
npm run build	프로덕션 빌드
npm run start	빌드 결과로 서버 실행
npm run lint	ESLint 검사
개발 환경

Frontend: http://localhost:3000

Backend API: http://localhost:8081
 (프록시 기반)

빌드 파이프라인

TypeScript strict 모드

Tailwind + PostCSS 처리

Next.js 코드 스플리팅, 이미지 최적화

WebP 기반 이미지 설정

주요 엔트리 포인트 (Entry Points)
파일	역할
app/layout.tsx	전체 레이아웃, 폰트, Provider 등록
app/page.tsx	홈 페이지
next.config.js	Next.js 설정 및 프록시 라우팅
ChatbotContext.tsx	챗봇 전역 상태 관리
CartContext.tsx	장바구니 전역 상태 관리
AuthContext.tsx	인증 전역 상태 관리
ChatbotService.ts	챗봇 비즈니스 로직
mockData.ts	개발용 데이터
Header.tsx	상단 네비게이션 UI
