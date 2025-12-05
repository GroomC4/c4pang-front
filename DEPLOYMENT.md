# 프론트엔드 배포 가이드

## 🏗️ 아키텍처

```
GitHub → GitHub Actions → S3 → CloudFront → 사용자
```

- **S3**: 정적 파일 저장
- **CloudFront**: CDN (전 세계 배포)
- **GitHub Actions**: CI/CD 자동화

## 📋 사전 준비

### 1. AWS 인프라 생성 (Terraform)

**인프라 레포에서 실행:**

```bash
cd c4ang-infra/terraform/frontend

# 변수 파일 생성
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars 파일 수정

# Terraform 초기화
terraform init

# 인프라 생성 계획 확인
terraform plan

# 인프라 생성
terraform apply
```

**생성되는 리소스:**
- S3 버킷 (정적 파일 저장)
- CloudFront Distribution (CDN)
- Origin Access Control (보안)
- S3 버킷 정책

**출력값 확인:**
```bash
terraform output
```

출력 예시:
```
s3_bucket_name = "c4pang-front-dev"
cloudfront_distribution_id = "E1234567890ABC"
cloudfront_domain_name = "d111111abcdef8.cloudfront.net"
website_url = "https://d111111abcdef8.cloudfront.net"
```

### 2. GitHub Secrets 설정

Repository Settings → Secrets and variables → Actions → New repository secret

**필수 Secrets:**

```bash
# AWS 인증
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# S3 & CloudFront
S3_BUCKET_NAME=c4pang-front-dev
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC

# API 엔드포인트 (프로덕션)
NEXT_PUBLIC_API_URL=https://api.c4pang.com
NEXT_PUBLIC_CUSTOMER_SERVICE_URL=https://api.c4pang.com/customer
NEXT_PUBLIC_STORE_SERVICE_URL=https://api.c4pang.com/store
NEXT_PUBLIC_PRODUCT_SERVICE_URL=https://api.c4pang.com/product
NEXT_PUBLIC_CHATBOT_URL=https://api.c4pang.com/chatbot
```

## 🚀 배포 방법

### 자동 배포 (권장)

**main 브랜치에 push하면 자동 배포:**

```bash
git add .
git commit -m "feat: 새 기능 추가"
git push origin main
```

**수동 배포 트리거:**

GitHub → Actions → Deploy to CloudFront → Run workflow

### 수동 배포

```bash
# 1. 의존성 설치
npm ci

# 2. 환경 변수 설정
cp .env.production.example .env.production
# .env.production 파일 수정

# 3. 빌드
npm run build

# 4. S3 업로드
aws s3 sync out/ s3://c4pang-front-dev --delete

# 5. CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

## 🔧 설정 파일

### next.config.js

```javascript
const nextConfig = {
  output: 'export',  // 정적 사이트 생성
  images: {
    unoptimized: true,  // 정적 export용
  },
}
```

### package.json

```json
{
  "scripts": {
    "build": "next build",  // 정적 파일 생성 (out/ 폴더)
  }
}
```

## 📊 배포 프로세스

1. **코드 Push** → GitHub
2. **GitHub Actions 트리거**
   - Node.js 설정
   - 의존성 설치
   - 환경 변수 생성
   - Next.js 빌드 (정적 파일 생성)
3. **S3 업로드**
   - `out/` 폴더의 모든 파일 업로드
   - 캐시 헤더 설정
4. **CloudFront 무효화**
   - 기존 캐시 삭제
   - 새 파일 배포

## 🌍 환경별 배포

### Development

```bash
# develop 브랜치에 push
git push origin develop
```

### Production

```bash
# main 브랜치에 push
git push origin main
```

## 🔍 배포 확인

### 1. GitHub Actions 로그 확인

GitHub → Actions → 최근 워크플로우 확인

### 2. CloudFront URL 접속

```
https://d111111abcdef8.cloudfront.net
```

### 3. 브라우저 개발자 도구

- Network 탭에서 파일 로딩 확인
- Console에서 에러 확인

## 🐛 트러블슈팅

### 문제 1: 404 에러 (페이지 새로고침 시)

**원인:** SPA 라우팅 문제

**해결:** CloudFront에서 404/403 → index.html로 리다이렉트 설정됨 (Terraform에 포함)

### 문제 2: 캐시 문제 (변경사항이 반영 안 됨)

**해결:**

```bash
# CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"

# 또는 브라우저 강제 새로고침
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

### 문제 3: API 호출 실패

**확인사항:**
1. 환경 변수가 올바르게 설정되었는지
2. CORS 설정이 올바른지
3. API 서버가 실행 중인지

## 📈 모니터링

### CloudFront 메트릭

AWS Console → CloudFront → Monitoring

- Requests
- Bytes Downloaded
- Error Rate
- Cache Hit Rate

### S3 메트릭

AWS Console → S3 → Metrics

- Storage
- Requests
- Data Transfer

## 💰 비용 최적화

### CloudFront 캐시 설정

```
# 정적 파일 (JS, CSS, 이미지)
Cache-Control: public, max-age=31536000, immutable

# HTML 파일
Cache-Control: public, max-age=0, must-revalidate
```

### S3 Lifecycle 정책

오래된 버전 자동 삭제 (선택사항)

## 🔐 보안

### S3 버킷

- ✅ 공개 액세스 차단
- ✅ CloudFront OAC를 통해서만 접근
- ✅ 버킷 정책으로 접근 제어

### CloudFront

- ✅ HTTPS 강제 (HTTP → HTTPS 리다이렉트)
- ✅ 최신 TLS 버전 사용
- ✅ 보안 헤더 추가 (선택사항)

## 📚 참고 자료

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [AWS CloudFront](https://docs.aws.amazon.com/cloudfront/)
- [GitHub Actions](https://docs.github.com/en/actions)
