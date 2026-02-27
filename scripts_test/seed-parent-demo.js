const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function seed() {
    // 1. Buscar a Julian
    const { data: players } = await supabase.from('players').select('id, full_name').ilike('full_name', '%JULIAN%')

    if (!players || players.length === 0) {
        console.log('No Julian found')
        return
    }

    const julian = players[0]
    console.log('Linking skills for:', julian.full_name)

    // 2. Insertar skills de ejemplo
    await supabase.from('skills').insert([{
        player_id: julian.id,
        tackle: 4,
        passing: 3,
        positioning: 4,
        rucking: 2,
        speed: 5,
        dueling: 4,
        date_logged: new Date().toISOString()
    }])

    // 3. Insertar asistencia de ejemplo
    const { data: events } = await supabase.from('events').select('id').limit(5)
    if (events) {
        for (const event of events) {
            await supabase.from('event_attendance').upsert({
                event_id: event.id,
                player_id: julian.id,
                status: Math.random() > 0.2 ? 'Presente' : 'Ausente'
            })
        }
    }

    console.log('Data seeded successfully for Parent Dashboard demo')
}

seed()
