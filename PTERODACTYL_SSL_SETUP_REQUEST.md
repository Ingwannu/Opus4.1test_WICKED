# 프테로닥틸 호스트 서버 SSL 설정 요청서

## 요청 사항
포트 50012로 실행 중인 Node.js 서버에 대한 HTTPS 설정을 요청합니다.

## 서버 정보
- **컨테이너 포트**: 50012
- **도메인**: teamwicked.me
- **현재 접속 주소**: http://119.202.156.3:50012

## 필요한 설정

### 1. Nginx 리버스 프록시 설정

```nginx
server {
    listen 80;
    server_name teamwicked.me www.teamwicked.me;

    location / {
        proxy_pass http://localhost:50012;
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

### 2. SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d teamwicked.me -d www.teamwicked.me
```

### 3. 방화벽 설정

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 대안: IP 주소에 대한 자체 서명 인증서

도메인 설정이 어려운 경우:

```bash
# 자체 서명 인증서 생성
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/pterodactyl.key \
  -out /etc/ssl/certs/pterodactyl.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=TeamWicked/CN=119.202.156.3"

# Nginx HTTPS 설정
server {
    listen 443 ssl;
    server_name 119.202.156.3;

    ssl_certificate /etc/ssl/certs/pterodactyl.crt;
    ssl_certificate_key /etc/ssl/private/pterodactyl.key;

    location / {
        proxy_pass http://localhost:50012;
        # ... 기타 프록시 설정
    }
}
```

감사합니다.