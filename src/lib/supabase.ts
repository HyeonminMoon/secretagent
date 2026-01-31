import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
