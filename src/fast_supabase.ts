import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // In development, warn but continue (might break later if used). 
    // In production, this should definitely be an error or at least a loud warning.
    console.error(
        "Missing Supabase environment variables. Please check your .env file." +
        "Required: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY"
    );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
