# 백엔드 API 엔드포인트 정리

## 연동 설정
- Gateway: `http://172.16.24.53:31250` (포트포워딩 필요)
- 프론트엔드: Next.js API Proxy (`/api/proxy/*`)
- 인증: JWT 토큰 (localStorage)

## Customer Service (인증)

### 고객 인증
- `POST /api/v1/auth/customers/signup` - 고객 회원가입
- `POST /api/v1/auth/customers/login` - 고객 로그인
- `POST /api/v1/auth/customers/logout` - 고객 로그아웃 (인증 필요)

### 판매자 인증
- `POST /api/v1/auth/owners/signup` - 판매자 회원가입
- `POST /api/v1/auth/owners/login` - 판매자 로그인
- `POST /api/v1/auth/owners/logout` - 판매자 로그아웃 (인증 필요)

### 토큰
- `POST /api/v1/auth/refresh` - 토큰 갱신

## Product Service

### 상품 조회
- `GET /api/v1/products` - 상품 검색/목록 (필터: productName, storeName, minPrice, maxPrice, sortBy, page, size)
- `GET /api/v1/products/{id}` - 상품 상세 조회
- `GET /api/v1/products/owner` - 판매자 상품 목록 (Owner 권한 필요)

### 상품 관리 (Owner 권한 필요)
- `POST /api/v1/products` - 상품 등록
- `PUT /api/v1/products/{id}` - 상품 수정
- `PATCH /api/v1/products/{id}` - 상품 삭제 (소프트 삭제)
- `PATCH /api/v1/products/{id}/hide` - 상품 숨김/복원

### 상품 이미지
- `POST /api/v1/products/images` - 이미지 업로드 (multipart/form-data)

## Store Service

### 스토어 조회
- `GET /api/v1/stores/{storeId}` - 스토어 상세 조회 (인증 불필요)
- `GET /api/v1/stores/mine` - 내 스토어 조회 (Owner 권한 필요)

### 스토어 관리 (Owner 권한 필요)
- `POST /api/v1/stores` - 스토어 등록
- `PATCH /api/v1/stores/{storeId}` - 스토어 수정
- `DELETE /api/v1/stores/{storeId}` - 스토어 삭제 (소프트 삭제)

## Order Service

### 주문 조회
- `GET /api/v1/orders` - 내 주문 목록 (Customer 권한 필요)
- `GET /api/v1/orders/{orderId}` - 주문 상세 조회 (Customer 권한 필요)

### 주문 관리
- `POST /api/v1/orders` - 주문 생성 (Customer 권한 필요)
- `POST /api/v1/orders/{orderId}/cancel` - 주문 취소 (Customer 권한 필요)
- `POST /api/v1/orders/{orderId}/refund` - 반품/환불 요청 (Customer 권한 필요)

## Payment Service

### 결제 조회
- `GET /api/v1/payments` - 결제 목록 (필터: user_id, status)
- `GET /api/v1/payments/{paymentId}` - 결제 상세 조회

### 결제 관리
- `POST /api/v1/payments` - 결제 요청 생성
- `POST /api/v1/payments/{paymentId}/complete` - 결제 완료 처리
- `POST /api/v1/payments/{paymentId}/cancel` - 결제 취소

## HTTPRoute 설정

Customer 서비스 HTTPRoute에 auth 경로 추가 필요:
```yaml
# c4ang-infra/charts/services/customer-service/templates/httproute.yaml
rules:
  - matches:
      - path:
          type: PathPrefix
          value: /api/v1/auth
    backendRefs:
      - name: customer-api
        port: 80
  - matches:
      - path:
          type: PathPrefix
          value: /api/v1/customers
    backendRefs:
      - name: customer-api
        port: 80
```

## 인증 헤더
백엔드는 Istio Gateway에서 주입하는 헤더를 사용:
- `X-User-Id`: 사용자 UUID
- `X-User-Role`: CUSTOMER 또는 OWNER

프론트엔드는 `Authorization: Bearer {token}` 헤더만 전송하면 됨.
