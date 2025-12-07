# 빠른 API 테스트 가이드

## 1. Customer 서비스 포트포워딩

터미널 1에서 실행:
```bash
export KUBECONFIG=../c4ang-infra/environments/dev/kubeconfig/config
kubectl port-forward -n ecommerce deployment/customer-api 8081:8081
```

## 2. API 테스트

터미널 2에서 실행:

### 회원가입 테스트
```bash
curl -X POST 'http://localhost:8081/api/v1/auth/customers/signup' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "테스트",
    "email": "test@test.com",
    "password": "Test1234!",
    "defaultAddress": "서울",
    "defaultPhoneNumber": "010-1234-5678"
  }'
```

### 로그인 테스트
```bash
curl -X POST 'http://localhost:8081/api/v1/auth/customers/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@test.com",
    "password": "Test1234!"
  }'
```

## 3. 프론트엔드 연동 테스트

### 3.1 환경 변수 설정
`.env.local` 파일:
```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### 3.2 프론트엔드 실행
```bash
npm run dev
```

### 3.3 브라우저 테스트
- http://localhost:3000/signup - 회원가입
- http://localhost:3000/login - 로그인

## 4. 다른 서비스 테스트

### Product 서비스
```bash
kubectl port-forward -n ecommerce deployment/product-api 8082:8080
curl 'http://localhost:8082/api/v1/products?page=0&size=5'
```

### Store 서비스
```bash
kubectl port-forward -n ecommerce deployment/store-api 8083:8080
curl 'http://localhost:8083/api/v1/stores/{store-id}'
```

### Order 서비스
```bash
kubectl port-forward -n ecommerce deployment/order-api 8084:8080
curl 'http://localhost:8084/api/v1/orders'
```

### Payment 서비스
```bash
kubectl port-forward -n ecommerce deployment/payment-api 8085:8080
curl 'http://localhost:8085/api/v1/payments'
```

## 5. 전체 Gateway 테스트 (Istio)

```bash
kubectl port-forward -n ecommerce svc/ecommerce-gateway-istio 31250:80
```

그러면 모든 서비스를 하나의 엔드포인트로 접근:
- http://localhost:31250/api/v1/auth/customers/signup
- http://localhost:31250/api/v1/products
- http://localhost:31250/api/v1/stores
- http://localhost:31250/api/v1/orders
- http://localhost:31250/api/v1/payments

## 문제 해결

### 포트가 이미 사용 중
```bash
lsof -ti:8081 | xargs kill -9
```

### Pod 상태 확인
```bash
kubectl get pods -n ecommerce
kubectl logs -n ecommerce deployment/customer-api
```

### HTTPRoute 확인
```bash
kubectl get httproute -n ecommerce
kubectl describe httproute customer-api-route -n ecommerce
```
