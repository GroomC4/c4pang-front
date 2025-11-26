# Auth0 설정 가이드

현재 개발 모드에서는 Auth0 오류가 콘솔에 표시되지만 애플리케이션은 정상 작동합니다.
실제 Auth0 연동을 위해서는 다음 단계를 따라하세요:

## 1. Auth0 계정 생성
1. https://auth0.com 방문
2. 무료 계정 생성
3. 새 애플리케이션 생성 (Single Page Application 선택)

## 2. 애플리케이션 설정
### Allowed Callback URLs:
```
http://localhost:3000/api/auth/callback
```

### Allowed Logout URLs:
```
http://localhost:3000
```

### Allowed Web Origins:
```
http://localhost:3000
```

## 3. 환경 변수 설정
`.env.local` 파일의 값을 실제 Auth0 값으로 교체:

```bash
AUTH0_SECRET='32자 이상의 긴 랜덤 문자열'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='실제 클라이언트 ID'
AUTH0_CLIENT_SECRET='실제 클라이언트 시크릿'
```

## 4. Auth0 Domain 찾기
Auth0 대시보드에서:
- Domain: `your-domain.auth0.com` 형태
- Client ID: Applications > Settings에서 확인
- Client Secret: Applications > Settings에서 확인

## 현재 상태
- ✅ UI 구현 완료
- ✅ Auth0 SDK 연동 완료
- ⚠️  실제 Auth0 계정 설정 필요
- ✅ 개발 모드에서 UI 테스트 가능

## 테스트 가능한 기능
- 메인 페이지 UI
- 로그인 페이지 디자인
- 회원가입 페이지 디자인
- 비밀번호 찾기 페이지 디자인
- 반응형 레이아웃