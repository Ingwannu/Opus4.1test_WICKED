# 🔧 올바른 DNS 레코드 설정

## 현재 상황
- A | node | 119.202.156.3 (필요 없음)
- A | teamwicked.me | 119.202.156.3 (이건 맞음)

## 수정 방법

### 1. 삭제할 것
- **"node" A 레코드 삭제** (휴지통 클릭)

### 2. 추가할 것
- **"www" A 레코드 추가**

### 3. 최종 설정 (이렇게만 있으면 됨)

**첫 번째:**
```
Type: A
Name: teamwicked.me (또는 @)
Content: 119.202.156.3
Proxy status: DNS only (회색 구름) ← 중요!
TTL: Auto
```

**두 번째 (추가):**
```
Type: A
Name: www
Content: 119.202.156.3
Proxy status: DNS only (회색 구름) ← 중요!
TTL: Auto
```

## 🎯 단계별 진행

1. **"node" 레코드 삭제**
   - node 줄에서 Edit → Delete

2. **"www" 레코드 추가**
   - Add Record 클릭
   - Type: A
   - Name: www
   - IPv4 address: 119.202.156.3
   - Proxy status: 회색으로 (클릭해서 끄기)

3. **기존 teamwicked.me 레코드**
   - Proxy status를 주황색에서 회색으로 변경

## ⚠️ 중요: 프록시 끄기
모든 A 레코드의 Proxy를 **회색(DNS only)**로 설정해야 합니다!
- 주황색 ❌ → 회색 ✅

## 📌 완료 후
- http://teamwicked.me:50012 접속
- http://www.teamwicked.me:50012 접속

둘 다 작동해야 합니다!