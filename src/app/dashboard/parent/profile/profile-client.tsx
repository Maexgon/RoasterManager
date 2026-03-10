'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { Key, Save, Loader2, User, Phone, Mail, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { updatePasswordAction } from './actions'

interface ParentProfileClientProps {
    profile: any
    user: any
}

export default function ParentProfileClient({ profile, user }: ParentProfileClientProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()
    const forceReset = searchParams.get('force_reset') === 'true'

    const [profileData, setProfileData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || ''
    })
    const [passwordData, setPasswordData] = useState({
        old: '',
        new: '',
        confirm: ''
    })
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isSavingPass, setIsSavingPass] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showOldPassword, setShowOldPassword] = useState(false)

    // Auto-hide passwords after 3 seconds
    useEffect(() => {
        if (showPassword) {
            const timer = setTimeout(() => setShowPassword(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [showPassword])

    useEffect(() => {
        if (showConfirmPassword) {
            const timer = setTimeout(() => setShowConfirmPassword(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [showConfirmPassword])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSavingProfile(true)
        const { error } = await supabase.from('profiles').update(profileData).eq('id', user.id)
        if (!error) showSuccessToast('Perfil Actualizado', 'Tus datos fueron guardados.')
        else showErrorToast('Error', 'No se pudo actualizar el perfil.')
        setIsSavingProfile(false)
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.old === passwordData.new) {
            showErrorToast('Error', 'La nueva contraseña no puede ser igual a la actual')
            return
        }
        if (passwordData.new !== passwordData.confirm) {
            showErrorToast('Error', 'Las contraseñas no coinciden')
            return
        }

        const hasMinLen = passwordData.new.length >= 8
        const hasUpper = /[A-Z]/.test(passwordData.new)
        const hasNumber = /[0-9]/.test(passwordData.new)
        const hasSpecial = /[^A-Za-z0-9]/.test(passwordData.new)

        if (!hasMinLen || !hasUpper || !hasNumber || !hasSpecial) {
            showErrorToast('Error', 'La contraseña no cumple con todas las reglas de seguridad')
            return
        }
        if (passwordData.new.length < 6) {
            showErrorToast('Error', 'La contraseña debe tener al menos 6 caracteres')
            return
        }

        setIsSavingPass(true)
        const result = await updatePasswordAction(passwordData.old, passwordData.new)
        if (result.success) {
            showSuccessToast('¡Listo!', 'Contraseña actualizada correctamente.')
            if (forceReset) router.push('/dashboard/parent')
        } else {
            showErrorToast('Error', result.error || 'No se pudo cambiar la contraseña')
        }
        setIsSavingPass(false)
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            {forceReset && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4 text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <h3 className="font-black uppercase tracking-tight text-sm">Cambio de Contraseña Obligatorio</h3>
                        <p className="text-xs font-medium mt-1 leading-relaxed opacity-80">Por seguridad, debes establecer una contraseña propia en tu primer ingreso al sistema.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Datos Personales */}
                {!forceReset && (
                    <div className="bg-white dark:bg-[#111f38] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                        <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3 dark:text-white">
                            <User className="w-5 h-5 text-liceo-gold" />
                            Mis Datos
                        </h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nombre Completo</label>
                                <input value={profileData.full_name} onChange={e => setProfileData({ ...profileData, full_name: e.target.value })} className="w-full px-5 py-3.5 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0B1526] font-bold text-sm dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Teléfono</label>
                                <input value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} className="w-full px-5 py-3.5 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0B1526] font-bold text-sm dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all" />
                            </div>
                            <button type="submit" disabled={isSavingProfile} className="w-full py-4 bg-liceo-primary dark:bg-white text-white dark:text-[#0B1526] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg disabled:opacity-50">
                                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Guardar Cambios'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Cambio de Contraseña */}
                <div className={`${forceReset ? 'md:col-span-2 max-w-md mx-auto w-full' : ''} bg-white dark:bg-[#111f38] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl`}>
                    <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3 dark:text-white">
                        <Key className="w-5 h-5 text-liceo-gold" />
                        Seguridad
                    </h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Contraseña Actual / Temporal</label>
                            <div className="relative">
                                <input type={showOldPassword ? 'text' : 'password'} required value={passwordData.old} onChange={e => setPasswordData({ ...passwordData, old: e.target.value })} className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0B1526] font-bold text-sm dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all" />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-liceo-gold transition-colors"
                                >
                                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nueva Contraseña</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0B1526] font-bold text-sm dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-liceo-gold transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Reglas de contraseña */}
                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2 border border-gray-100 dark:border-white/10">
                            <p className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-3">Requisitos de Seguridad</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold">
                                <div className={`flex items-center gap-2 ${passwordData.new.length >= 8 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${passwordData.new.length >= 8 ? 'opacity-100' : 'opacity-30'}`}><polyline points="20 6 9 17 4 12"></polyline></svg> Mínimo 8 caracteres
                                </div>
                                <div className={`flex items-center gap-2 ${/[A-Z]/.test(passwordData.new) ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${/[A-Z]/.test(passwordData.new) ? 'opacity-100' : 'opacity-30'}`}><polyline points="20 6 9 17 4 12"></polyline></svg> 1 Letra Mayúscula
                                </div>
                                <div className={`flex items-center gap-2 ${/[0-9]/.test(passwordData.new) ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${/[0-9]/.test(passwordData.new) ? 'opacity-100' : 'opacity-30'}`}><polyline points="20 6 9 17 4 12"></polyline></svg> Al menos 1 Número
                                </div>
                                <div className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(passwordData.new) ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${/[^A-Za-z0-9]/.test(passwordData.new) ? 'opacity-100' : 'opacity-30'}`}><polyline points="20 6 9 17 4 12"></polyline></svg> 1 Carácter Especial (*,#,!)
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <input type={showConfirmPassword ? 'text' : 'password'} required value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0B1526] font-bold text-sm dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all" />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-liceo-gold transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={isSavingPass} className="w-full py-4 bg-liceo-gold hover:bg-yellow-400 text-[#0B1526] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg disabled:opacity-50">
                            {isSavingPass ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (forceReset ? 'Establecer y Entrar' : 'Actualizar Password')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
