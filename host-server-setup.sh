#!/bin/bash

# TeamWicked.me 도메인 설정 스크립트 (프테로닥틸 호스트 서버용)
# 이 스크립트는 프테로닥틸 호스트 서버에서 실행하세요!

echo "========================================"
echo "   TeamWicked.me 호스트 서버 설정"
echo "========================================"
echo ""

# Root 권한 확인
if [ "$EUID" -ne 0 ]; then 
    echo "❌ root 권한이 필요합니다. sudo로 실행하세요:"
    echo "   sudo bash host-server-setup.sh"
    exit 1
fi

# 프테로닥틸 포트 설정
PTERODACTYL_PORT=50012
DOMAIN="teamwicked.me"
SERVER_IP="119.202.156.3"

echo "📋 설정 정보:"
echo "   도메인: $DOMAIN"
echo "   서버 IP: $SERVER_IP"
echo "   프테로닥틸 포트: $PTERODACTYL_PORT"
echo ""

# Step 1: Nginx 설치
echo "🔧 Step 1: Nginx 설치 중..."
apt update -y
apt install nginx -y

if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx 설치 실패!"
    exit 1
fi
echo "✅ Nginx 설치 완료"
echo ""

# Step 2: Nginx 설정
echo "📝 Step 2: Nginx 설정 중..."
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PTERODACTYL_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket 지원
        proxy_read_timeout 86400;
        
        # 파일 업로드 크기 제한
        client_max_body_size 100M;
    }
}
EOF

# 사이트 활성화
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# 기본 사이트 비활성화
rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx 설정 오류!"
    exit 1
fi

# Nginx 재시작
systemctl restart nginx
systemctl enable nginx
echo "✅ Nginx 설정 완료"
echo ""

# Step 3: 방화벽 설정
echo "🔥 Step 3: 방화벽 설정 중..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow $PTERODACTYL_PORT/tcp
    echo "✅ 방화벽 규칙 추가 완료"
else
    echo "⚠️  ufw가 설치되어 있지 않습니다. iptables를 사용하는 경우 수동으로 포트를 열어주세요."
fi
echo ""

# Step 4: SSL 설정
echo "🔒 Step 4: SSL 인증서 설정"
echo "Let's Encrypt SSL 인증서를 설정하시겠습니까? (y/n)"
read -r ssl_response

if [[ "$ssl_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # Certbot 설치
    apt install certbot python3-certbot-nginx -y
    
    echo ""
    echo "📧 SSL 인증서 발급을 위한 이메일 주소를 입력하세요:"
    read -r email
    
    # SSL 인증서 발급
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $email
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL 인증서 설정 완료!"
        
        # 자동 갱신 설정
        systemctl enable certbot.timer
        systemctl start certbot.timer
        echo "✅ SSL 자동 갱신 설정 완료"
    else
        echo "⚠️  SSL 인증서 발급 실패. 나중에 다시 시도하세요:"
        echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    fi
else
    echo "⚠️  SSL 설정을 건너뛰었습니다. 나중에 설정하려면:"
    echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi
echo ""

# Step 5: 테스트
echo "🔍 Step 5: 설정 확인 중..."

# Nginx 상태 확인
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx가 실행 중입니다"
else
    echo "❌ Nginx가 실행되지 않았습니다"
fi

# 프테로닥틸 포트 확인
if netstat -tuln | grep -q ":$PTERODACTYL_PORT "; then
    echo "✅ 프테로닥틸 앱이 포트 $PTERODACTYL_PORT에서 실행 중입니다"
else
    echo "⚠️  프테로닥틸 앱이 포트 $PTERODACTYL_PORT에서 실행되지 않았습니다"
    echo "   프테로닥틸 패널에서 서버를 시작하세요"
fi

# 도메인 접속 테스트
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200\|301\|302"; then
    echo "✅ 도메인이 정상적으로 응답합니다"
else
    echo "⚠️  도메인 접속에 문제가 있을 수 있습니다"
fi

echo ""
echo "========================================"
echo "         설정 완료! 🎉"
echo "========================================"
echo ""
if [[ "$ssl_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🌐 접속 주소: https://$DOMAIN"
else
    echo "🌐 접속 주소: http://$DOMAIN"
fi
echo ""
echo "📝 유용한 명령어:"
echo "   • nginx -t              - Nginx 설정 테스트"
echo "   • systemctl status nginx - Nginx 상태 확인"
echo "   • tail -f /var/log/nginx/error.log - Nginx 에러 로그"
echo "   • certbot renew --dry-run - SSL 갱신 테스트"
echo ""
echo "⚠️  참고사항:"
echo "   1. 프테로닥틸 패널에서 Node.js 서버가 실행 중이어야 합니다"
echo "   2. DNS A 레코드가 $SERVER_IP를 가리키고 있어야 합니다"
echo "   3. 문제가 있으면 /var/log/nginx/error.log를 확인하세요"
echo ""