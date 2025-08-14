# 🔍 Error 520 문제 해결 체크리스트

## 1. 프테로닥틸 서버 확인
프테로닥틸 콘솔에서:
- 서버가 실행 중인가?
- "Server is running on http://0.0.0.0:50012" 메시지가 보이는가?

## 2. 포트 확인 (호스트 서버에서)
```bash
# 50012 포트가 열려있는지 확인
sudo netstat -tlnp | grep 50012

# 또는
sudo ss -tlnp | grep 50012
```

## 3. 직접 접속 테스트 (호스트 서버에서)
```bash
# localhost로 테스트
curl http://localhost:50012

# 127.0.0.1로 테스트
curl http://127.0.0.1:50012
```

## 4. Nginx 에러 로그 확인
```bash
# 에러 로그 확인
sudo tail -f /var/log/nginx/error.log

# 액세스 로그 확인
sudo tail -f /var/log/nginx/access.log
```

## 5. 프테로닥틸 네트워크 설정 확인
프테로닥틸은 Docker를 사용하므로:
```bash
# Docker 컨테이너 확인
docker ps | grep 50012

# 네트워크 설정 확인
docker inspect [container_id] | grep -A 10 "NetworkMode"
```

## 6. Nginx 설정 수정 시도
```bash
sudo nano /etc/nginx/sites-available/teamwicked
```

다음으로 변경:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name teamwicked.me www.teamwicked.me;

    location / {
        # Docker 네트워크를 통한 접속 시도
        proxy_pass http://172.18.0.1:50012;  # Docker 기본 브리지
        
        # 또는 공인 IP로 시도
        # proxy_pass http://119.202.156.3:50012;
        
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 타임아웃 증가
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

## 7. 방화벽 확인
```bash
# 방화벽 상태
sudo ufw status

# 50012 포트 열기
sudo ufw allow 50012/tcp
```

저장 후:
```bash
sudo nginx -t
sudo systemctl reload nginx
```