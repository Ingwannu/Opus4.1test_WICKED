# 🔥 Cloudflare + Namecheap 초간단 설정 가이드

## 📝 준비물
- Namecheap 계정 (teamwicked.me 도메인 보유)
- 이메일 주소 (Cloudflare 가입용)
- 10분의 시간

---

## 🎯 STEP 1: Cloudflare 가입하기

### 1-1. Cloudflare 홈페이지 접속
- 주소: https://www.cloudflare.com/ko-kr/
- 우측 상단 "회원가입" 클릭

### 1-2. 계정 만들기
- 이메일 입력
- 비밀번호 설정 (8자 이상)
- "계정 만들기" 클릭

### 1-3. 이메일 인증
- 받은 이메일에서 "이메일 주소 확인" 클릭

---

## 🌐 STEP 2: Cloudflare에 도메인 추가하기

### 2-1. 사이트 추가
- 로그인 후 "사이트 추가" 클릭
- 입력창에 `teamwicked.me` 입력 (http:// 없이!)
- "사이트 추가" 클릭

### 2-2. 플랜 선택
- **"Free" 플랜 선택** (맨 아래 있음)
- "계속" 클릭

### 2-3. DNS 레코드 검색 대기
- Cloudflare가 기존 DNS 설정을 자동으로 찾아줍니다
- 1-2분 정도 기다리세요

---

## 📋 STEP 3: DNS 레코드 설정하기

### 3-1. 기존 레코드 정리
- 자동으로 찾은 레코드 중 불필요한 것 삭제
- A, AAAA, CNAME 레코드 중 불필요한 것 삭제

### 3-2. 새 레코드 추가
**첫 번째 레코드:**
```
유형: A
이름: @
IPv4 주소: 119.202.156.3
프록시 상태: 프록시됨 (주황색 구름 켜짐)
TTL: 자동
```

**두 번째 레코드:**
```
유형: A
이름: www
IPv4 주소: 119.202.156.3
프록시 상태: 프록시됨 (주황색 구름 켜짐)
TTL: 자동
```

### 3-3. 저장하고 계속
- 하단의 "계속" 버튼 클릭

---

## 🔄 STEP 4: Namecheap 네임서버 변경하기

### 4-1. Cloudflare 네임서버 확인
Cloudflare에서 2개의 네임서버를 보여줍니다:
- 예: `xxx.ns.cloudflare.com`
- 예: `yyy.ns.cloudflare.com`
**이 창을 열어두세요!**

### 4-2. Namecheap 로그인
- 새 탭에서 https://www.namecheap.com 접속
- 로그인하기

### 4-3. 도메인 관리 페이지로 이동
1. 상단 메뉴 "Domain List" 클릭
2. `teamwicked.me` 찾기
3. 우측 "MANAGE" 버튼 클릭

### 4-4. 네임서버 변경
1. "NAMESERVERS" 섹션 찾기 (페이지 중간쯤)
2. 드롭다운에서 "Custom DNS" 선택
3. 기존 네임서버 모두 삭제
4. Cloudflare 네임서버 2개 입력:
   - Nameserver 1: `xxx.ns.cloudflare.com` (Cloudflare에서 복사)
   - Nameserver 2: `yyy.ns.cloudflare.com` (Cloudflare에서 복사)
5. 초록색 체크 표시 ✓ 클릭하여 저장

### 4-5. Cloudflare로 돌아가기
- Cloudflare 탭으로 돌아가서
- "완료, 네임서버 확인" 클릭

---

## 🔒 STEP 5: SSL 설정하기

### 5-1. SSL/TLS 메뉴 이동
- Cloudflare 대시보드에서 `teamwicked.me` 클릭
- 왼쪽 메뉴에서 "SSL/TLS" 클릭

### 5-2. 암호화 모드 설정
- "개요" 탭에서
- **"유연함(Flexible)" 선택** ⚠️ 중요!
- 자동으로 저장됨

### 5-3. 항상 HTTPS 사용 설정
- "SSL/TLS" → "Edge Certificates" 클릭
- "Always Use HTTPS" 켜기 (ON)

---

## ⏰ STEP 6: 대기 및 확인

### 6-1. DNS 전파 대기
- 최소 5분 ~ 최대 48시간 (보통 30분 이내)
- 확인 방법: https://www.whatsmydns.net/
- `teamwicked.me` 검색해서 전 세계 DNS 상태 확인

### 6-2. 작동 확인
1. 브라우저에서 https://teamwicked.me 접속
2. 자물쇠 아이콘 🔒 확인
3. CSS도 정상적으로 로드되는지 확인

---

## 🚨 문제 해결

### "ERR_TOO_MANY_REDIRECTS" 오류
- Cloudflare SSL을 "유연함(Flexible)"으로 설정했는지 확인
- 서버 코드에서 HTTPS 강제 리다이렉트 제거

### CSS가 여전히 안 보임
- 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
- 시크릿/프라이빗 모드로 확인

### 접속이 안 됨
- Cloudflare DNS 레코드 확인 (주황색 구름 켜져있나?)
- Namecheap 네임서버 제대로 변경했나 확인
- 프테로닥틸 서버가 실행 중인지 확인

---

## ✅ 최종 체크리스트

- [ ] Cloudflare 계정 생성 완료
- [ ] teamwicked.me 도메인 추가 완료
- [ ] A 레코드 2개 추가 (@ 와 www)
- [ ] 주황색 구름 켜짐 확인
- [ ] Namecheap에서 Custom DNS 선택
- [ ] Cloudflare 네임서버 2개 입력
- [ ] SSL 모드 "유연함(Flexible)" 선택
- [ ] Always Use HTTPS 켜기

모든 체크리스트 완료하면 30분 내에 https://teamwicked.me 접속 가능합니다! 🎉