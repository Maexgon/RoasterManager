import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function getTeams() {
    const { data: teams } = await supabase.from('teams').select('*')
    console.log(JSON.stringify(teams, null, 2))
}
getTeams()
