import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tgjlwdpszubxzdocthgx.supabase.co';
const supabaseAnonKey = 'sb_publishable_AXjNvDjUT0jVGdo5_aofaw_YmL0Pale';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);