#!/bin/bash

echo "🔧 SSL 인증서 발급 문제 해결 스크립트"
echo ""

# 1. 먼저 DNS 확인
echo "📍 Step 1: DNS 설정 확인"
echo "teamwicked.me DNS 조회 결과:"
nslookup teamwicked.me
echo ""
echo "www.teamwicked.me DNS 조회 결과:"
nslookup www.teamwicked.me
echo ""

echo "⚠️  주의: www.teamwicked.me도 119.202.156.3을 가리켜야 합니다!"
echo "   Namecheap에서 www CNAME 레코드를 A 레코드로 변경하거나"
echo "   www A 레코드를 119.202.156.3으로 설정하세요"
echo ""
echo "계속하시겠습니까? (DNS 설정을 먼저 수정하려면 n을 누르세요) (y/n)"
read -r response

if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "DNS 설정을 먼저 수정해주세요:"
    echo "1. Namecheap 로그인"
    echo "2. teamwicked.me 도메인 관리"
    echo "3. Advanced DNS"
    echo "4. 다음 레코드 추가/수정:"
    echo "   - Type: A Record, Host: @, Value: 119.202.156.3"
    echo "   - Type: A Record, Host: www, Value: 119.202.156.3"
    exit 0
fi

# 2. Nginx 설정 수정
echo ""
echo "📝 Step 2: Nginx 설정 수정"
sudo tee /etc/nginx/sites-available/teamwicked.me > /dev/null <<'EOF'
server {
    listen 80;
    server_name teamwicked.me www.teamwicked.me;

    # Let's Encrypt 인증을 위한 설정
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

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

# 3. 웹루트 디렉토리 생성
echo "📁 Step 3: 웹루트 디렉토리 생성"
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chmod -R 755 /var/www/html

# 4. Nginx 테스트 및 재시작
echo "🔄 Step 4: Nginx 재시작"
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo "✅ Nginx 재시작 완료"
else
    echo "❌ Nginx 설정 오류!"
    exit 1
fi

# 5. 방화벽 확인
echo ""
echo "🔥 Step 5: 방화벽 설정"
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 50012/tcp

# 6. SSL 인증서 발급 (webroot 방식)
echo ""
echo "🔒 Step 6: SSL 인증서 발급 시도"
echo "이메일 주소를 입력하세요:"
read -r email

sudo certbot certonly --webroot -w /var/www/html -d teamwicked.me -d www.teamwicked.me --non-interactive --agree-tos --email $email

if [ $? -eq 0 ]; then
    echo "✅ SSL 인증서 발급 성공!"
    
    # 7. Nginx HTTPS 설정 추가
    echo "📝 Step 7: HTTPS 설정 추가"
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
    ssl_prefer_server_ciphers on;
    
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
    
    sudo nginx -t && sudo systemctl restart nginx
    echo "✅ HTTPS 설정 완료!"
    echo ""
    echo "🎉 모든 설정이 완료되었습니다!"
    echo "   https://teamwicked.me 로 접속해보세요!"
else
    echo "❌ SSL 인증서 발급 실패!"
    echo "다음을 확인해주세요:"
    echo "1. DNS 설정이 올바른지 (특히 www 서브도메인)"
    echo "2. 포트 80이 열려있는지"
    echo "3. /var/log/letsencrypt/letsencrypt.log 로그 확인"
fi