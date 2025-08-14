#!/bin/bash

echo "=== 프테로닥틸 SSL 자동 설정 스크립트 ==="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 옵션 선택
echo "어떤 방법을 사용하시겠습니까?"
echo "1) 자체 서명 인증서 (즉시 가능, 경고 표시)"
echo "2) Let's Encrypt (도메인 필요)"
echo "3) Cloudflare 설정 가이드 보기"
read -p "선택 (1-3): " choice

case $choice in
    1)
        echo -e "${YELLOW}자체 서명 인증서 생성 중...${NC}"
        
        # 인증서 생성
        sudo mkdir -p /etc/ssl/private
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/ssl/private/pterodactyl.key \
            -out /etc/ssl/certs/pterodactyl.crt \
            -subj "/C=KR/ST=Seoul/L=Seoul/O=TeamWicked/CN=119.202.156.3"
        
        # Nginx 설정 생성
        cat > /tmp/pterodactyl-ssl << 'EOF'
server {
    listen 443 ssl;
    server_name 119.202.156.3;
    
    ssl_certificate /etc/ssl/certs/pterodactyl.crt;
    ssl_certificate_key /etc/ssl/private/pterodactyl.key;
    
    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
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

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name 119.202.156.3;
    return 301 https://$server_name$request_uri;
}
EOF
        
        sudo cp /tmp/pterodactyl-ssl /etc/nginx/sites-available/pterodactyl-ssl
        sudo ln -sf /etc/nginx/sites-available/pterodactyl-ssl /etc/nginx/sites-enabled/
        
        # Nginx 테스트 및 재시작
        sudo nginx -t
        if [ $? -eq 0 ]; then
            sudo systemctl restart nginx
            echo -e "${GREEN}✅ 완료! https://119.202.156.3 로 접속 가능합니다.${NC}"
            echo -e "${YELLOW}⚠️  브라우저에서 보안 경고가 뜹니다. '고급' → '계속 진행'을 클릭하세요.${NC}"
        else
            echo -e "${RED}❌ Nginx 설정 오류!${NC}"
        fi
        ;;
        
    2)
        echo -e "${YELLOW}Let's Encrypt 설정${NC}"
        read -p "도메인 이름을 입력하세요 (예: teamwicked.me): " domain
        
        # Certbot 설치
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
        
        # 인증서 발급
        sudo certbot --nginx -d $domain -d www.$domain --non-interactive --agree-tos -m admin@$domain
        
        echo -e "${GREEN}✅ 완료! https://$domain 로 접속 가능합니다.${NC}"
        ;;
        
    3)
        echo -e "${YELLOW}Cloudflare 설정 방법:${NC}"
        echo "1. cloudflare.com 에서 무료 계정 생성"
        echo "2. 도메인 추가 (teamwicked.me)"
        echo "3. DNS 설정:"
        echo "   - A 레코드: @ → 119.202.156.3 (Proxy ON)"
        echo "   - A 레코드: www → 119.202.156.3 (Proxy ON)"
        echo "4. Namecheap에서 Cloudflare 네임서버로 변경"
        echo "5. SSL/TLS 설정을 'Flexible'로 선택"
        echo ""
        echo -e "${GREEN}이 방법이 가장 쉽고 안전합니다!${NC}"
        ;;
esac

# 방화벽 설정
echo ""
echo "방화벽 포트 열기..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 50012/tcp

echo ""
echo -e "${GREEN}스크립트 완료!${NC}"