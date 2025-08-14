# 🎨 Cloudflare 설정 시각적 가이드

## 🔴 중요한 것만 따라하세요!

### 1️⃣ Cloudflare 가입
```
🌐 cloudflare.com
    ↓
📧 이메일 + 비밀번호
    ↓
✉️ 이메일 인증 클릭
```

### 2️⃣ 도메인 추가
```
➕ "사이트 추가" 클릭
    ↓
📝 teamwicked.me 입력
    ↓
💸 Free 플랜 선택 (맨 아래!)
```

### 3️⃣ DNS 설정 (가장 중요!)
```
🗑️ 기존 레코드 모두 삭제
    ↓
➕ "레코드 추가" 클릭 2번
```

**첫 번째:**
```
유형: A
이름: @ (또는 teamwicked.me)
내용: 119.202.156.3
프록시: ☁️ 주황색 (켜짐)
```

**두 번째:**
```
유형: A
이름: www
내용: 119.202.156.3
프록시: ☁️ 주황색 (켜짐)
```

### 4️⃣ Namecheap 설정
```
🔍 namecheap.com 로그인
    ↓
📋 Domain List
    ↓
🔧 teamwicked.me → MANAGE
    ↓
🔽 NAMESERVERS → Custom DNS
    ↓
❌ 기존 것 다 지우고
    ↓
✏️ Cloudflare 네임서버 2개 입력
```

**복사할 것:**
- `xxx.ns.cloudflare.com`
- `yyy.ns.cloudflare.com`

### 5️⃣ SSL 설정
```
🔒 SSL/TLS 메뉴
    ↓
🟡 "유연함(Flexible)" 선택
    ↓
✅ Always Use HTTPS 켜기
```

## ⏱️ 얼마나 기다려야 하나요?

- 🚀 빠르면: 5분
- 😊 보통: 30분
- 😴 느리면: 2시간
- 💀 최악: 48시간 (거의 없음)

## 🆘 안 되면?

1. **주황색 구름 ☁️ 켜져있나요?**
2. **Flexible 선택했나요?**
3. **네임서버 2개 다 입력했나요?**

## 💡 꿀팁

서버 재시작하기:
```bash
# 프테로닥틸 콘솔에서
npm restart
```

브라우저 캐시 삭제:
- Chrome: `Ctrl + Shift + Delete`
- 시간 범위: "전체 기간"
- "캐시된 이미지 및 파일" 체크

---

이제 진짜 끝! 30분만 기다리세요 ⏰