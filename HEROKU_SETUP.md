# Heroku 환경변수 설정 가이드

## 필수 환경변수 설정

Heroku CLI를 사용하여 다음 환경변수들을 설정해야 합니다:

### 1. 데이터베이스 설정
```bash
# PostgreSQL 애드온 추가 (무료 플랜)
heroku addons:create heroku-postgresql:essential-0

# DATABASE_URL은 자동으로 설정됩니다
```

### 2. JWT 시크릿 키 설정 (필수!)
```bash
# 강력한 랜덤 시크릿 키 생성 및 설정
heroku config:set JWT_SECRET=$(openssl rand -base64 32)

# 또는 직접 설정
heroku config:set JWT_SECRET=your-very-strong-secret-key-here
```

### 3. 관리자 계정 설정
```bash
heroku config:set ADMIN_USERNAME=your-admin-username
heroku config:set ADMIN_EMAIL=your-admin@email.com
heroku config:set ADMIN_PHONE=your-phone-number
heroku config:set ADMIN_PASSWORD=your-strong-password
```

### 4. 애플리케이션 환경 설정
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set MAX_FILE_SIZE=5242880
```

### 5. 프론트엔드 URL 설정 (CORS 용)
```bash
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
```

## 설정 확인
```bash
# 모든 환경변수 확인
heroku config

# 특정 환경변수 확인
heroku config:get JWT_SECRET
```

## 배포 및 실행

### 1. Git으로 Heroku에 배포
```bash
git add .
git commit -m "Update for Heroku deployment"
git push heroku main
```

### 2. 데이터베이스 마이그레이션
```bash
# 앱이 시작되면 자동으로 데이터베이스가 동기화됩니다
# 로그 확인
heroku logs --tail
```

### 3. 앱 재시작 (필요시)
```bash
heroku restart
```

## 문제 해결

### 1. 접속이 안 되는 경우
```bash
# 앱 상태 확인
heroku ps

# 로그 확인
heroku logs --tail

# 앱 재시작
heroku restart
```

### 2. 데이터베이스 연결 문제
```bash
# PostgreSQL 상태 확인
heroku pg:info

# 데이터베이스 재설정 (주의: 모든 데이터 삭제)
heroku pg:reset DATABASE_URL --confirm your-app-name
```

### 3. JWT 관련 오류
- JWT_SECRET이 설정되어 있는지 확인
- 로그에서 "CRITICAL ERROR: JWT_SECRET is not set" 메시지 확인

### 4. 포트 문제
- Heroku는 자동으로 PORT 환경변수를 설정합니다
- 코드에서 `process.env.PORT`를 우선적으로 사용하도록 설정되어 있습니다

## 주요 변경사항

1. **dotenv 제거**: Heroku에서는 환경변수를 직접 관리하므로 dotenv가 필요 없습니다
2. **PostgreSQL 지원**: Heroku의 파일 시스템은 임시적이므로 SQLite 대신 PostgreSQL을 사용합니다
3. **SSL 설정**: Heroku PostgreSQL은 SSL 연결이 필요합니다
4. **JWT 보안**: production 환경에서는 JWT_SECRET이 반드시 설정되어야 합니다

## 모니터링

```bash
# 실시간 로그 확인
heroku logs --tail

# 앱 메트릭 확인
heroku ps

# 데이터베이스 상태
heroku pg:info
```