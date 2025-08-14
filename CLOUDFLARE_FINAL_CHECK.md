# ✅ Cloudflare 설정 완료 후 체크리스트

## 🎯 서버 재시작 전 확인사항

### 1. Cloudflare에서 확인
- [ ] teamwicked.me가 "Active" 상태인가?
- [ ] DNS 레코드에 주황색 구름 ☁️ 켜져있나?
- [ ] SSL/TLS가 "Flexible"로 설정되어 있나?

### 2. DNS 전파 확인
```bash
# 터미널이나 CMD에서
nslookup teamwicked.me

# 또는 웹사이트에서 확인
https://www.whatsmydns.net
```

Cloudflare IP(104.x.x.x 같은)가 나오면 성공!

### 3. 서버 재시작
```bash
# 프테로닥틸 콘솔에서
npm restart

# 또는
^C (Ctrl+C로 중지)
npm start
```

## 🚀 접속 테스트

### 순서대로 시도:
1. **http://teamwicked.me** (자동으로 https로 리다이렉트 되어야 함)
2. **https://teamwicked.me** (바로 접속)
3. **https://www.teamwicked.me**

## ⏰ 시간이 얼마나 걸리나요?

- **즉시**: Cloudflare 설정은 바로 적용
- **5-30분**: DNS 전파 (대부분 5-15분)
- **최대 48시간**: 아주 드물게

## 🔧 문제 해결

### "DNS_PROBE_FINISHED_NXDOMAIN" 오류
- DNS가 아직 전파 안 됨 (조금 더 기다리기)

### "ERR_TOO_MANY_REDIRECTS" 오류
- Cloudflare SSL이 "Full"로 되어있을 수 있음
- "Flexible"로 변경하고 5분 대기

### CSS가 안 보임
1. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
2. 개발자 도구(F12) → Network 탭 → "Disable cache" 체크

### 여전히 "안전하지 않음" 표시
- Cloudflare가 아직 인증서 발급 중 (15분 정도 대기)
- SSL/TLS → Edge Certificates에서 인증서 상태 확인

## 📱 모바일에서도 확인
- 모바일 브라우저에서 https://teamwicked.me 접속
- PC와 다르게 보일 수 있음 (캐시 차이)

## 🎉 성공 신호
- 주소창에 자물쇠 🔒 아이콘
- https://로 시작
- CSS 정상 로드
- 콘솔에 Mixed Content 오류 없음

---

**보통 5-15분이면 됩니다!** 
서버 재시작하고 15분 후에 확인해보세요.