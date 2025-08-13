# WICKED Website

WICKED Team의 공식 웹사이트 - Discord 봇 & 소프트웨어 개발 서비스

## 🚀 기능

- 사용자 인증 및 프로필 관리
- Discord 봇 호스팅 서비스
- 관리자 대시보드
- 보안 강화 (Helmet, CORS, Rate Limiting)

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

## 🔧 환경 변수

`.env.example` 파일을 참고하여 다음 환경 변수를 설정하세요:

- `NODE_ENV`: 실행 환경 (development/production)
- `PORT`: 서버 포트 (기본값: 3000)
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
└── index.js        # 메인 서버 파일
```

## 🔒 보안

- Helmet.js를 사용한 보안 헤더
- CORS 설정
- Rate limiting
- JWT 기반 인증
- bcrypt를 사용한 비밀번호 해싱

## 🧪 테스트

```bash
npm test
```

## 📝 라이선스

ISC License