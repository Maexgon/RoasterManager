'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePasswordAction(newPassword: string) {
    const supabase = await createClient()

    // 1. Cambiar password en Auth
    const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (authError) return { error: authError.message }

    // 2. Marcar que ya no requiere cambio en el perfil
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        await supabase.from('profiles').update({
            force_password_change: false
        }).eq('id', user.id)
    }

    revalidatePath('/dashboard/parent')
    return { success: true }
}
