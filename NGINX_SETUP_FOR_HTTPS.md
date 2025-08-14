# 🔒 HTTPS 설정하기 (프테로닥틸 호스트 서버에서)

## 프테로닥틸 호스트 서버에서 실행

### 1. Nginx 설치
```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Nginx 설정
```bash
sudo nano /etc/nginx/sites-available/teamwicked
```

다음 내용 입력:
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

### 3. 사이트 활성화
```bash
sudo ln -s /etc/nginx/sites-available/teamwicked /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. 방화벽 설정
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 5. Let's Encrypt SSL 설치
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d teamwicked.me -d www.teamwicked.me
```

### 6. Cloudflare DNS 수정
- 프록시 다시 켜기 (주황색으로)
- 이제 https://teamwicked.me 접속 가능!

## 📌 요약
- **지금**: http://teamwicked.me:50012 사용
- **HTTPS 원하면**: 위 Nginx 설정 필요