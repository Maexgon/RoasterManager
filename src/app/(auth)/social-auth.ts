'use client'

import { createClient } from '@/utils/supabase/client'

export const signInWithGoogle = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${location.origin}/auth/callback`,
        },
    })

    if (error) {
        console.error(error.message)
    }
}
