# TeamWicked.me 도메인 설정 가이드 (Pterodactyl)

## 🔧 프테로닥틸 환경에서의 도메인 설정

프테로닥틸 패널에서 실행되는 Node.js 앱을 teamwicked.me 도메인으로 접속하려면 **프테로닥틸 호스트 서버**에서 리버스 프록시 설정이 필요합니다.

## 📋 설정 단계

### 1단계: 프테로닥틸에서 할당된 포트 확인

프테로닥틸 패널에서:
1. 서버 콘솔로 이동
2. "Settings" 또는 "Configuration" 탭 확인
3. 할당된 포트 번호 확인 (예: 50012)

### 2단계: 코드 설정 (✅ 이미 완료됨)

다음 설정이 이미 적용되었습니다:

- `index.js`: 프테로닥틸 환경 변수 사용하도록 수정
- CORS에 teamwicked.me 도메인 추가
- 모든 네트워크 인터페이스(0.0.0.0)에서 수신

### 3단계: 프테로닥틸 호스트 서버 설정 (서버 관리자가 수행)

**중요**: 이 단계는 프테로닥틸 **호스트 서버**에 SSH 접속 권한이 있는 관리자가 수행해야 합니다.

#### A. Nginx 설치 및 설정

```bash
# 호스트 서버에서 실행
sudo apt update
sudo apt install nginx -y

# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/teamwicked
```

다음 내용 추가:
```nginx
server {
    listen 80;
    server_name teamwicked.me www.teamwicked.me;

    location / {
        proxy_pass http://119.202.156.3:50012;  # 프테로닥틸 할당 포트
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 사이트 활성화
sudo ln -s /etc/nginx/sites-available/teamwicked /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### B. SSL 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d teamwicked.me -d www.teamwicked.me
```

### 4단계: 방화벽 설정

호스트 서버에서:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 50012/tcp  # 프테로닥틸 할당 포트
```

## 🚀 프테로닥틸 내부에서 앱 실행

프테로닥틸 콘솔에서:

```bash
# 의존성 설치
npm install

# 앱 실행
npm start
# 또는
node index.js
```

## ⚠️ 중요 사항

1. **포트 제한**: 프테로닥틸 컨테이너는 할당된 포트만 사용 가능
2. **권한 제한**: 컨테이너 내부에서는 시스템 레벨 설정 불가
3. **리버스 프록시**: 반드시 호스트 서버에서 설정 필요

## 🔍 문제 해결

### 앱이 시작되지 않을 때
```bash
# 환경 변수 확인
echo $SERVER_PORT
echo $PORT

# 로그 확인
npm start
```

### 도메인 접속이 안 될 때
1. DNS 설정 확인: `nslookup teamwicked.me`
2. 프테로닥틸 포트가 외부에서 접근 가능한지 확인
3. 호스트 서버의 Nginx 설정 확인

## 📝 환경 변수 (.env)

프테로닥틸 환경에서는 패널에서 설정한 환경 변수가 우선 적용됩니다:

```env
# 프테로닥틸이 자동으로 설정
SERVER_PORT=50012
PORT=50012

# 도메인 설정
FRONTEND_URL=https://teamwicked.me
DOMAIN_NAME=teamwicked.me
```

## 🎯 요약

1. **컨테이너 내부** (현재 위치): Node.js 앱 실행
2. **호스트 서버**: Nginx 리버스 프록시 설정
3. **도메인**: teamwicked.me → 119.202.156.3:80/443 → localhost:50012

프테로닥틸 환경에서는 호스트 서버 관리자의 도움이 필요합니다!