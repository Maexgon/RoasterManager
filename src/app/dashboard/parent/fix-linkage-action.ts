'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function fixLinkageAction() {
    const supabase = await createClient()

    // 1. Buscar al Padre por email exacto
    const { data: parent, error: pError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', 'marianoez.gonzalez@gmail.com')
        .single()

    // 2. Buscar al Jugador (Julian Gonzalez) por nombre
    const { data: player, error: jError } = await supabase
        .from('players')
        .select('id, full_name')
        .ilike('full_name', '%Julian%')
        .single()

    if (!parent || !player) {
        return {
            error: `Faltan datos en DB. Padre: ${parent ? 'OK' : 'No encontrado'}, Jugador: ${player ? 'OK' : 'No encontrado'}.`,
            details: { pError, jError }
        }
    }

    // 3. Forzar el vínculo en player_parents
    const { error: linkError } = await supabase
        .from('player_parents')
        .upsert({
            parent_profile_id: parent.id,
            player_id: player.id
        }, { onConflict: 'parent_profile_id,player_id' })

    if (linkError) return { error: 'Error vinculando: ' + linkError.message }

    // 4. Asegurarnos que el perfil del padre tiene is_parent = true
    await supabase
        .from('profiles')
        .update({ is_parent: true, role: 'Padres' })
        .eq('id', parent.id)

    revalidatePath('/dashboard/parent')
    return { success: true, parentId: parent.id, playerId: player.id }
}
