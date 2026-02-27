const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jksdnesxgdagjvfyzvnk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprc2RuZXN4Z2RhZ2p2Znl6dm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTczMDE5OCwiZXhwIjoyMDg3MzA2MTk4fQ.O0mgRxMVIW_eP_HHcF2NRy4Kloes451kdfN54Q1X79I'
);

async function run() {
    console.log('--- Final Fix for Julian ---');

    const PARENT_ID = 'c928a62a-56be-4482-bd47-fba67ab8de1e'; // ID de marianoez.gonzalez@gmail.com en Auth

    // 1. Encontrar a Julian
    const { data: player } = await supabase.from('players').select('id, first_name, last_name, category, position, number').eq('first_name', 'JULIAN').eq('last_name', 'GONZALEZ').single();
    if (!player) {
        console.error('JULIAN NOT FOUND');
        return;
    }
    console.log('Found Julian:', player.id);

    // 2. Crear Vínculo
    const { error: linkErr } = await supabase.from('player_parents').upsert({
        parent_profile_id: PARENT_ID,
        player_id: player.id
    }, { onConflict: 'parent_profile_id,player_id' });
    console.log('Linkage:', linkErr || 'SUCCESS');

    // 3. Actualizar perfil (forzar redundancia)
    const { error: upErr } = await supabase.from('profiles').update({
        is_parent: true,
        role: 'Padres',
        full_name: 'Mariano Parent' // Aseguramos que el perfil exista
    }).eq('id', PARENT_ID);
    console.log('Profile update:', upErr || 'SUCCESS');

    // 4. Seed Skills
    const { error: skErr } = await supabase.from('skills').upsert({
        player_id: player.id,
        tackle: 4,
        passing: 5,
        positioning: 4,
        rucking: 3,
        speed: 5,
        dueling: 4
    }, { onConflict: 'player_id' });
    console.log('Skills seed:', skErr || 'SUCCESS');

    console.log('--- DONE ---');
}

run();
