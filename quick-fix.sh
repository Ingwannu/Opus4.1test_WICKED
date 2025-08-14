#!/bin/bash

echo "🔧 TeamWicked SSL 문제 빠른 해결"
echo ""

# 1. DNS 확인
echo "📍 DNS 상태 확인..."
echo "teamwicked.me:"
nslookup teamwicked.me | grep -A1 "Address:" | tail -1
echo ""
echo "www.teamwicked.me:"
nslookup www.teamwicked.me | grep -A1 "Address:" | tail -1
echo ""

if nslookup www.teamwicked.me | grep -q "185.199"; then
    echo "❌ 문제: www.teamwicked.me이 GitHub Pages IP(185.199.x.x)를 가리키고 있습니다!"
    echo ""
    echo "📝 해결방법:"
    echo "1. Namecheap 로그인"
    echo "2. teamwicked.me → Manage → Advanced DNS"
    echo "3. www 레코드를 다음과 같이 수정:"
    echo "   Type: A Record"
    echo "   Host: www"
    echo "   Value: 119.202.156.3"
    echo "   TTL: Automatic"
    echo ""
    echo "DNS 수정 후 5-10분 기다린 다음 이 스크립트를 다시 실행하세요."
    exit 1
fi

# 2. Nginx 설정 수정
echo "✅ DNS가 올바르게 설정되어 있습니다. Nginx 설정 중..."

# Nginx 설정 백업
sudo cp /etc/nginx/sites-available/teamwicked.me /etc/nginx/sites-available/teamwicked.me.backup 2>/dev/null

# 새 설정 작성
sudo tee /etc/nginx/sites-available/teamwicked.me > /dev/null <<'EOF'
server {
    listen 80;
    server_name teamwicked.me www.teamwicked.me;

    # Let's Encrypt 인증 경로
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    # 나머지 모든 요청은 프테로닥틸로
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
EOF

# 웹루트 디렉토리 생성
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chmod -R 755 /var/www/html

# Nginx 재시작
sudo nginx -t && sudo systemctl reload nginx

# 3. SSL 인증서 발급
echo ""
echo "🔒 SSL 인증서 발급 시작..."
echo "이메일 주소를 입력하세요 (Let's Encrypt 알림용):"
read -r email

# 인증서 발급 (standalone 대신 webroot 사용)
sudo certbot certonly --webroot -w /var/www/html \
    -d teamwicked.me -d www.teamwicked.me \
    --non-interactive --agree-tos --email "$email"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL 인증서 발급 성공! HTTPS 설정 중..."
    
    # HTTPS 설정
    sudo tee /etc/nginx/sites-available/teamwicked.me > /dev/null <<'EOF'
server {
    listen 80;
    server_name teamwicked.me www.teamwicked.me;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name teamwicked.me www.teamwicked.me;
    
    ssl_certificate /etc/letsencrypt/live/teamwicked.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/teamwicked.me/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
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
EOF
    
    sudo nginx -t && sudo systemctl reload nginx
    
    echo ""
    echo "🎉 완료! https://teamwicked.me 로 접속하세요!"
else
    echo ""
    echo "❌ SSL 인증서 발급 실패!"
    echo "로그 확인: sudo cat /var/log/letsencrypt/letsencrypt.log"
fi