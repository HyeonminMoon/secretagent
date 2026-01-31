# Supabase 데이터베이스 설정 가이드

## 1. Supabase 프로젝트 생성
1. https://supabase.com 접속
2. 새 프로젝트 생성
3. Project URL과 anon key를 `.env.local` 파일에 복사

## 2. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 쿼리를 실행하세요:

```sql
-- agents 테이블 생성 (role 필드 추가: 'spy' 또는 'guest')
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('spy', 'guest')),
  agent_name TEXT NOT NULL,
  secret_word TEXT,
  final_password TEXT NOT NULL,
  password_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  missions JSONB,
  guest_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인덱스 생성 (빠른 검색을 위해)
CREATE INDEX idx_invite_code ON agents(invite_code);
CREATE INDEX idx_role ON agents(role);

-- Row Level Security (RLS) 활성화
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 설정
CREATE POLICY "Allow public read access" 
ON agents FOR SELECT 
TO public 
USING (true);
```

## 3. 샘플 데이터 삽입

```sql
-- 일반 게스트 데이터 (role = 'guest') - 진짜 비밀단어
INSERT INTO agents (invite_code, role, agent_name, secret_word, final_password, missions) VALUES
('GUEST01', 'guest', 'AGENT-FIRE', '우리', 'BBQ2026', '["Locate BBQ Grid Sector 7", "Secure Perimeter Zone", "Extract Secret Recipe", "Activate Smoke Protocol"]'),
('GUEST02', 'guest', 'AGENT-SMOKE', '삼겹살', 'BBQ2026', '["Check Temperature Sensors", "Monitor Meat Quality", "Secure BBQ Sauce Formula", "Deploy Heat Shield"]'),
('GUEST03', 'guest', 'AGENT-GRILL', '치킨', 'BBQ2026', '["Infiltrate Kitchen Area", "Scan for Spy Cameras", "Collect Intel on Recipes", "Neutralize Smoke Detector"]'),
('GUEST04', 'guest', 'AGENT-FLAME', '소주', 'BBQ2026', '["Secure Beverage Station", "Monitor Guest Activities", "Protect Secret Menu", "Execute Cleanup Protocol"]');

-- 진짜 스파이 데이터 (role = 'spy') - 위장 키워드 (fake) + 실제 임무
INSERT INTO agents (invite_code, role, agent_name, secret_word, final_password, missions) VALUES
('SPY001', 'spy', 'AGENT-SHADOW', '불고기', 'BBQ2026', '["Monitor all guest activities", "Identify the real spy among guests", "Report suspicious behavior", "Protect BBQ operation"]'),
('SPY002', 'spy', 'AGENT-GHOST', '김치', 'BBQ2026', '["Surveillance mode activated", "Track mission completion rates", "Analyze guest patterns", "Secure perimeter"]'),
('SPY003', 'spy', 'AGENT-VIPER', '상추', 'BBQ2026', '["Deep cover operation", "Blend in with guests", "Gather intelligence", "Report findings"]'),
('SPY004', 'spy', 'AGENT-FALCON', '쌈장', 'BBQ2026', '["Counter-intelligence active", "Watch for unusual activity", "Maintain cover identity", "Execute protocol OMEGA"]');
```

## 4. 기존 테이블에 시도 횟수 컬럼 추가

**이미 agents 테이블이 존재하는 경우**, 다음 쿼리로 비밀번호 시도 횟수 컬럼을 추가하세요:

```sql
-- 비밀번호 시도 횟수 관리 컬럼 추가
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS password_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMP WITH TIME ZONE;
```

## 5. 환경 변수 설정

`.env.local` 파일에 다음 값을 입력하세요:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 6. 테스트

서버를 재시작하고 테스트해보세요:
- **게스트 코드**: `GUEST01`, `GUEST02`, `GUEST03`, `GUEST04` → 터미널 화면 + 진짜 비밀단어
- **스파이 코드**: `SPY001`, `SPY002`, `SPY003`, `SPY004` → 터미널 화면 + 위장 키워드 (FAKE) + 특수 임무
