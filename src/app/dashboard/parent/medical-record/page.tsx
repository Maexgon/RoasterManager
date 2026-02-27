import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MedicalRecordClient from './medical-record-client'

export const dynamic = 'force-dynamic'

export default async function MedicalRecordPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 1. Obtener los hijos vinculados
    const { data: linkages } = await supabase
        .from('player_parents')
        .select('player_id')
        .eq('parent_profile_id', user.id)

    const childIds = linkages?.map(l => l.player_id) || []

    // 2. Obtener datos médicos de los hijos
    let childrenData: any[] = []
    if (childIds.length > 0) {
        const { data: players } = await supabase
            .from('players')
            .select('*')
            .in('id', childIds)

        childrenData = players || []
    }

    return (
        <MedicalRecordClient
            initialChildren={childrenData}
        />
    )
}
