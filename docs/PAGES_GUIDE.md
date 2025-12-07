# 페이지 구조 가이드

## 구현된 페이지 목록

### 고객 페이지

#### 1. 홈페이지 (`/`)
- 메인 랜딩 페이지
- 추천 상품, 인기 상품 표시
- 카테고리 네비게이션

#### 2. 상품 목록 (`/products`)
- 상품 검색 및 필터링
- 페이지네이션
- 가격순, 최신순 정렬
- 키워드 검색

#### 3. 상품 상세 (`/products/[id]`)
- 상품 상세 정보
- 이미지 갤러리
- 수량 선택
- 장바구니 담기 / 바로구매
- 재고 확인

#### 4. 주문 목록 (`/orders`)
- 내 주문 내역 조회
- 주문 상태별 필터
- 주문 취소 기능
- 반품/환불 신청

#### 5. 주문 상세 (`/orders/[id]`)
- 주문 상세 정보
- 배송 추적
- 배송지 정보
- 결제 정보
- 주문 취소/반품 신청

#### 6. 장바구니 (`/cart`)
- 장바구니 상품 관리
- 수량 변경
- 선택 삭제
- 주문하기

#### 7. 결제 (`/checkout`)
- 배송지 입력
- 결제 수단 선택
- 최종 결제

### 판매자 페이지

#### 1. 판매자 대시보드 (`/seller/dashboard`)
- 스토어 정보
- 판매 통계
- 신규 주문 알림
- 빠른 메뉴

#### 2. 스토어 등록 (`/seller/store/register`)
- 스토어 정보 입력
- 스토어 생성

#### 3. 상품 관리 (`/seller/products`)
- 내 상품 목록
- 상품 수정/삭제
- 판매 중지/재개
- 재고 관리

#### 4. 상품 등록 (`/seller/products/register`)
- 상품 정보 입력
- 이미지 업로드 (최대 5개)
- 가격 및 재고 설정
- 카테고리 선택

#### 5. 상품 수정 (`/seller/products/[id]/edit`)
- 상품 정보 수정
- 이미지 변경
- 가격 및 재고 업데이트

### 인증 페이지

#### 1. 로그인 (`/login`)
- 고객/판매자 로그인
- 이메일/비밀번호 인증
- 자동 로그인

#### 2. 회원가입 (`/signup`)
- 고객 회원가입
- 기본 정보 입력

#### 3. 판매자 회원가입 (`/signup/seller`)
- 판매자 회원가입
- 사업자 정보 입력

## 페이지별 주요 기능

### 상품 목록 페이지

**검색 기능**
```typescript
// 키워드 검색
const products = await productService.searchProducts({
  productName: '노트북',
  page: 0,
  size: 20
})

// 가격 필터
const products = await productService.searchProducts({
  minPrice: 500000,
  maxPrice: 2000000
})

// 스토어명 검색
const products = await productService.searchProducts({
  storeName: 'Apple Store'
})
```

**정렬 옵션**
- 최신순
- 가격 낮은순
- 가격 높은순
- 인기순

### 상품 상세 페이지

**주요 정보**
- 상품명, 설명
- 가격 (정가, 할인가)
- 재고 수량
- 배송 정보
- 스토어 정보

**사용자 액션**
- 수량 선택
- 장바구니 담기
- 바로 구매
- 찜하기 (TODO)

### 주문 페이지

**주문 상태**
- PENDING: 결제대기
- CONFIRMED: 주문확인
- SHIPPING: 배송중
- DELIVERED: 배송완료
- CANCELLED: 취소됨
- REFUNDED: 환불완료

**주문 액션**
- 주문 취소 (배송 전)
- 반품/환불 신청 (배송 완료 후)
- 주문 상세 조회

### 판매자 상품 관리

**상품 등록**
```typescript
await productService.registerProduct({
  name: '상품명',
  description: '상품 설명',
  price: 100000,
  discountPrice: 90000,
  stock: 50,
  images: [file1, file2, file3]
})
```

**상품 수정**
```typescript
await productService.updateProduct(productId, {
  name: '수정된 상품명',
  price: 95000
})
```

**판매 중지/재개**
```typescript
await productService.toggleProductVisibility(productId)
```

## 라우팅 구조

