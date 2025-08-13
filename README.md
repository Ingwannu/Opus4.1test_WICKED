# WICKED Website

WICKED Team의 공식 웹사이트 - Discord 봇 & 소프트웨어 개발 서비스

## 🚀 기능

- 사용자 인증 및 프로필 관리
- Discord 봇 호스팅 서비스
- 관리자 대시보드
- 보안 강화 (Helmet, CORS, Rate Limiting)
- 실시간 애니메이션 효과

## 📋 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- SQLite3

## 🛠️ 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/yourusername/Opus4.1test_WICKED.git
cd Opus4.1test_WICKED/wicked-website
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 값 설정
```

4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 🦖 프테로닥틸(Pterodactyl) 패널 설정

### 1. Startup Command
```bash
bash start.sh
```

### 2. 환경 변수 설정
프테로닥틸 패널에서 다음 환경 변수를 설정하세요:
- `PORT`: 할당된 포트 번호
- `HOST`: 0.0.0.0
- `ADMIN_USERNAME`: 관리자 사용자명
- `ADMIN_PASSWORD`: 관리자 비밀번호 (반드시 변경!)
- `JWT_SECRET`: 랜덤한 시크릿 키

### 3. 포트 설정
- 프테로닥틸에서 할당받은 포트가 외부에서 접근 가능한지 확인
- 방화벽 설정에서 해당 포트가 열려있는지 확인

### 4. 접속 방법
```
http://서버IP:포트번호
예시: http://119.202.156.3:50012
```

## 🔧 환경 변수

`.env.example` 파일을 참고하여 다음 환경 변수를 설정하세요:

- `NODE_ENV`: 실행 환경 (development/production)
- `PORT`: 서버 포트 (기본값: 3000)
- `HOST`: 서버 호스트 (기본값: localhost, 프테로닥틸: 0.0.0.0)
- `ADMIN_USERNAME`: 관리자 사용자명
- `ADMIN_EMAIL`: 관리자 이메일
- `ADMIN_PASSWORD`: 관리자 비밀번호
- `JWT_SECRET`: JWT 토큰 시크릿 키
- `JWT_EXPIRES_IN`: JWT 토큰 만료 시간

## 📁 프로젝트 구조

```
wicked-website/
├── config/         # 설정 파일
├── middleware/     # Express 미들웨어
├── models/         # Sequelize 모델
├── routes/         # API 라우트
├── utils/          # 유틸리티 함수
├── public/         # 정적 파일
├── uploads/        # 업로드된 파일
└── index.js        # 메인 서버 파일
```

## 🔒 보안

- Helmet.js를 사용한 보안 헤더
- CORS 설정
- Rate limiting
- JWT 기반 인증
- bcrypt를 사용한 비밀번호 해싱

## ⚠️ 주의사항

1. 프로덕션 환경에서는 반드시 `.env` 파일의 기본 비밀번호와 시크릿 키를 변경하세요!
2. `uploads` 디렉토리에 적절한 권한이 설정되어 있는지 확인하세요.
3. 데이터베이스 파일은 Git에 포함되지 않으므로 백업을 주기적으로 수행하세요.

## 🧪 테스트

```bash
npm test
```

## 📝 라이선스

ISC License