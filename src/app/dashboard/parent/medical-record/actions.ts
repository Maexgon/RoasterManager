'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMedicalData(playerId: string, data: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Verificar que el usuario es padre de este jugador
    const { data: linkage } = await supabase
        .from('player_parents')
        .select('*')
        .eq('parent_profile_id', user.id)
        .eq('player_id', playerId)
        .single()

    if (!linkage) return { success: false, error: 'No tienes permiso para editar este jugador' }

    // Actualizar solo los campos permitidos
    const allowedData = {
        birth_date: data.birth_date,
        height: data.height,
        weight: data.weight,
        dominant_foot: data.dominant_foot,
        dominant_hand: data.dominant_hand,
        blood_type: data.blood_type
    }

    const { error } = await supabase
        .from('players')
        .update(allowedData)
        .eq('id', playerId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/parent/medical-record')
    revalidatePath('/dashboard/parent')

    return { success: true }
}
