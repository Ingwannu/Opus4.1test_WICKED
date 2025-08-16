#!/bin/bash

echo "🚨 Nginx 설정 복구 스크립트"
echo "이 스크립트는 프테로닥틸 패널이 설치된 호스트 서버에서 실행하세요!"
echo ""

# 1. 현재 nginx 설정 백업
echo "1️⃣ 현재 설정 백업 중..."
sudo cp /etc/nginx/sites-available/teamwicked /etc/nginx/sites-available/teamwicked.backup.wrong 2>/dev/null
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup 2>/dev/null

# 2. 기존 프테로닥틸 설정 찾기
echo "2️⃣ 기존 프테로닥틸 설정 찾는 중..."
if [ -f "/etc/nginx/sites-available/pterodactyl.conf" ]; then
    echo "✅ pterodactyl.conf 발견"
    sudo cp /etc/nginx/sites-available/pterodactyl.conf /etc/nginx/sites-available/pterodactyl
elif [ -f "/etc/nginx/sites-available/pterodactyl" ]; then
    echo "✅ pterodactyl 설정 파일 존재"
else
    echo "⚠️  프테로닥틸 설정 파일이 없습니다. 새로 생성합니다..."
    sudo cp /workspace/pterodactyl-panel-restore.conf /etc/nginx/sites-available/pterodactyl
fi

# 3. teamwicked 설정을 별도 파일로 분리
echo "3️⃣ teamwicked.me 설정을 별도 파일로 생성..."
sudo cp /workspace/teamwicked-nginx.conf /etc/nginx/sites-available/teamwicked

# 4. 심볼릭 링크 재설정
echo "4️⃣ 사이트 활성화..."
sudo rm -f /etc/nginx/sites-enabled/teamwicked
sudo rm -f /etc/nginx/sites-enabled/pterodactyl
sudo ln -s /etc/nginx/sites-available/pterodactyl /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/teamwicked /etc/nginx/sites-enabled/

# 5. nginx 테스트
echo "5️⃣ Nginx 설정 테스트..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx 설정이 올바릅니다. 재시작 중..."
    sudo systemctl restart nginx
    echo ""
    echo "🎉 복구 완료!"
    echo "- 프테로닥틸 패널: https://ingwannu.ggm.kr"
    echo "- TeamWicked 사이트: http://teamwicked.me"
else
    echo "❌ Nginx 설정에 오류가 있습니다!"
    echo "수동으로 확인이 필요합니다:"
    echo "sudo nano /etc/nginx/sites-available/pterodactyl"
    echo "sudo nano /etc/nginx/sites-available/teamwicked"
fi

# 6. 포트 확인
echo ""
echo "6️⃣ 포트 상태 확인..."
sudo netstat -tlnp | grep -E "(80|443|50012)"