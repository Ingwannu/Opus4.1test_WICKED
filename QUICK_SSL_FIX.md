# 🚀 프테로닥틸 SSL 빠른 해결책

## 방법 1: Cloudflare (추천) ⭐
가장 쉽고 무료입니다!

1. **Cloudflare 가입** → [cloudflare.com](https://cloudflare.com)
2. **도메인 추가** → teamwicked.me
3. **DNS 설정**:
   ```
   A레코드: @ → 119.202.156.3 (Proxy ON)
   A레코드: www → 119.202.156.3 (Proxy ON)
   ```
4. **Namecheap에서 네임서버 변경**
5. **SSL 모드: Flexible 선택** (중요!)
6. 끝! 30분 후 https://teamwicked.me 접속 가능

## 방법 2: 자체 서명 인증서 (즉시 가능)
브라우저 경고는 뜨지만 작동합니다.

```bash
# 프테로닥틸 호스트 서버에서 실행
cd /etc/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout private/pterodactyl.key \
  -out certs/pterodactyl.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=TeamWicked/CN=119.202.156.3"

# Nginx 설정 (이미 있다면 수정)
sudo nano /etc/nginx/sites-available/pterodactyl
```

```nginx
server {
    listen 443 ssl;
    server_name 119.202.156.3;
    
    ssl_certificate /etc/ssl/certs/pterodactyl.crt;
    ssl_certificate_key /etc/ssl/private/pterodactyl.key;
    
    location / {
        proxy_pass http://localhost:50012;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 방법 3: ngrok (테스트용)
임시로 HTTPS 터널을 만듭니다.

```bash
# ngrok 설치
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# 실행
ngrok http 50012
```

## 🎯 추천 순서
1. **Cloudflare** - 무료, 쉬움, 안정적
2. **자체 서명** - 빠르지만 경고 표시
3. **ngrok** - 테스트용

## ⚠️ 주의사항
- Nginx 설정 전 백업하세요: `sudo cp /etc/nginx/sites-available/pterodactyl{,.backup}`
- 포트 열기: `sudo ufw allow 443/tcp`
- 서버 재시작 후 확인: `sudo systemctl status nginx`