# Pterodactyl HTTP 환경 문제 해결 가이드

## 문제 설명

1. **CSS 로드 문제**: HTTP 환경에서 CSS 파일이 제대로 로드되지 않음
2. **전화번호 유효성 검사 오류**: 한국 전화번호 형식이 제대로 인식되지 않음
3. **보안 연결 경고**: HTTPS가 아닌 HTTP 환경에서 보안 경고 발생

## 해결 방법

### 1. 새로운 시작 스크립트 사용

프테로닥틸 패널에서 시작 명령어를 다음과 같이 변경하세요:

```bash
bash pterodactyl-start.sh
```

또는 직접 HTTP 버전을 실행:

```bash
node pterodactyl-http-fix.js
```

### 2. 환경 변수 설정 (프테로닥틸 패널에서)

프테로닥틸 패널의 Startup 탭에서 다음 환경 변수를 설정하세요:

- `ADMIN_USERNAME`: 관리자 계정 이름 (기본값: admin)
- `ADMIN_EMAIL`: 관리자 이메일
- `ADMIN_PHONE`: 관리자 전화번호 (형식: 010-1234-5678)
- `ADMIN_PASSWORD`: 관리자 비밀번호
- `JWT_SECRET`: JWT 토큰용 비밀 키 (32자 이상의 랜덤 문자열)

### 3. 수정된 파일들

- `models/User.js`: 한국 전화번호 형식 지원 개선
- `index.js`: CSS 로드 문제 해결을 위한 디버깅 로그 추가
- `pterodactyl-http-fix.js`: HTTP 환경을 위한 보안 설정 완화
- `utils/seed.js`: 환경 변수 없을 때 오류 방지

### 4. 접속 주소

- **외부 접속**: http://119.202.156.3:50012
- **도메인 접속**: https://teamwicked.me (SSL 인증서 필요)

### 5. 디버깅 방법

콘솔 로그에서 다음을 확인하세요:

```
[STATIC FILE REQUEST] - 정적 파일 요청 로그
[STATIC SERVED] - 정적 파일 서빙 로그
```

CSS가 제대로 로드되지 않는다면:
1. 브라우저 개발자 도구에서 Network 탭 확인
2. CSS 파일의 Content-Type 헤더 확인
3. 404 에러가 발생하는지 확인

### 6. 보안 관련 참고사항

HTTP 환경에서는 다음 보안 기능이 비활성화됩니다:
- Content Security Policy (CSP)
- Cross-Origin Opener Policy
- HTTPS 강제 리다이렉션

프로덕션 환경에서는 반드시 HTTPS를 사용하세요.

### 7. 문제가 지속될 경우

1. 서버 재시작
2. 캐시 삭제 (브라우저 및 서버)
3. `node_modules` 삭제 후 재설치:
   ```bash
   rm -rf node_modules
   npm install
   ```

### 8. 테스트 방법

1. http://119.202.156.3:50012 접속
2. 페이지가 정상적으로 스타일이 적용되어 표시되는지 확인
3. 개발자 도구에서 콘솔 에러 확인
4. 회원가입 시 전화번호 입력 테스트 (010-1234-5678 형식)