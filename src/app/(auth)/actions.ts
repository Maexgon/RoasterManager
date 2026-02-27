'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Por favor completá todos los campos.' }
    }

    const supabase = await createClient()

    const entryPoint = formData.get('entryPoint') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenciales inválidas.' }
    }

    if (entryPoint === 'parent') {
        redirect('/dashboard/parent')
    } else {
        redirect('/dashboard/staff')
    }
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    if (!email || !password || !fullName) {
        return { error: 'Por favor completá todos los campos.' }
    }

    // Password Validation
    if (password.length < 8) {
        return { error: 'La contraseña debe tener al menos 8 caracteres.' }
    }
    if (!/[A-Z]/.test(password)) {
        return { error: 'La contraseña debe incluir al menos una mayúscula.' }
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { error: 'La contraseña debe incluir al menos un carácter especial.' }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/dashboard')
}
