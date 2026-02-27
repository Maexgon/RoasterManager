const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
async function main() {
  const { data, error } = await s.from('players').select('id, status').limit(1)
  if (data && data.length > 0) {
    const p = data[0]
    const { error: updErr } = await s.from('players').update({ status: 'Abandonado' }).eq('id', p.id)
    console.log('Update Error:', updErr)
    await s.from('players').update({ status: p.status }).eq('id', p.id)
  }
}
main()
