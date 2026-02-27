import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EventDetailClient from './event-detail-client'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    const { data: event, error: evErr } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (evErr || !event) {
        redirect('/dashboard/training')
    }

    // Get all drills to use in planning
    const { data: drills } = await supabase.from('drills').select('*').order('name')

    // Get plan slots
    const { data: planSlots } = await supabase
        .from('event_plan_slots')
        .select('*, drills(*)')
        .eq('event_id', id)
        .order('order_index')

    // Get attendance records
    const { data: attendance } = await supabase
        .from('event_attendance')
        .select('*')
        .eq('event_id', id)

    // Get notes
    const { data: notes } = await supabase
        .from('event_notes')
        .select('*, profiles(full_name, image_url)')
        .eq('event_id', id)
        .order('created_at', { ascending: false })

    // Get Players for attendance list
    const { data: players } = await supabase.from('players').select('*').neq('status', 'Abandonado').order('last_name')

    // Get coaches
    const { data: coaches } = await supabase.from('profiles').select('*')

    // Get teams
    const { data: teams } = await supabase.from('teams').select('*').order('name')

    return (
        <EventDetailClient
            event={event}
            drills={drills || []}
            initialSlots={planSlots || []}
            initialAttendance={attendance || []}
            initialNotes={notes || []}
            players={players || []}
            coaches={coaches || []}
            teams={teams || []}
            currentUser={user}
        />
    )
}
