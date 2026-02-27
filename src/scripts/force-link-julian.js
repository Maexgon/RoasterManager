const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jksdnesxgdagjvfyzvnk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprc2RuZXN4Z2RhZ2p2Znl6dm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTczMDE5OCwiZXhwIjoyMDg3MzA2MTk4fQ.O0mgRxMVIW_eP_HHcF2NRy4Kloes451kdfN54Q1X79I'
);

async function run() {
    console.log('--- Starting Database Maintenance Task ---');

    // 1. Encontrar al Padre
    const { data: parent } = await supabase.from('profiles').select('id, full_name').eq('email', 'marianoez.gonzalez@gmail.com').single();
    if (!parent) {
        console.error('Error: Parent profile not found for email marianoez.gonzalez@gmail.com');
        return;
    }
    console.log('Found Parent:', parent.full_name, '(' + parent.id + ')');

    // 2. Encontrar a Julian
    const { data: player } = await supabase.from('players').select('id, first_name, last_name').eq('first_name', 'JULIAN').eq('last_name', 'GONZALEZ').single();
    if (!player) {
        console.error('Error: Player JULIAN GONZALEZ not found in players table');
        return;
    }
    console.log('Found Player:', player.first_name, player.last_name, '(' + player.id + ')');

    // 3. Crear Vínculo
    const { error: linkErr } = await supabase.from('player_parents').upsert({
        parent_profile_id: parent.id,
        player_id: player.id
    }, { onConflict: 'parent_profile_id,player_id' });

    if (linkErr) console.error('Link Error:', linkErr);
    else console.log('Linkage successfully established/verified.');

    // 4. Actualizar perfil padre
    const { error: upErr } = await supabase.from('profiles').update({
        is_parent: true,
        role: 'Padres'
    }).eq('id', parent.id);

    if (upErr) console.error('Profile Update Error:', upErr);
    else console.log('Parent profile role and flag updated.');

    // 5. Verificar/Crear Skills
    const { data: existingSkills } = await supabase.from('skills').select('*').eq('player_id', player.id);
    if (!existingSkills || existingSkills.length === 0) {
        console.log('No skills found for Julian. Seeding initial data...');
        const { error: skillErr } = await supabase.from('skills').insert({
            player_id: player.id,
            tackle: 4,
            passing: 5,
            positioning: 4,
            rucking: 3,
            speed: 5,
            dueling: 4,
            date_logged: new Date().toISOString()
        });
        if (skillErr) console.error('Skill Seed Error:', skillErr);
        else console.log('Initial technical skills seeded.');
    } else {
        console.log('Skills already exist for Julian.');
    }

    console.log('--- Task Completed Successfully ---');
}

run().catch(console.error);
