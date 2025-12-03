#!/usr/bin/env node

/**
 * 프론트엔드 <-> 챗봇 API 연동 테스트
 * 
 * 이 스크립트는 다음을 확인합니다:
 * 1. 챗봇 API 서버가 실행 중인지
 * 2. Health check 엔드포인트 응답
 * 3. 메시지 전송 API 테스트
 * 4. CORS 설정 확인
 */

const http = require('http');

// 환경 변수에서 챗봇 URL 가져오기
const CHATBOT_URL = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000';

console.log('🔍 챗봇 API 연동 테스트 시작...\n');
console.log(`📍 챗봇 URL: ${CHATBOT_URL}\n`);

// HTTP 요청 헬퍼 함수
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 1. Health Check 테스트
async function testHealthCheck() {
  console.log('1️⃣  Health Check 테스트...');
  
  try {
    const url = new URL('/api/v1/chatbot/health', CHATBOT_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Health Check 성공');
      console.log('   📦 응답:', JSON.stringify(response.body, null, 2));
      return true;
    } else {
      console.log(`   ❌ Health Check 실패 (상태 코드: ${response.statusCode})`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Health Check 실패:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 챗봇 서버가 실행되지 않았습니다.');
      console.log('   💡 다음 명령어로 서버를 시작하세요:');
      console.log('      cd c4ang-chatbot && python main.py');
    }
    return false;
  }
}

// 2. 메시지 전송 테스트
async function testSendMessage() {
  console.log('\n2️⃣  메시지 전송 테스트...');
  
  try {
    const url = new URL('/api/v1/chatbot/message', CHATBOT_URL);
    const testMessage = {
      user_id: 'test_user',
      session_id: 'test_session_' + Date.now(),
      message: '안녕하세요! 향수 추천해주세요',
      timestamp: new Date().toISOString()
    };
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    };
    
    console.log('   📤 요청 데이터:', JSON.stringify(testMessage, null, 2));
    
    const response = await makeRequest(options, testMessage);
    
    if (response.statusCode === 200) {
      console.log('   ✅ 메시지 전송 성공');
      console.log('   📦 응답:', JSON.stringify(response.body, null, 2));
      
      // CORS 헤더 확인
      if (response.headers['access-control-allow-origin']) {
        console.log('   ✅ CORS 설정 확인됨:', response.headers['access-control-allow-origin']);
      } else {
        console.log('   ⚠️  CORS 헤더가 없습니다.');
      }
      
      return true;
    } else {
      console.log(`   ❌ 메시지 전송 실패 (상태 코드: ${response.statusCode})`);
      console.log('   📦 응답:', JSON.stringify(response.body, null, 2));
      return false;
    }
  } catch (error) {
    console.log('   ❌ 메시지 전송 실패:', error.message);
    return false;
  }
}

// 3. 루트 엔드포인트 테스트
async function testRootEndpoint() {
  console.log('\n3️⃣  루트 엔드포인트 테스트...');
  
  try {
    const url = new URL('/', CHATBOT_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('   ✅ 루트 엔드포인트 접근 성공');
      console.log('   📦 응답:', JSON.stringify(response.body, null, 2));
      return true;
    } else {
      console.log(`   ❌ 루트 엔드포인트 접근 실패 (상태 코드: ${response.statusCode})`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ 루트 엔드포인트 접근 실패:', error.message);
    return false;
  }
}

// 메인 테스트 실행
async function runTests() {
  const results = {
    root: false,
    health: false,
    message: false
  };
  
  results.root = await testRootEndpoint();
  results.health = await testHealthCheck();
  
  // Health check가 성공한 경우에만 메시지 테스트 실행
  if (results.health) {
    results.message = await testSendMessage();
  }
  
  // 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(50));
  console.log(`루트 엔드포인트:  ${results.root ? '✅ 성공' : '❌ 실패'}`);
  console.log(`Health Check:     ${results.health ? '✅ 성공' : '❌ 실패'}`);
  console.log(`메시지 전송:      ${results.message ? '✅ 성공' : '❌ 실패'}`);
  console.log('='.repeat(50));
  
  const allPassed = results.root && results.health && results.message;
  
  if (allPassed) {
    console.log('\n🎉 모든 테스트 통과! 프론트엔드와 챗봇이 정상적으로 연동되었습니다.');
  } else {
    console.log('\n⚠️  일부 테스트가 실패했습니다.');
    
    if (!results.root && !results.health) {
      console.log('\n💡 해결 방법:');
      console.log('   1. 챗봇 서버가 실행 중인지 확인하세요:');
      console.log('      cd c4ang-chatbot');
      console.log('      python main.py');
      console.log('');
      console.log('   2. 환경 변수가 올바른지 확인하세요:');
      console.log('      NEXT_PUBLIC_CHATBOT_URL=' + CHATBOT_URL);
    }
  }
  
  process.exit(allPassed ? 0 : 1);
}

// 테스트 실행
runTests().catch((error) => {
  console.error('\n❌ 테스트 실행 중 오류 발생:', error);
  process.exit(1);
});
