# Heroku 배포 실패 해결 가이드

## 문제 진단

현재 Heroku 배포가 실패한 이유는 다음과 같습니다:

1. **JWT_SECRET 환경 변수 미설정** (가장 가능성 높음)
2. PostgreSQL 데이터베이스 미설정
3. GitHub 연결 권한 문제

## 즉시 해결 방법

### 1단계: Heroku CLI 로그인
```bash
heroku login
```

### 2단계: 앱 이름 확인
```bash
heroku apps:info
# 또는 앱 이름을 직접 지정
heroku git:remote -a your-app-name
```

### 3단계: 필수 환경 변수 설정

#### JWT_SECRET 설정 (필수!)
```bash
# 강력한 랜덤 시크릿 키 생성 및 설정
heroku config:set JWT_SECRET=$(openssl rand -base64 32)

# Windows에서는:
# 1. https://www.random.org/passwords/?num=1&len=32&format=plain&rnd=new 에서 생성
# 2. heroku config:set JWT_SECRET=생성된-키-여기에-붙여넣기
```

#### PostgreSQL 데이터베이스 추가
```bash
# PostgreSQL 애드온 추가 (무료 플랜)
heroku addons:create heroku-postgresql:essential-0
```

#### 기타 필수 환경 변수 설정
```bash
# 프로덕션 환경 설정
heroku config:set NODE_ENV=production

# 관리자 계정 설정 (선택사항이지만 권장)
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_EMAIL=admin@example.com
heroku config:set ADMIN_PHONE=010-1234-5678
heroku config:set ADMIN_PASSWORD=StrongPassword123!

# JWT 만료 시간 설정
heroku config:set JWT_EXPIRES_IN=7d

# 파일 업로드 크기 제한
heroku config:set MAX_FILE_SIZE=5242880

# 프론트엔드 URL (CORS 설정용)
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
```

### 4단계: 환경 변수 확인
```bash
# 모든 설정된 환경 변수 확인
heroku config

# JWT_SECRET이 설정되었는지 확인
heroku config:get JWT_SECRET
```

### 5단계: 재배포
```bash
# Git 커밋 (변경사항이 있는 경우)
git add .
git commit -m "Fix Heroku deployment configuration"

# Heroku에 푸시
git push heroku main

# 또는 main이 아닌 다른 브랜치를 사용하는 경우
git push heroku your-branch:main
```

### 6단계: 로그 확인
```bash
# 실시간 로그 확인
heroku logs --tail
```

## 추가 문제 해결

### GitHub 연결 문제인 경우

1. Heroku 대시보드로 이동: https://dashboard.heroku.com
2. 해당 앱 선택
3. "Deploy" 탭 클릭
4. "Deployment method"에서 GitHub 선택
5. "Disconnect" 후 다시 "Connect to GitHub" 클릭
6. 권한 재인증

### 빌드 로그 확인
```bash
# 최근 빌드 로그 확인
heroku builds:info

# 특정 빌드 로그 상세 확인
heroku builds:output
```

### 앱 재시작
```bash
# 앱 재시작
heroku restart

# 앱 상태 확인
heroku ps
```

## 체크리스트

- [ ] JWT_SECRET 환경 변수 설정됨
- [ ] PostgreSQL 애드온 추가됨
- [ ] NODE_ENV=production 설정됨
- [ ] 관리자 계정 정보 설정됨
- [ ] GitHub 연결 확인됨
- [ ] 빌드 성공 확인됨
- [ ] 앱이 정상적으로 실행 중

## 여전히 문제가 있다면?

1. 전체 로그 확인:
```bash
heroku logs -n 500 > heroku_logs.txt
```

2. 로컬에서 프로덕션 환경 테스트:
```bash
NODE_ENV=production npm start
```

3. Heroku 지원 티켓 생성:
- https://help.heroku.com/

## 성공적인 배포 확인

배포가 성공하면 다음과 같이 확인할 수 있습니다:

```bash
# 앱 URL 확인
heroku open

# API 상태 확인
curl https://your-app-name.herokuapp.com/api/health
```

마지막 업데이트: 2024년 1월