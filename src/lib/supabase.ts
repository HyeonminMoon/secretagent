import { createClient } from '@supabase/supabase-js';

// 빌드 시 환경 변수가 없어도 에러가 나지 않도록 더미 값 제공
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AgentData {
  invite_code: string;
  role: 'spy' | 'guest';
  agent_name: string;
  secret_word: string;
  final_password: string;
  password_attempts: number;
  last_attempt_at?: string;
  missions: string[];
  created_at?: string;
}
