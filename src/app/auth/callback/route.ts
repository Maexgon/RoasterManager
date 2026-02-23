import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Redirect to the dashboard upon successful authentication
            return NextResponse.redirect(`${origin}/dashboard`)
        }
    }

    // Redirect to login error page if authentication fails
    return NextResponse.redirect(`${origin}/login?error=social-login-failed`)
}
