import { createClient } from '@supabase/supabase-js';

// Supabase-ийн мэдээллүүд
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uuaikdftqxfejfueyazl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);