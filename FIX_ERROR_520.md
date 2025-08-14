# 🚨 Cloudflare Error 520 해결하기

## 문제 원인
Error 520은 Cloudflare가 서버에 연결할 수 없을 때 발생합니다.

## 🔧 즉시 해결 방법

### 1. 프테로닥틸 서버 확인
```bash
# 서버가 실행 중인지 확인
# 프테로닥틸 콘솔에서
npm start
```

### 2. 포트 확인
서버가 정말 50012 포트에서 실행 중인가요?
콘솔에 다음과 같이 나와야 합니다:
```
Server is running on http://0.0.0.0:50012
```

### 3. Cloudflare DNS 설정 수정

#### 방법 A: 포트 지정 (권장)
Cloudflare 대시보드로 가서:

1. **DNS 메뉴** 클릭
2. 기존 A 레코드 삭제
3. 새로운 설정 추가:

```
유형: CNAME
이름: @
대상: 119.202.156.3
프록시: 회색 (꺼짐) ← 중요!
```

```
유형: CNAME  
이름: www
대상: 119.202.156.3
프록시: 회색 (꺼짐) ← 중요!
```

### 4. Page Rules 설정 (HTTPS 유지하려면)

1. Cloudflare → **Rules** → **Page Rules**
2. **Create Page Rule** 클릭
3. 설정:
   ```
   URL: teamwicked.me/*
   Settings: SSL → Flexible
   ```

### 5. 임시 해결책: 직접 접속

프록시를 끄면 포트를 지정해서 접속해야 합니다:
```
http://teamwicked.me:50012
```

## 🎯 완벽한 해결책

프테로닥틸 호스트 서버에서 Nginx 설정:

```bash
# 호스트 서버에서 (프테로닥틸 컨테이너 아님!)
sudo nano /etc/nginx/sites-available/teamwicked
```

```nginx
server {
    listen 80;
    server_name teamwicked.me www.teamwicked.me;
    
    location / {
        proxy_pass http://localhost:50012;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/teamwicked /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

그 다음 Cloudflare DNS를 다시 프록시 켜기(주황색)로 변경.

## ⚡ 빠른 체크리스트

1. [ ] 서버가 실행 중? (프테로닥틸 콘솔 확인)
2. [ ] 포트 50012가 맞나?
3. [ ] 119.202.156.3:50012로 직접 접속 되나?
4. [ ] Cloudflare 프록시 끄면 되나?

## 💡 Error 520이 계속되면

Cloudflare에서:
1. **SSL/TLS** → **Overview**
2. **"Off"** 선택 (임시로)
3. DNS에서 프록시 끄기 (회색 구름)
4. http://teamwicked.me:50012 로 접속

이렇게 하면 SSL은 없지만 접속은 됩니다!