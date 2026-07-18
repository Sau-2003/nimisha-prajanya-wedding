import { createClient } from '@supabase/supabase-js';

// Hardcoding these temporarily to bypass the Vercel variable sync issue
const supabaseUrl = 'https://tgjlwdpszubxzdocthgx.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_AXjNvDjUT0jVGdo5_aofaw_YmL0Pale';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);