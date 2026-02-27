import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TeamBuilderClient from './team-builder-client'

export const dynamic = 'force-dynamic'

export default async function TeamBuilderPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Get the team
    const { data: team, error: teamErr } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

    if (teamErr || !team) {
        redirect('/dashboard/teams')
    }

    // Get all players and their skills
    const { data: players } = await supabase
        .from('players')
        .select(`
            *,
            skills (
                *
            )
        `)
        .neq('status', 'Abandonado')
        .order('last_name')

    // Prepare players to only keep latest skill
    const formattedPlayers = (players || []).map(p => {
        const sortedSkills = p.skills?.sort((a: any, b: any) => new Date(b.date_logged).getTime() - new Date(a.date_logged).getTime())
        return {
            ...p,
            skills: sortedSkills?.[0] || null
        }
    })

    const { data: allTeams } = await supabase.from('teams').select('id, name, lineup')

    return <TeamBuilderClient initialTeam={team} allPlayers={formattedPlayers} allTeams={allTeams || []} />
}
