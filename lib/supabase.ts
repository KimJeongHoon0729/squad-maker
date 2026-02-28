import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// DB 타입 (Supabase 테이블 구조와 일치)
export type PlayerRow = {
  id: string;
  name: string;
  tier: string;
  created_at: string;
};
