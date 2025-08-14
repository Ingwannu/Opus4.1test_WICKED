#!/bin/bash

echo "=== TeamWicked Nginx 설정 스크립트 ==="
echo "프테로닥틸 패널과 충돌 없이 설정합니다."
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Nginx 설정 파일 생성
echo "1. Nginx 설정 파일 생성 중..."
sudo tee /etc/nginx/sites-available/teamwicked > /dev/null << 'EOF'
# TeamWicked 게임 서버 설정
server {
    listen 80;
    listen [::]:80;
    server_name teamwicked.me www.teamwicked.me;

    # 프테로닥틸 게임 서버로 프록시
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
        
        # WebSocket 지원
        proxy_set_header Connection "upgrade";
        
        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 정적 파일 처리
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:50012;
        proxy_cache_bypass $http_upgrade;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 2. 설정 테스트
echo -e "\n2. Nginx 설정 테스트 중..."
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx 설정 문법 검사 통과${NC}"
else
    echo -e "${RED}✗ Nginx 설정 오류!${NC}"
    exit 1
fi

# 3. 설정 활성화
echo -e "\n3. 설정 활성화 중..."
sudo ln -sf /etc/nginx/sites-available/teamwicked /etc/nginx/sites-enabled/

# 4. Nginx 리로드
echo -e "\n4. Nginx 리로드 중..."
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✓ Nginx 리로드 성공${NC}"
else
    echo -e "${RED}✗ Nginx 리로드 실패${NC}"
    exit 1
fi

# 5. 상태 확인
echo -e "\n5. 서비스 상태 확인..."
sudo systemctl status nginx --no-pager | head -10

# 6. 방화벽 설정
echo -e "\n6. 방화벽 설정..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

echo -e "\n${GREEN}=== 설정 완료! ===${NC}"
echo ""
echo "이제 다음을 수행하세요:"
echo "1. Cloudflare DNS에서 프록시를 다시 켜기 (주황색 구름)"
echo "2. 5분 후 http://teamwicked.me 접속"
echo ""
echo "HTTPS를 원한다면:"
echo "sudo certbot --nginx -d teamwicked.me -d www.teamwicked.me"
echo ""