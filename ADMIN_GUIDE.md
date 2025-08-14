# 🔧 TeamWicked.me 도메인 설정 가이드 (관리자용)

## 빠른 실행 방법

### 1️⃣ 프테로닥틸 호스트 서버에 SSH 접속
```bash
ssh root@119.202.156.3
```

### 2️⃣ 설정 스크립트 다운로드 및 실행
```bash
# 스크립트 다운로드 (프테로닥틸 호스트 서버에서)
wget https://raw.githubusercontent.com/[your-repo]/host-server-setup.sh
# 또는 수동으로 복사

# 실행
sudo bash host-server-setup.sh
```

### 3️⃣ 프테로닥틸 패널에서 서버 시작
- 프테로닥틸 패널 접속
- 해당 서버로 이동
- "Start" 버튼 클릭

## 수동 설정 (스크립트 없이)

### Step 1: Nginx 설치
```bash
sudo apt update
sudo apt install nginx -y
```

### Step 2: Nginx 설정
```bash
sudo nano /etc/nginx/sites-available/teamwicked.me
```

다음 내용 붙여넣기:
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
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

활성화:
```bash
sudo ln -s /etc/nginx/sites-available/teamwicked.me /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 3: SSL 설정
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d teamwicked.me -d www.teamwicked.me
```

### Step 4: 방화벽
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 50012/tcp
```

## 🔍 확인사항

- [ ] DNS A 레코드: teamwicked.me → 119.202.156.3
- [ ] 프테로닥틸에서 Node.js 서버 실행 중
- [ ] 포트 50012 열려있음
- [ ] Nginx 실행 중: `sudo systemctl status nginx`

## 📞 문제 해결

```bash
# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# 포트 확인
sudo netstat -tuln | grep 50012

# SSL 인증서 확인
sudo certbot certificates
```

완료되면 https://teamwicked.me 로 접속 가능!