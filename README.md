C4pang

AI 기반 향수 추천 이커머스 웹 애플리케이션

1. 소개 (Overview)

C4pang은 AI를 활용하여 향수를 추천하고 구매할 수 있는 웹 기반 이커머스 애플리케이션이다.
Next.js 16과 React 19를 기반으로 구축되었으며, 사용자는 챗봇을 통해 취향에 맞는 향수를 추천받거나 기존 이커머스 방식으로 상품을 탐색하고 구매할 수 있다.

본 문서는 애플리케이션의 아키텍처, 핵심 기능, 기술 스택, 디렉토리 구조, 개발 환경 등을 전체적으로 정리한 문서이다.

2. 주요 기능 (Features)
2.1 AI 챗봇 추천 시스템

대화형 인터페이스를 통한 향수 추천

사용자 취향 기반 추천 알고리즘

실시간 메시지 처리 및 타이핑 애니메이션

API 장애 시 mockData 기반 fallback 기능 제공

2.2 이커머스 기능

장바구니 담기, 삭제, 수량 변경

상품 목록 및 상세 페이지

주문 처리 및 확인

베스트셀러 및 상품 프리뷰 제공

2.3 인증 시스템

Auth0 기반 로그인/회원가입

세션 유지 및 보호된 페이지 접근 관리

useAuth() 훅 제공

2.4 레이아웃 및 내비게이션

전역 Header, Footer

인증 상태 및 카트 상태 표시

Next.js App Router 기반의 페이지 전환

3. 아키텍처 (Application Architecture)

본 프로젝트는 Next.js App Router 기반의 계층형 아키텍처를 따른다.

3.1 아키텍처 패턴
| 패턴            | 구현 요소                                       | 목적                                 |
| ------------- | ------------------------------------------- | ---------------------------------- |
| Context API   | AuthProvider, CartProvider, ChatbotProvider | 전역 상태 관리                           |
| Singleton     | ChatbotService                              | 챗봇 로직의 단일 인스턴스 유지                  |
| API Proxy     | next.config.js rewrites                     | `/api/*` 요청 → `localhost:8081` 프록시 |
| Mock Data     | mockData.ts                                 | 개발 및 데모용 fallback 데이터              |
| Layout System | RootLayout                                  | 글로벌 레이아웃 및 폰트 설정                   |

3.2 데이터 흐름 구조 (Data Flow)

애플리케이션은 단방향 데이터 흐름(Unidirectional Flow)을 따른다.

사용자 → 컴포넌트 (UI 이벤트 발생)

컴포넌트 → 훅 호출 (useAuth, useCart, useChatbot)

훅 → Provider (Context 기반 상태 소비)

Provider → Service 호출

Service → axios API 요청

API → Backend (next.config.js proxy 경유)

Backend 응답

Service에서 Provider로 상태 업데이트

Provider 상태 변경 → UI 리렌더링

3.3 Fallback 전략

백엔드 API 장애 시 ChatbotService는 자동으로 mockData를 사용하여 챗봇 기능이 중단되지 않도록 한다.

4. 기술 스택 (Technology Stack)
4.1 주요 기술
분류	기술	버전	설명
| 분류          | 기술                    | 버전             | 설명                     |
| ----------- | --------------------- | -------------- | ---------------------- |
| Framework   | Next.js               | 16.0.4         | React 기반 SSR/SSG 프레임워크 |
| UI Library  | React                 | 19.2.0         | 컴포넌트 기반 UI 라이브러리       |
| Language    | TypeScript            | 5.9.3          | 정적 타입                  |
| Styling     | Tailwind CSS          | 3.4.18         | 유틸리티 CSS 프레임워크         |
| Animation   | Framer Motion         | 12.23.24       | UI 애니메이션               |
| Icons       | lucide-react          | 0.555.0        | 아이콘 라이브러리              |
| Auth        | @auth0/nextjs-auth0   | 4.13.1         | Auth0 인증               |
| HTTP Client | axios                 | 1.13.2         | API 요청                 |
| Build Tools | PostCSS, Autoprefixer | 8.5.6, 10.4.22 | CSS 빌드 처리              |

4.2 개발 도구

Node.js

ESLint

Prettier

Express (dev server)

5. 프로젝트 구조 (Project Structure)
src/
 ├─ app/                   # Next.js App Router 라우팅
 │   ├─ layout.tsx         # 전체 레이아웃
 │   ├─ page.tsx           # 메인 페이지
 │   └─ ...                # 기타 라우트 페이지
 ├─ components/            # UI 컴포넌트
 ├─ contexts/              # Auth, Cart, Chatbot 전역 상태 관리
 ├─ services/              # 비즈니스 로직 및 API 연동
 ├─ data/                  # mockData
 ├─ types/                 # TypeScript 타입 정의
 └─ utils/                 # 공통 유틸 함수

6. 설치 및 실행 (Getting Started)
6.1 사전 요구사항

Node.js (LTS 버전)

npm 또는 yarn

6.2 설치
npm install

6.3 개발 서버 실행
npm run dev


접속: http://localhost:3000

6.4 프로덕션 빌드
npm run build
npm run start

6.5 린트 검사
npm run lint

7. 환경 변수 (Environment Variables)

예시:

AUTH0_SECRET=...
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=...
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
BACKEND_API_URL=http://localhost:8081

8. API 프록시 설정 (API Proxy Configuration)

Next.js의 rewrite 설정을 통해 프론트엔드에서의 /api/* 요청을 백엔드로 전달한다.

// next.config.js
rewrites: async () => [
  {
    source: "/api/:path*",
    destination: "http://localhost:8081/:path*",
  },
];

9. 주요 코드 엔트리 포인트 (Key Entry Points)
파일	설명
app/layout.tsx	Root Layout, Provider 설정
app/page.tsx	메인 랜딩 페이지
ChatbotContext.tsx	챗봇 상태 관리
CartContext.tsx	장바구니 전역 상태
AuthContext.tsx	인증 전역 상태
services/chatbot/ChatbotService.ts	챗봇 비즈니스 로직
data/mockData.ts	fallback 데이터
components/layout/Header.tsx	상단 UI
