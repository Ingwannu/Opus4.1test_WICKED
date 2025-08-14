# TeamWicked.me 도메인 설정 가이드

## 현재 상황
- ✅ 서버가 `http://119.202.156.3:50012`에서 정상 작동 중
- ❌ `http://teamwicked.me`로 접속 불가

## 필요한 설정 (호스트 서버 관리자가 수행해야 함)

### 1단계: DNS 설정
도메인 등록업체(가비아, 후이즈 등)에서 다음 설정을 추가하세요:

```
A 레코드: teamwicked.me → 119.202.156.3
A 레코드: www.teamwicked.me → 119.202.156.3
```

### 2단계: 프테로닥틸 호스트 서버에서 Nginx 설정

프테로닥틸이 설치된 **호스트 서버**에 SSH로 접속하여 다음 작업을 수행하세요:

#### 1. Nginx 설치
```bash
sudo apt update
sudo apt install nginx -y
```

#### 2. Nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/sites-available/teamwicked
```

다음 내용을 붙여넣기:
```nginx
server {
    listen 80;
    server_name teamwicked.me www.teamwicked.me;

    location / {
        proxy_pass http://127.0.0.1:50012;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }
}
```

#### 3. 설정 활성화
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/teamwicked /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

#### 4. 방화벽 설정
```bash
# HTTP(80) 포트 열기
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 50012/tcp
```

### 3단계: SSL 인증서 설정 (HTTPS 사용 시)

#### Let's Encrypt 설치 및 설정
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d teamwicked.me -d www.teamwicked.me
```

프롬프트에 따라:
- 이메일 주소 입력
- 약관 동의 (A)
- 이메일 수신 여부 선택
- HTTPS 리다이렉트 설정 (2번 선택 권장)

### 4단계: 프테로닥틸 네트워크 모드 확인

프테로닥틸 패널에서:
1. 서버 설정으로 이동
2. Network 탭 확인
3. 다음 사항 확인:
   - Primary Allocation: 50012
   - IP Address: 0.0.0.0 또는 127.0.0.1

### 문제 해결

#### 1. 도메인이 여전히 작동하지 않는 경우
```bash
# DNS 전파 확인 (호스트 서버에서)
dig teamwicked.me
nslookup teamwicked.me

# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

#### 2. 502 Bad Gateway 오류
- 프테로닥틸 서버가 실행 중인지 확인
- 포트 번호가 올바른지 확인
- 프테로닥틸 네트워크 설정 확인

#### 3. 연결 거부 오류
```bash
# 포트가 열려있는지 확인
sudo netstat -tlnp | grep 50012
sudo ss -tlnp | grep 50012
```

### 5단계: 애플리케이션 설정 확인

`/workspace/wicked-website/index.js`에서 이미 설정됨:
- ✅ CORS에 teamwicked.me 도메인 추가
- ✅ 0.0.0.0에서 수신하도록 설정
- ✅ 프록시 신뢰 설정 추가

## 요약

**프테로닥틸 호스트 서버 관리자가 수행해야 할 작업:**
1. DNS A 레코드 설정
2. Nginx 리버스 프록시 설정
3. 방화벽 포트 개방
4. (선택) SSL 인증서 설정

이 작업들은 프테로닥틸 컨테이너 내부가 아닌 **호스트 서버**에서 수행되어야 합니다.