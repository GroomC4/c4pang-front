# API 연동 가이드

## 개요

프론트엔드는 k3d 위의 MSA 서비스들과 Istio Gateway를 통해 통신합니다.

## 아키텍처

```
Frontend (Next.js)
    ↓
Istio Gateway (api.c4ang.com:30854)
    ↓
MSA Services (k3d ecommerce namespace)
    ├── store-api (스토어 관리)
    ├── product-api (상품 관리)
    ├── payment-api (결제 관리)
    └── order-api (주문 관리)
```

## 환경 설정

### 1. /etc/hosts 설정

```bash
sudo sh -c 'echo "127.0.0.1 api.c4ang.com" >> /etc/hosts'
```

### 2. 환경변수 (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://api.c4ang.com:30854
NEXT_PUBLIC_STORE_SERVICE_URL=http://api.c4ang.com:30854
NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://api.c4ang.com:30854
```

## 서비스 레이어 구조

### 타입 정의 (`src/types/`)

- `api.ts`: 공통 API 타입 (ApiResponse, PaginatedResponse 등)
- `auth.ts`: 인증 관련 타입
- `store.ts`: 스토어 관련 타입
- `product.ts`: 상품 관련 타입
- `order.ts`: 주문 관련 타입
- `payment.ts`: 결제 관련 타입

### 서비스 레이어 (`src/services/`)

- `api.ts`: Axios 인스턴스 및 인터셉터 (토큰 관리, 에러 처리)
- `authService.ts`: 인증 서비스 (로그인, 회원가입, 로그아웃)
- `storeService.ts`: 스토어 서비스
- `productService.ts`: 상품 서비스
- `orderService.ts`: 주문 서비스
- `paymentService.ts`: 결제 서비스

## API 엔드포인트 매핑

### 인증 (Auth Service)

| 기능 | 메서드 | 엔드포인트 | 인증 | 설명 |
|------|--------|-----------|------|------|
| 고객 회원가입 | POST | `/api/v1/auth/customers/signup` | ❌ | 일반 고객 회원가입 |
| 판매자 회원가입 | POST | `/api/v1/auth/owners/signup` | ❌ | 판매자 회원가입 |
| 고객 로그인 | POST | `/api/v1/auth/customers/login` | ❌ | 일반 고객 로그인 |
| 판매자 로그인 | POST | `/api/v1/auth/owners/login` | ❌ | 판매자 로그인 |
| 고객 로그아웃 | POST | `/api/v1/auth/customers/logout` | ✅ | 일반 고객 로그아웃 |
| 판매자 로그아웃 | POST | `/api/v1/auth/owners/logout` | ✅ | 판매자 로그아웃 |
| 토큰 갱신 | POST | `/api/v1/auth/refresh` | ❌ | 리프레시 토큰으로 액세스 토큰 갱신 |

### 스토어 (Store Service)

| 기능 | 메서드 | 엔드포인트 | 인증 | 설명 |
|------|--------|-----------|------|------|
| 스토어 등록 | POST | `/api/v1/stores` | ✅ Owner | 새 스토어 등록 |
| 스토어 조회 | GET | `/api/v1/stores/{storeId}` | ❌ | 스토어 상세 정보 조회 |
| 내 스토어 조회 | GET | `/api/v1/stores/mine` | ✅ Owner | 판매자 본인 스토어 조회 |
| 스토어 수정 | PATCH | `/api/v1/stores/{storeId}` | ✅ Owner | 본인 스토어 정보 수정 |
| 스토어 삭제 | DELETE | `/api/v1/stores/{storeId}` | ✅ Owner | 본인 스토어 삭제 (소프트) |

### 상품 (Product Service)

| 기능 | 메서드 | 엔드포인트 | 인증 | 설명 |
|------|--------|-----------|------|------|
| 상품 검색 | GET | `/api/v1/products` | ❌ | 상품 목록 조회 및 검색 |
| 상품 상세 | GET | `/api/v1/products/{productId}` | ❌ | 상품 상세 정보 조회 |
| 내 상품 목록 | GET | `/api/v1/products/owner` | ✅ Owner | 판매자 본인 상품 목록 |
| 상품 등록 | POST | `/api/v1/products/register` | ✅ Owner | 새 상품 등록 (이미지 포함) |
| 상품 수정 | PATCH | `/api/v1/products/{productId}` | ✅ Owner | 본인 상품 수정 |
| 상품 삭제 | DELETE | `/api/v1/products/{productId}` | ✅ Owner | 본인 상품 삭제 |
| 상품 숨김/복원 | PATCH | `/api/v1/products/{productId}/hide` | ✅ Owner | 판매 중지/재개 |
| 이미지 업로드 | POST | `/api/v1/products/images` | ✅ Owner | 상품 이미지 업로드 |

### 주문 (Order Service)

| 기능 | 메서드 | 엔드포인트 | 인증 | 설명 |
|------|--------|-----------|------|------|
| 주문 생성 | POST | `/api/v1/orders` | ✅ Customer | 새 주문 생성 |
| 주문 목록 | GET | `/api/v1/orders` | ✅ | 내 주문 목록 조회 |
| 주문 상세 | GET | `/api/v1/orders/{orderId}` | ✅ | 주문 상세 정보 조회 |
| 주문 취소 | POST | `/api/v1/orders/{orderId}/cancel` | ✅ | 주문 취소 (배송 전) |
| 반품/환불 | POST | `/api/v1/orders/{orderId}/refund` | ✅ | 반품/환불 요청 |

### 결제 (Payment Service)

| 기능 | 메서드 | 엔드포인트 | 인증 | 설명 |
|------|--------|-----------|------|------|
| 결제 생성 | POST | `/api/v1/payments` | ✅ | 결제 요청 생성 |
| 결제 목록 | GET | `/api/v1/payments` | ✅ | 내 결제 목록 조회 |
| 결제 상세 | GET | `/api/v1/payments/{paymentId}` | ✅ | 결제 상세 정보 조회 |
| 결제 완료 | POST | `/api/v1/payments/{paymentId}/complete` | ✅ | 결제 완료 처리 (콜백) |
| 결제 취소 | POST | `/api/v1/payments/{paymentId}/cancel` | ✅ | 결제 취소 |

## 사용 예시

### 1. 로그인

```typescript
import { authService } from '@/services'

