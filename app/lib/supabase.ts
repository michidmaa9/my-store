import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uuaikdftqxfejfueyazl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1YWlrZGZ0cXhmZWpmdWV5YXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1Njk3MjUsImV4cCI6MjEwODE0NTcyNX0.8Y-0UhHlZfkKjCB7xa27gi7OIh-QocbIYwEUGygt9L0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);