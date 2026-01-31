# Vercel 배포 가이드

## 1. Vercel에 프로젝트 배포

### 방법 1: GitHub 연동 (권장)
1. https://vercel.com 접속 및 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 `HyeonminMoon/secretagent` 선택
4. "Import" 클릭

### 방법 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

## 2. 환경 변수 설정 (필수!)

Vercel 프로젝트 설정에서 다음 환경 변수를 추가해야 합니다:

### Settings → Environment Variables

| Variable Name | Value | 설명 |
|--------------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-here` | Supabase anon/public key |

### 환경 변수 가져오는 방법:
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴
4. **Project URL** 복사 → `NEXT_PUBLIC_SUPABASE_URL`에 입력
5. **anon public** key 복사 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 입력

### Vercel에서 환경 변수 추가:
1. Vercel 프로젝트 대시보드
2. **Settings** 탭
3. **Environment Variables** 섹션
4. 위 2개 변수 추가
5. Environment: **Production, Preview, Development** 모두 체크
6. **Save** 클릭

## 3. 재배포

환경 변수를 추가한 후:
1. **Deployments** 탭으로 이동
2. 최신 배포의 **⋯** 메뉴 클릭
3. **Redeploy** 선택

또는 GitHub에 새 커밋을 푸시하면 자동으로 재배포됩니다.

## 4. Supabase RLS 설정 확인

Supabase에서 Row Level Security가 올바르게 설정되어 있는지 확인:

```sql
-- 이미 실행했다면 스킵
CREATE POLICY "Allow public read access" 
ON agents FOR SELECT 
TO public 
USING (true);

-- UPDATE 권한도 필요 (password_attempts 업데이트용)
CREATE POLICY "Allow public update access" 
ON agents FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);
```

## 5. 테스트

배포 완료 후:
1. Vercel에서 제공하는 URL 접속 (예: `https://secretagent.vercel.app`)
2. 초대코드 입력 (예: `GUEST01`, `SPY001`)
3. 지문 인증
4. 대시보드 확인
5. 최종 비밀번호 입력 테스트

## 6. 커스텀 도메인 (선택사항)

Vercel 프로젝트 설정:
1. **Settings** → **Domains**
2. 원하는 도메인 입력
3. DNS 레코드 설정 지침 따라하기

## 문제 해결

### "Failed to load data" 오류
→ 환경 변수가 올바르게 설정되었는지 확인
→ Supabase RLS 정책 확인

### "Invalid invite code" 오류
→ Supabase에 샘플 데이터가 입력되었는지 확인 (SUPABASE_SETUP.md 참고)

### 빌드 오류
→ Vercel 로그 확인: **Deployments** → 실패한 배포 클릭 → **Build Logs**