// 고객 로그인
const loginData = await authService.loginCustomer({
  email: 'customer@example.com',
  password: 'password123'
})

// 판매자 로그인
const ownerData = await authService.loginOwner({
  email: 'owner@example.com',
  password: 'password123'
})
```

### 2. 상품 검색

```typescript
import { productService } from '@/services'

// 상품 검색
const products = await productService.searchProducts({
  productName: '노트북',
  minPrice: 500000,
  maxPrice: 2000000,
  page: 0,
  size: 20
})

// 상품 상세 조회
const product = await productService.getProductById('product-uuid')
```

### 3. 스토어 관리 (판매자)

```typescript
import { storeService } from '@/services'

// 스토어 등록
const store = await storeService.registerStore({
  name: '내 스토어',
  description: '스토어 설명'
})

// 내 스토어 조회
const myStore = await storeService.getMyStore()

// 스토어 수정
await storeService.updateStore(myStore.storeId, {
  name: '수정된 스토어명'
})
```

### 4. 상품 등록 (판매자)

```typescript
import { productService } from '@/services'

// 상품 등록
const product = await productService.registerProduct({
  name: '맥북 프로 16',
  description: '고성능 노트북',
  price: 3590000,
  discountPrice: 3290000,
  stock: 10,
  categoryId: 'cat-001',
  images: [file1, file2, file3] // File 객체 배열
})
```

### 5. 주문 생성 (고객)

```typescript
import { orderService } from '@/services'

// 주문 생성
const order = await orderService.createOrder({
  orderItems: [
    { productId: 'prod-001', quantity: 1 },
    { productId: 'prod-002', quantity: 2 }
  ],
  address: {
    recipientName: '홍길동',
    recipientPhone: '010-1234-5678',
    zipCode: '12345',
    address: '서울시 강남구',
    addressDetail: '101동 101호'
  }
})
```

### 6. 결제 처리

```typescript
import { paymentService } from '@/services'

// 결제 생성
const payment = await paymentService.createPayment({
  orderId: order.orderId,
  paymentMethod: 'CREDIT_CARD'
})

// 결제 완료 (콜백)
await paymentService.completePayment(payment.paymentId)
```

## 에러 처리

모든 서비스는 `apiService`의 인터셉터를 통해 에러를 처리합니다:

```typescript
try {
  const products = await productService.searchProducts({ productName: '노트북' })
} catch (error) {
  if (error.response?.status === 401) {
    // 인증 실패 - 로그인 페이지로 리다이렉트
    router.push('/login')
  } else if (error.response?.status === 403) {
    // 권한 없음
    alert('권한이 없습니다')
  } else {
    // 기타 에러
    console.error('API 에러:', error.response?.data?.error?.message)
  }
}
```

## 인증 토큰 관리

- 액세스 토큰은 `localStorage`에 저장
- 401 에러 발생 시 자동으로 리프레시 토큰으로 갱신 시도
- 리프레시 실패 시 로그인 페이지로 리다이렉트

## 개발 워크플로우

1. k3d 클러스터 시작
   ```bash
   cd c4ang-infra
   make dev-up
   ```

2. /etc/hosts 설정
   ```bash
   sudo sh -c 'echo "127.0.0.1 api.c4ang.com" >> /etc/hosts'
   ```

3. 프론트엔드 실행
   ```bash
   cd c4pang-front
   npm run dev
   ```

4. API 테스트
   ```bash
   curl http://api.c4ang.com:30854/api/v1/stores/actuator/health
   ```

## 트러블슈팅

### API 호출 실패

1. k3d 클러스터 상태 확인
   ```bash
   kubectl --kubeconfig=c4ang-infra/environments/dev/kubeconfig/config get pods -n ecommerce
   ```

2. Istio Gateway 상태 확인
   ```bash
   kubectl --kubeconfig=c4ang-infra/environments/dev/kubeconfig/config get svc -n istio-system
   ```

3. /etc/hosts 설정 확인
   ```bash
   grep api.c4ang.com /etc/hosts
   ```

### CORS 에러

각 MSA 서비스의 `application.yml`에 CORS 설정이 필요합니다:

```yaml
spring:
  web:
    cors:
      allowed-origins:
        - http://localhost:3000
        - http://api.c4ang.com:30854
      allowed-methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
      allowed-headers: "*"
      allow-credentials: true
```

## 참고 문서

- [Istio Gateway 설정](../c4ang-infra/docs/frontend-integration.md)
- [Store API Contract](../msa-service/c4ang-store-service/docs/CONTRACT_GUIDE.md)
- [Product API Contract](../msa-service/c4ang-product-service/docs/rag/contract.md)
