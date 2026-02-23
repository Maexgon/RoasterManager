'use client'

import { useActionState, useState } from 'react'
import { signup } from '../actions'
import { signInWithGoogle } from '../social-auth'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
    const [state, formAction, pending] = useActionState(
        async (prevState: any, formData: FormData) => await signup(formData),
        null
    )

    const [password, setPassword] = useState('')

    return (
        <div className="min-h-screen bg-[#0B1526] flex items-center justify-center p-4 selection:bg-liceo-gold selection:text-[#0B1526] text-white">
            <div className="max-w-md w-full bg-[#111f38] rounded-3xl shadow-2xl p-8 border border-white/5 relative overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-liceo-gold/5 rounded-full blur-3xl -my-32 transition-opacity opacity-50"></div>

                <div className="text-center flex flex-col items-center relative z-10 mb-8">
                    <div className="w-20 h-20 rounded-full bg-[#1e293b] flex items-center justify-center shadow-lg border border-liceo-gold/30 mb-6">
                        <Image src="/logo-cglnm-liceo-naval.png" alt="Liceo Naval Logo" width={80} height={80} className="object-contain p-2" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
                        Registrarse
                    </h1>
                    <p className="text-gray-400 font-medium tracking-wide">Unite al staff de M13 Liceo Naval</p>
                </div>

                {state?.error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center font-bold relative z-10 mb-6 border border-red-500/20">
                        {state.error}
                    </div>
                )}

                <div className="space-y-4 relative z-10">
                    <button
                        onClick={signInWithGoogle}
                        type="button"
                        className="w-full bg-[#1e293b] border border-white/10 text-white py-3 rounded-xl font-bold hover:bg-[#27354f] hover:border-liceo-gold/50 flex items-center justify-center gap-3 transition-all shadow-sm"
                    >
                        <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Registrarme con Google
                    </button>

                    <div className="flex items-center gap-4 py-2">
                        <div className="flex-1 border-t border-white/10"></div>
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">o con email</span>
                        <div className="flex-1 border-t border-white/10"></div>
                    </div>
                </div>

                <form action={formAction} className="space-y-4 relative z-10 mt-2">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Nombre Completo</label>
                        <input
                            name="full_name"
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-[#0B1526] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-liceo-gold focus:border-transparent outline-none transition-all placeholder:text-gray-600 font-medium"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-[#0B1526] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-liceo-gold focus:border-transparent outline-none transition-all placeholder:text-gray-600 font-medium"
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Contraseña</label>
                        <input
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#0B1526] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-liceo-gold focus:border-transparent outline-none transition-all placeholder:text-gray-600 font-medium"
                            placeholder="••••••••"
                        />
                        <div className="text-[10px] text-gray-400 mt-3 flex justify-between font-bold">
                            <span className={password.length >= 8 ? "text-[#00e676]" : ""}>✓ Mínimo 8</span>
                            <span className={/[A-Z]/.test(password) ? "text-[#00e676]" : ""}>✓ Mayúscula</span>
                            <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-[#00e676]" : ""}>✓ Especial</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full bg-liceo-gold text-[#0B1526] py-3.5 rounded-xl font-black tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50 mt-4 shadow-[0_4px_20px_rgba(255,217,0,0.2)] uppercase text-sm"
                    >
                        {pending ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-400 mt-8 relative z-10">
                    ¿Ya tenés una cuenta?{' '}
                    <Link href="/login" className="text-liceo-gold font-bold hover:underline transition-colors">
                        Ingresá acá
                    </Link>
                </div>
            </div>
        </div>
    )
}
