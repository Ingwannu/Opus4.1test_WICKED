# Heroku 배포 체크리스트 ✅

## 배포 전 준비사항

### 1. 로컬 환경 테스트
- [ ] 로컬에서 앱이 정상 작동하는지 확인
- [ ] 모든 의존성이 `package.json`에 포함되어 있는지 확인
- [ ] `npm install` 실행 시 오류가 없는지 확인

### 2. Heroku 계정 및 CLI
- [ ] Heroku 계정 생성 완료 (https://signup.heroku.com)
- [ ] Heroku CLI 설치 완료 (https://devcenter.heroku.com/articles/heroku-cli)
- [ ] `heroku login` 명령으로 로그인 완료

### 3. Git 저장소 준비
- [ ] `.gitignore` 파일에 불필요한 파일 제외 설정
- [ ] 모든 변경사항이 커밋되어 있음
- [ ] GitHub 저장소와 연결되어 있음 (선택사항)

## Heroku 앱 생성 및 설정

### 1. 앱 생성
- [ ] `heroku create your-app-name` 또는 대시보드에서 앱 생성
- [ ] 앱 이름이 고유한지 확인

### 2. 필수 환경 변수 설정
- [ ] **JWT_SECRET** 설정 ⚠️ (가장 중요!)
  ```bash
  heroku config:set JWT_SECRET=$(openssl rand -base64 32)
  ```
- [ ] **NODE_ENV** 설정
  ```bash
  heroku config:set NODE_ENV=production
  ```
- [ ] **PostgreSQL 애드온** 추가
  ```bash
  heroku addons:create heroku-postgresql:essential-0
  ```

### 3. 선택적 환경 변수 설정
- [ ] 관리자 계정 정보
  ```bash
  heroku config:set ADMIN_USERNAME=your_username
  heroku config:set ADMIN_EMAIL=your_email@example.com
  heroku config:set ADMIN_PHONE=010-xxxx-xxxx
  heroku config:set ADMIN_PASSWORD=your_secure_password
  ```
- [ ] JWT 만료 시간
  ```bash
  heroku config:set JWT_EXPIRES_IN=7d
  ```
- [ ] 파일 업로드 크기 제한
  ```bash
  heroku config:set MAX_FILE_SIZE=5242880
  ```
- [ ] 프론트엔드 URL (CORS용)
  ```bash
  heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
  ```

## 배포 실행

### 1. 코드 배포
- [ ] Git remote 설정 확인
  ```bash
  git remote -v
  ```
- [ ] Heroku에 코드 푸시
  ```bash
  git push heroku main
  ```
  또는 다른 브랜치 사용 시:
  ```bash
  git push heroku your-branch:main
  ```

### 2. 배포 모니터링
- [ ] 빌드 로그 확인
  ```bash
  heroku logs --tail
  ```
- [ ] 빌드 성공 메시지 확인
- [ ] 오류가 없는지 확인

## 배포 후 확인

### 1. 앱 상태 확인
- [ ] 앱이 실행 중인지 확인
  ```bash
  heroku ps
  ```
- [ ] 웹 다이노가 활성화되어 있는지 확인

### 2. 앱 접속 테스트
- [ ] 브라우저에서 앱 열기
  ```bash
  heroku open
  ```
- [ ] API 엔드포인트 테스트
  ```bash
  curl https://your-app-name.herokuapp.com/api/health
  ```

### 3. 데이터베이스 확인
- [ ] PostgreSQL 연결 상태 확인
  ```bash
  heroku pg:info
  ```
- [ ] 테이블이 생성되었는지 확인
  ```bash
  heroku run node -e "require('./models').sequelize.sync()"
  ```

## 문제 발생 시 대처

### 일반적인 문제들
1. **"Application error" 페이지가 나타날 때**
   - [ ] `heroku logs --tail`로 오류 메시지 확인
   - [ ] JWT_SECRET이 설정되어 있는지 확인
   - [ ] 데이터베이스 연결이 정상인지 확인

2. **빌드 실패**
   - [ ] `package.json`의 `engines` 섹션 확인
   - [ ] 모든 의존성이 `dependencies`에 있는지 확인 (not `devDependencies`)
   - [ ] `Procfile`이 존재하고 올바른지 확인

3. **GitHub 연결 문제**
   - [ ] Heroku 대시보드에서 GitHub 재연결
   - [ ] 저장소 접근 권한 확인

### 디버깅 명령어
```bash
# 환경 변수 전체 확인
heroku config

# 특정 환경 변수 확인
heroku config:get JWT_SECRET

# 앱 재시작
heroku restart

# 콘솔 접속
heroku run bash

# 로그 파일로 저장
heroku logs -n 1000 > debug_logs.txt
```

## 성공 기준

모든 항목이 체크되면 배포가 성공적으로 완료된 것입니다:
- ✅ 앱이 오류 없이 실행 중
- ✅ 웹 페이지가 정상적으로 로드됨
- ✅ API 엔드포인트가 응답함
- ✅ 데이터베이스 연결이 정상
- ✅ 로그에 심각한 오류가 없음

---

💡 **팁**: 이 체크리스트를 복사해서 사용하고, 각 단계를 완료할 때마다 체크해 나가세요!

마지막 업데이트: 2024년 1월