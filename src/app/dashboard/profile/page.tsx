import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './profile-client'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Get current user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get all staff/profiles (to display to admin)
    const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

    return <ProfileClient currentUser={user} currentProfile={profile} allProfiles={allProfiles || []} />
}
