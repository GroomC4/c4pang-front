# 프론트엔드-백엔드 연동 테스트 가이드

## 1. 포트포워딩 설정

터미널을 열고 다음 명령어를 실행하세요 (백그라운드로 실행):

```bash
# c4ang-infra 디렉토리에서
export KUBECONFIG=$(pwd)/environments/dev/kubeconfig/config
kubectl port-forward -n ecommerce svc/ecommerce-gateway-istio 31250:80
```

또는 백그라운드로 실행:

```bash
kubectl port-forward -n ecommerce svc/ecommerce-gateway-istio 31250:80 &
```

## 2. API 연결 테스트

### 2.1 Product API 테스트

```bash
# 상품 목록 조회
curl 'http://localhost:31250/api/v1/products?page=0&size=5'

# 상품 상세 조회 (실제 product ID 필요)
curl 'http://localhost:31250/api/v1/products/{product-id}'
```

### 2.2 Customer Auth API 테스트

```bash
# 고객 회원가입
curl -X POST 'http://localhost:31250/api/v1/auth/customers/signup' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "홍길동",
    "email": "test@example.com",
    "password": "Test1234!",
    "defaultAddress": "서울시 강남구",
    "defaultPhoneNumber": "010-1234-5678"
  }'

# 고객 로그인
curl -X POST 'http://localhost:31250/api/v1/auth/customers/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### 2.3 Store API 테스트

```bash
# 스토어 조회 (실제 store ID 필요)
curl 'http://localhost:31250/api/v1/stores/{store-id}'
```

## 3. 프론트엔드 개발 서버 실행

```bash
cd c4pang-front
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 4. 프론트엔드에서 API 호출 테스트

프론트엔드는 Next.js API Proxy를 통해 백엔드와 통신합니다:

- 프론트엔드: `http://localhost:3000`
- API Proxy: `/api/proxy/*`
- 백엔드: `http://localhost:31250` (포트포워딩)

### 테스트 시나리오

1. **회원가입 테스트**
   - `/signup` 또는 `/signup/seller` 페이지 접속
   - 회원가입 폼 작성 및 제출
   - 브라우저 개발자 도구 Network 탭에서 API 호출 확인

2. **상품 목록 조회**
   - `/products` 페이지 접속
   - 상품 목록이 표시되는지 확인

3. **로그인 테스트**
   - `/login` 페이지 접속
   - 로그인 후 토큰이 localStorage에 저장되는지 확인

## 5. 문제 해결

### 포트포워딩 연결 실패
```bash
# 포트가 이미 사용 중인 경우
lsof -ti:31250 | xargs kill -9

# 다시 포트포워딩
kubectl port-forward -n ecommerce svc/ecommerce-gateway-istio 31250:80
```

### CORS 에러
프론트엔드는 Next.js API Proxy를 사용하므로 CORS 문제가 없어야 합니다.
만약 발생한다면 `.env.local` 설정을 확인하세요.

### 404 에러
HTTPRoute 설정을 확인하세요:
```bash
kubectl --kubeconfig=../c4ang-infra/environments/dev/kubeconfig/config get httproute -n ecommerce
```

## 6. 자동 테스트 스크립트

```bash
# API 연결 테스트
./test-connection-simple.sh

# 전체 API 테스트
./test-api-connection.sh
```

## 7. HTTPRoute 업데이트 (필요시)

Customer 서비스 HTTPRoute에 auth 경로가 추가되어야 합니다:

```bash
cd c4ang-infra

# Helm 차트 빌드
make helm-build

# ArgoCD 동기화 (또는 자동 동기화 대기)
# ArgoCD UI에서 customer-service 앱 Sync
```

## 8. 환경 변수 확인

`.env.local` 파일:
```env
NEXT_PUBLIC_API_URL=http://localhost:31250
```

## 9. 개발 워크플로우

1. 포트포워딩 실행 (터미널 1)
2. 프론트엔드 개발 서버 실행 (터미널 2)
3. 브라우저에서 테스트
4. 코드 수정 후 Hot Reload로 즉시 확인
