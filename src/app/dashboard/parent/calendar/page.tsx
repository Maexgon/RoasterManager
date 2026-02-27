import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './calendar-client'

export const dynamic = 'force-dynamic'

export default async function ParentCalendarPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Obtener perfil para verificar is_parent (opcional pero recomendado)
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_parent')
        .eq('id', user.id)
        .single()

    // Fetch upcoming events from the next 60 days
    const today = new Date().toISOString()
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', today)
        .order('event_date', { ascending: true })

    return <CalendarClient initialEvents={events || []} />
}
