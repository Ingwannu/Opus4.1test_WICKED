#!/bin/bash

echo "[두니사랑단 ingwannu 패널]: 프로젝트 초기화 시작..."

# 현재 디렉토리 확인
echo "[두니사랑단 ingwannu 패널]: 현재 위치: $(pwd)"

# 프로젝트 파일이 있는지 확인
if [ ! -f "index.js" ]; then
    echo "[두니사랑단 ingwannu 패널]: 프로젝트 파일이 없습니다. 설정을 확인하세요."
    echo "[두니사랑단 ingwannu 패널]: 다음 파일들이 필요합니다:"
    echo "  - index.js"
    echo "  - package.json"
    echo "  - utils/seed.js"
    echo "  - 기타 프로젝트 파일들"
    exit 1
fi

# utils 디렉토리 확인
if [ ! -d "utils" ]; then
    echo "[두니사랑단 ingwannu 패널]: utils 디렉토리가 없습니다!"
    exit 1
fi

# seed.js 파일 확인
if [ ! -f "utils/seed.js" ]; then
    echo "[두니사랑단 ingwannu 패널]: utils/seed.js 파일이 없습니다!"
    exit 1
fi

# 종속성 설치
echo "[두니사랑단 ingwannu 패널]: 종속성 설치 중..."
npm install

# 서버 시작
echo "[두니사랑단 ingwannu 패널]: 서버 시작!"
node index.js