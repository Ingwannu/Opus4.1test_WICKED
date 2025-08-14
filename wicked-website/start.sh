#!/bin/bash

# Pterodactyl 컨테이너 환경 확인 및 파일 복사
if [ "$HOME" = "/home/container" ]; then
    echo "[두니사랑단 ingwannu 패널]: 파일 구조 확인 중..."
    
    # 필요한 파일들이 없으면 복사
    if [ ! -f "/home/container/index.js" ]; then
        echo "[두니사랑단 ingwannu 패널]: 프로젝트 파일 복사 중..."
        cp -r /workspace/wicked-website/* /home/container/
    fi
fi

# Node.js 서버 시작
node index.js