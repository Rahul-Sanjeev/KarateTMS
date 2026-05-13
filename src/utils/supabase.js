import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if credentials are configured
const isPlaceholder = !supabaseUrl || supabaseUrl === 'your-project-url-here'
  || !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here';

if (isPlaceholder) {
  console.warn(
    '⚠️ Supabase not configured. Using localStorage only.\n' +
    'To enable cloud storage, update .env with your Supabase credentials.'
  );
}

export const supabase = !isPlaceholder
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;