```
/                           # 홈
/products                   # 상품 목록
/products/[id]              # 상품 상세
/cart                       # 장바구니
/checkout                   # 결제
/orders                     # 주문 목록
/orders/[id]                # 주문 상세
/login                      # 로그인
/signup                     # 회원가입
/signup/seller              # 판매자 회원가입

/seller/dashboard           # 판매자 대시보드
/seller/store/register      # 스토어 등록
/seller/products            # 상품 관리
/seller/products/register   # 상품 등록
/seller/products/[id]/edit  # 상품 수정
```

## 인증 흐름

### 고객
1. 회원가입 (`/signup`)
2. 로그인 (`/login`)
3. 상품 검색 및 구매
4. 주문 내역 확인

### 판매자
1. 판매자 회원가입 (`/signup/seller`)
2. 판매자 로그인 (`/login`)
3. 스토어 등록 (`/seller/store/register`)
4. 상품 등록 및 관리
5. 주문 처리

## 상태 관리

### 인증 상태
- `useAuth` 훅 사용
- JWT 토큰 자동 관리
- 401 에러 시 자동 로그인 페이지 리다이렉트

### 로딩 상태
- 각 페이지에서 `loading` state 관리
- 스피너 표시

### 에러 처리
- try-catch로 에러 핸들링
- 사용자 친화적 에러 메시지
- 에러 발생 시 적절한 페이지 이동

## UI/UX 패턴

### 공통 컴포넌트
- Header: 네비게이션 바
- Footer: 푸터 정보
- Loading Spinner: 로딩 표시
- Empty State: 데이터 없음 표시
- Error State: 에러 표시

### 색상 테마
- Primary: Indigo (indigo-600)
- Success: Green (green-600)
- Warning: Yellow (yellow-600)
- Danger: Red (red-600)
- Gray: 텍스트 및 배경

### 반응형 디자인
- Mobile First
- Tailwind CSS 브레이크포인트 사용
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## 다음 구현 예정

### 고객 기능
- [ ] 찜하기 기능
- [ ] 리뷰 작성 및 조회
- [ ] 마이페이지
- [ ] 주소록 관리
- [ ] 쿠폰 관리

### 판매자 기능
- [ ] 주문 관리
- [ ] 매출 통계
- [ ] 리뷰 관리
- [ ] 정산 관리
- [ ] 공지사항 관리

### 관리자 기능
- [ ] 회원 관리
- [ ] 스토어 승인
- [ ] 상품 관리
- [ ] 통계 대시보드

## 개발 가이드

### 새 페이지 추가 시

1. 페이지 파일 생성
   ```bash
   # 예: 찜하기 페이지
   touch src/app/wishlist/page.tsx
   ```

2. 타입 정의 (필요시)
   ```typescript
   // src/types/wishlist.ts
   export interface Wishlist {
     id: string
     userId: string
     productId: string
     createdAt: string
   }
   ```

3. 서비스 레이어 추가 (필요시)
   ```typescript
   // src/services/wishlistService.ts
   class WishlistService {
     async addToWishlist(productId: string) { ... }
     async getMyWishlist() { ... }
   }
   ```

4. 페이지 컴포넌트 구현
   ```typescript
   'use client'
   
   export default function WishlistPage() {
     // 구현
   }
   ```

### 스타일 가이드
- Tailwind CSS 사용
- 일관된 간격 (p-4, p-6, p-8)
- 일관된 라운딩 (rounded-lg)
- 일관된 그림자 (shadow, shadow-lg)

### 접근성
- 시맨틱 HTML 사용
- alt 텍스트 제공
- 키보드 네비게이션 지원
- ARIA 레이블 사용

## 테스트

### 페이지 테스트 체크리스트
- [ ] 로딩 상태 표시
- [ ] 에러 처리
- [ ] 빈 상태 표시
- [ ] 반응형 디자인
- [ ] 인증 체크
- [ ] API 연동
- [ ] 네비게이션

### 수동 테스트 시나리오

**상품 구매 플로우**
1. 상품 목록에서 상품 검색
2. 상품 상세 페이지 이동
3. 수량 선택 후 장바구니 담기
4. 장바구니에서 주문하기
5. 배송지 입력
6. 결제 완료
7. 주문 내역 확인

**판매자 상품 등록 플로우**
1. 판매자 로그인
2. 스토어 등록 (없는 경우)
3. 상품 등록 페이지 이동
4. 상품 정보 입력
5. 이미지 업로드
6. 상품 등록 완료
7. 상품 목록에서 확인
