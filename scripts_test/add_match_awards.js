require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.rpc('execute_sql', { query: `ALTER TABLE public.events ADD COLUMN IF NOT EXISTS match_awards jsonb DEFAULT '{}'::jsonb;` });
    if (error) console.log('RPC Failed, trying via select...', error);
    console.log('Done');
}
run();
