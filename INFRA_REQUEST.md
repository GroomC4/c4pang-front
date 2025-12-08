# 인프라 생성 요청서 (c4pang-front)

프론트엔드 배포(S3 + CloudFront)를 위한 Terraform 리소스 생성 요청 사항입니다.

## 1. 개요
- **서비스명**: c4pang-front
- **배포 방식**: Next.js Static Export -> S3 업로드 -> CloudFront 배포
- **도메인**: (기존 도메인 정책을 따름, 예: `www.c4pang.com` 또는 `front.c4pang.com`)

## 2. Terraform 리소스 요구사항

### A. S3 Bucket (Static Website Hosting)
- **Status**: ✅ Created
- **Bucket Name**: `c4-front`
- **Public Access**: CloudFront OAI(Origin Access Identity) 또는 OAC(Origin Access Control)를 통해서만 접근 가능하도록 설정 (Block Public Access: True)
- **Encryption**: SSE-S3 또는 KMS (기본 암호화)

### B. CloudFront Distribution
- **Origin**: 위에서 생성한 S3 Bucket
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Default Root Object**: `index.html`
- **Custom Error Response** (SPA 라우팅 지원을 위해 필수):
  - **Error Code**: 403, 404
  - **Response Page Path**: `/index.html` (또는 `/404.html`)
  - **Response Code**: 200
- **Caching Policy**: Managed-CachingOptimized (권장)
- **OAI/OAC**: S3 버킷 정책 업데이트 권한 포함

### C. IAM Role (GitHub Actions OIDC 연동용)
CI/CD 파이프라인에서 배포를 수행하기 위해 다음 권한이 있는 IAM Role이 필요합니다.
- **Role Name**: (기존 Role 사용 시 정책 추가, 신규 시 `c4pang-front-deploy-role` 등)
- **Trust Relationship**: GitHub Actions OIDC Provider (`token.actions.githubusercontent.com`)
  - `repo:GroomC4/c4pang-front:ref:refs/heads/main`
- **Permissions (Policy)**:
  ```json
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": [
                  "s3:PutObject",
                  "s3:GetObject",
                  "s3:ListBucket",
                  "s3:DeleteObject"
              ],
              "Resource": [
                  "arn:aws:s3:::c4pang-front-prod",
                  "arn:aws:s3:::c4pang-front-prod/*"
              ]
          },
          {
              "Effect": "Allow",
              "Action": [
                  "cloudfront:CreateInvalidation"
              ],
              "Resource": [
                  "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
              ]
          }
      ]
  }
  ```

## 3. 전달 필요한 출력값 (Outputs)
배포 설정에 필요하므로 생성 후 다음 정보를 공유 부탁드립니다.
1.  **S3 Bucket Name**
2.  **CloudFront Distribution ID**
3.  **IAM Role ARN** (신규 생성 시)
