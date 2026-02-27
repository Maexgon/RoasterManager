import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ParentProfileClient from './profile-client'

export default async function ParentProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return <ParentProfileClient profile={profile} user={user} />
}
