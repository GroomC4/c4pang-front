/**
 * API 프록시 설정 테스트 스크립트
 * 
 * 이 스크립트는 Next.js 개발 서버가 실행 중일 때
 * 프록시가 올바르게 백엔드로 요청을 전달하는지 테스트합니다.
 */

const http = require('http');

const FRONTEND_URL = 'http://localhost:3000';
const TEST_PATH = '/api/v1/chatbot/health';

console.log('🔍 API 프록시 테스트 시작...\n');
console.log(`프론트엔드 URL: ${FRONTEND_URL}`);
console.log(`테스트 경로: ${TEST_PATH}\n`);

// 헬스 체크 요청
const options = {
  hostname: 'localhost',
  port: 3000,
  path: TEST_PATH,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';

  console.log(`✅ 응답 상태 코드: ${res.statusCode}`);
  console.log(`📋 응답 헤더:`, res.headers);
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('📦 응답 데이터:', JSON.stringify(jsonData, null, 2));
      
      if (jsonData.status === 'healthy' && jsonData.service === 'c4ang-chatbot') {
        console.log('\n✅ 프록시 테스트 성공!');
        console.log('   - 프론트엔드가 백엔드로 요청을 올바르게 전달했습니다.');
        console.log('   - 백엔드가 정상적으로 응답했습니다.');
        process.exit(0);
      } else {
        console.log('\n⚠️  예상치 못한 응답 형식입니다.');
        process.exit(1);
      }
    } catch (error) {
      console.error('\n❌ JSON 파싱 실패:', error.message);
      console.log('원본 응답:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ 요청 실패:', error.message);
  console.log('\n💡 확인 사항:');
  console.log('   1. Next.js 개발 서버가 실행 중인가요? (npm run dev)');
  console.log('   2. 백엔드 서버가 실행 중인가요? (포트 8000)');
  console.log('   3. .env.local 파일이 올바르게 설정되어 있나요?');
  process.exit(1);
});

req.end();
