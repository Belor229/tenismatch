import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a dummy client or handle missing env gracefully
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder'); // Dummy for build/missing env

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
        console.warn('⚠️ Supabase URL or Anon Key is missing. Live database calls will fail.');
    }
}
