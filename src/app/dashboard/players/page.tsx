import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PlayersClient from './players-client'

export default async function PlayersPage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // Fetch players from supabase
    const { data: players, error } = await supabase
        .from('players')
        .select('*, skills(*)')
        .order('first_name', { ascending: true })

    return <PlayersClient initialPlayers={players || []} />
}
