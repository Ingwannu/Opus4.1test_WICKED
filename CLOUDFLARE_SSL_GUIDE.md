# Cloudflare로 5분만에 HTTPS 설정하기 (프테로닥틸용)

## 🎯 필요한 것
- Namecheap 도메인 (teamwicked.me)
- Cloudflare 무료 계정
- 5분의 시간

## 📋 설정 단계

### 1단계: Cloudflare 계정 만들기
1. [cloudflare.com](https://cloudflare.com) 접속
2. 무료 계정 생성

### 2단계: 도메인 추가
1. Cloudflare 대시보드에서 "Add a Site" 클릭
2. `teamwicked.me` 입력
3. Free 플랜 선택

### 3단계: DNS 설정
Cloudflare가 자동으로 기존 DNS 레코드를 가져옵니다. 다음 레코드 추가:

```
Type: A
Name: @
IPv4 address: 119.202.156.3
Proxy status: Proxied (주황색 구름 ON)

Type: A  
Name: www
IPv4 address: 119.202.156.3
Proxy status: Proxied (주황색 구름 ON)
```

### 4단계: Namecheap에서 네임서버 변경
1. Namecheap 로그인
2. Domain List → teamwicked.me → Manage
3. NAMESERVERS 섹션에서 "Custom DNS" 선택
4. Cloudflare가 제공한 네임서버 2개 입력:
   - 예: `xxx.ns.cloudflare.com`
   - 예: `yyy.ns.cloudflare.com`

### 5단계: Cloudflare SSL 설정
1. Cloudflare 대시보드 → SSL/TLS → Overview
2. **"Flexible"** 선택 (중요!)
3. SSL/TLS → Edge Certificates → Always Use HTTPS 활성화

### 6단계: 프테로닥틸 서버 설정 수정

서버 코드에서 CORS 설정 업데이트:

```javascript
// index.js의 CORS 부분 수정
const allowedOrigins = [
  'https://teamwicked.me',
  'https://www.teamwicked.me',
  'http://localhost:3000',
  'http://119.202.156.3:50012'  // 직접 접속용
];
```

## ⏱️ 대기 시간
- DNS 전파: 5분~48시간 (보통 30분 이내)
- SSL 인증서 활성화: 즉시~15분

## 🎉 완료!
이제 `https://teamwicked.me`로 접속 가능합니다!

## 🔧 문제 해결

### "안전하지 않은 연결" 계속 뜰 때
1. 브라우저 캐시 삭제
2. Cloudflare에서 "Development Mode" 잠시 켜기
3. SSL/TLS 모드가 "Flexible"인지 확인

### 무한 리다이렉트 발생 시
- Cloudflare SSL을 "Flexible"로 설정
- 서버에서 HTTPS 강제 리다이렉트 제거

## 💡 추가 팁
- Cloudflare Page Rules로 특정 경로만 HTTPS 적용 가능
- 무료 플랜으로도 충분함
- DDoS 방어 보너스!