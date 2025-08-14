#!/bin/bash

echo "=== Cloudflare Tunnel 설정 (프테로닥틸용) ==="
echo "이 방법은 서버에 직접 cloudflared를 설치하지 않고도 HTTPS를 사용할 수 있습니다."
echo ""
echo "1. Cloudflare Zero Trust 대시보드 접속:"
echo "   https://one.dash.cloudflare.com/"
echo ""
echo "2. Access > Tunnels > Create a tunnel"
echo ""
echo "3. 터널 이름 입력 (예: pterodactyl-wicked)"
echo ""
echo "4. 설치 방법 중 'Docker' 선택"
echo ""
echo "5. 제공된 토큰을 복사"
echo ""
echo "6. 프테로닥틸 서버의 docker-compose.yml에 추가:"
echo ""
cat << 'EOF'
version: '3.8'
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
    network_mode: "host"
EOF
echo ""
echo "7. Cloudflare 대시보드에서 Public Hostname 설정:"
echo "   - Subdomain: @ 또는 www"
echo "   - Domain: teamwicked.me"
echo "   - Type: HTTP"
echo "   - URL: localhost:50012"
echo ""
echo "8. 완료! 이제 https://teamwicked.me로 접속 가능"
echo ""
echo "=== 장점 ==="
echo "✅ 서버에 아무것도 설치 필요 없음"
echo "✅ 자동 SSL 인증서"
echo "✅ DDoS 방어"
echo "✅ 실제 IP 숨김"