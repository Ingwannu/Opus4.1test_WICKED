# 🛡️ 프테로닥틸 패널 영향 없이 Nginx 설정 추가하기

## ⚠️ 중요: 기존 프테로닥틸 설정 건드리지 않기!

### 1. 먼저 기존 설정 확인
```bash
# 기존 Nginx 설정 파일 확인
ls -la /etc/nginx/sites-enabled/
```

보통 이런 파일들이 있을 겁니다:
- `pterodactyl.conf` 또는 `panel.conf` (프테로닥틸 패널용)
- `default` (기본 설정)

### 2. 새로운 설정 파일 생성 (별도로!)
```bash
# 기존 파일과 다른 이름으로 생성
sudo nano /etc/nginx/sites-available/teamwicked-app
```

다음 내용 입력:
```nginx
# TeamWicked 앱 전용 설정
server {
    listen 80;
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
        
        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 3. 설정 테스트 (중요!)
```bash
# 설정 파일 문법 검사
sudo nginx -t
```

"syntax is ok" 메시지가 나와야 합니다.

### 4. 설정 활성화
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/teamwicked-app /etc/nginx/sites-enabled/

# 다시 한 번 테스트
sudo nginx -t
```

### 5. Nginx 재시작
```bash
# reload로 무중단 재시작
sudo systemctl reload nginx

# 상태 확인
sudo systemctl status nginx
```

### 6. SSL 인증서 추가 (선택사항)
```bash
# Let's Encrypt 설치
sudo certbot --nginx -d teamwicked.me -d www.teamwicked.me --redirect
```

## 🔍 문제 해결

### 만약 충돌이 발생하면:
```bash
# 추가한 설정 비활성화
sudo rm /etc/nginx/sites-enabled/teamwicked-app

# Nginx 재시작
sudo systemctl reload nginx
```

### 포트 충돌 확인:
```bash
# 80 포트 사용 현황 확인
sudo netstat -tlnp | grep :80
```

### 로그 확인:
```bash
# 에러 로그 확인
sudo tail -f /var/log/nginx/error.log
```

## 📌 안전한 설정 팁

1. **다른 서브도메인 사용하기** (더 안전)
   ```nginx
   server_name app.teamwicked.me;
   ```

2. **다른 포트 사용하기**
   ```nginx
   listen 8080;
   server_name teamwicked.me;
   ```

3. **프테로닥틸 패널 도메인 확인**
   - 패널이 `panel.yourdomain.com` 같은 서브도메인을 사용한다면 충돌 없음
   - 같은 도메인을 사용한다면 서브도메인으로 분리 필요

## ✅ 최종 확인
- 프테로닥틸 패널: 기존대로 작동
- TeamWicked 앱: https://teamwicked.me 접속 가능
- 둘 다 정상 작동해야 함!