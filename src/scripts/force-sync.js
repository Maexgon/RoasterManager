const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jksdnesxgdagjvfyzvnk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprc2RuZXN4Z2RhZ2p2Znl6dm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTczMDE5OCwiZXhwIjoyMDg3MzA2MTk4fQ.O0mgRxMVIW_eP_HHcF2NRy4Kloes451kdfN54Q1X79I'
);

async function run() {
    console.log('--- Final Force Sync ---');

    // IDs manuales verificados por consultas previas
    const PLAYER_ID = 'b09df595-8bf8-442b-bd3d-7f33ade315d8'; // Julian Gonzalez
    const PARENT_ID = 'c928a62a-56be-4482-bd47-fba67ab8de1e'; // Mariano (Padre)

    // 1. Vincular
    const { error: linkErr } = await supabase.from('player_parents').upsert({
        parent_profile_id: PARENT_ID,
        player_id: PLAYER_ID
    }, { onConflict: 'parent_profile_id,player_id' });
    console.log('Vínculo:', linkErr ? linkErr.message : 'OK');

    // 2. Perfil
    const { error: profErr } = await supabase.from('profiles').update({
        is_parent: true,
        role: 'Padres'
    }).eq('id', PARENT_ID);
    console.log('Perfil:', profErr ? profErr.message : 'OK');

    // 3. Skills (Julian Gonzalez)
    console.log('Verificando Skills...');
    const { data: sk } = await supabase.from('skills').select('*').eq('player_id', PLAYER_ID);
    if (!sk || sk.length === 0) {
        const { error: skErr } = await supabase.from('skills').insert({
            player_id: PLAYER_ID,
            tackle: 4,
            passing: 5,
            positioning: 4,
            rucking: 3,
            speed: 5,
            dueling: 4
        });
        console.log('Skills creadas:', skErr ? skErr.message : 'OK');
    } else {
        console.log('Skills ya existentes.');
    }

    console.log('--- DONE ---');
}

run().catch(console.error);
