'use client'

import React, { useState, useEffect } from 'react'
import { useLang } from '@/components/lang-provider'
import {
    Activity,
    Calendar,
    ChevronRight,
    Save,
    Upload,
    CheckCircle2,
    AlertCircle,
    User,
    Shield
} from 'lucide-react'
import { updateMedicalData } from './actions'
import { createClient } from '@/utils/supabase/client'

export default function MedicalRecordClient({ initialChildren }: { initialChildren: any[] }) {
    const { t } = useLang()
    const [selectedChildIndex, setSelectedChildIndex] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [formData, setFormData] = useState<any>(null)
    const [uploading, setUploading] = useState(false)

    const activeChild = initialChildren[selectedChildIndex]
    const supabase = createClient()

    useEffect(() => {
        if (activeChild) {
            setFormData({
                birth_date: activeChild.birth_date || '',
                height: activeChild.height || '',
                weight: activeChild.weight || '',
                dominant_foot: activeChild.dominant_foot || '',
                dominant_hand: activeChild.dominant_hand || '',
                blood_type: activeChild.blood_type || ''
            })
        }
    }, [activeChild])

    if (!activeChild || !formData) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        const result = await updateMedicalData(activeChild.id, formData)

        if (result.success) {
            setMessage({ type: 'success', text: 'Datos actualizados correctamente' })
        } else {
            setMessage({ type: 'error', text: result.error || 'Error al guardar' })
        }
        setIsSaving(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const filePath = `certificates/${activeChild.id}/${Math.random()}.${fileExt}`

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars') // Reusing avatars bucket if specialized medical one doesn't exist
                .upload(filePath, file)

            if (uploadError) throw uploadError

            setMessage({ type: 'success', text: 'Certificado subido con éxito. El staff lo revisará pronto.' })
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Error al subir: ' + error.message })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-liceo-primary/10 rounded-2xl flex items-center justify-center text-liceo-primary dark:text-liceo-gold border border-liceo-gold/20">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-liceo-primary dark:text-liceo-gold tracking-tight leading-tight uppercase italic">
                            Ficha Médica
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                            Gestioná la información de salud de tu hijo
                        </p>
                    </div>
                </div>

                {initialChildren.length > 1 && (
                    <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                        {initialChildren.map((child, idx) => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildIndex(idx)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedChildIndex === idx
                                    ? 'bg-liceo-primary text-white dark:bg-liceo-gold dark:text-[#0B1526]'
                                    : 'text-gray-400 hover:text-liceo-primary'
                                    }`}
                            >
                                {child.first_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    <p className="text-sm font-bold uppercase tracking-tight">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <form onSubmit={handleSave} className="bg-white dark:bg-[#111f38] rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-liceo-gold" />
                        <h2 className="text-sm font-black text-liceo-primary dark:text-liceo-gold uppercase tracking-[0.2em]">Datos Biométricos</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Grupo Sanguíneo</label>
                            <select
                                name="blood_type"
                                value={formData.blood_type}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all"
                            >
                                <option value="">Seleccionar</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Altura (cm)</label>
                            <input
                                type="number"
                                name="height"
                                placeholder="Ej: 165"
                                value={formData.height}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Peso (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                placeholder="Ej: 60"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Pie Dominante</label>
                            <select
                                name="dominant_foot"
                                value={formData.dominant_foot}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all"
                            >
                                <option value="">Seleccionar</option>
                                <option value="Izquierdo">Izquierdo</option>
                                <option value="Derecho">Derecho</option>
                                <option value="Ambidiestro">Ambidiestro</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Mano Dominante</label>
                            <select
                                name="dominant_hand"
                                value={formData.dominant_hand}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-liceo-gold outline-none transition-all"
                            >
                                <option value="">Seleccionar</option>
                                <option value="Izquierda">Izquierda</option>
                                <option value="Derecha">Derecha</option>
                                <option value="Ambidiestro">Ambidiestro</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-4 bg-liceo-primary dark:bg-liceo-gold text-white dark:text-[#0B1526] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Guardando...' : 'Guardar Información'}
                        </button>
                    </div>
                </form>

                {/* Medical Clearance Section */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-[#111f38] rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle2 className="w-5 h-5 text-liceo-gold" />
                            <h2 className="text-sm font-black text-liceo-primary dark:text-liceo-gold uppercase tracking-[0.2em]">Estado Apto Médico</h2>
                        </div>

                        <div className={`p-6 rounded-3xl border flex flex-col items-center text-center space-y-4 ${activeChild.medical_clearance
                                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                                : 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
                            }`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${activeChild.medical_clearance ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                {activeChild.medical_clearance ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                            </div>

                            <div>
                                <h3 className={`text-lg font-black uppercase tracking-tight ${activeChild.medical_clearance ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'
                                    }`}>
                                    {activeChild.medical_clearance ? 'Presentado y Validado' : 'Pendiente de Presentación'}
                                </h3>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                                    {activeChild.medical_clearance
                                        ? 'Toda la documentación está en regla. ¡Listo para jugar!'
                                        : 'Es obligatorio subir el apto médico firmado por un profesional.'}
                                </p>
                            </div>

                            {!activeChild.medical_clearance && (
                                <div className="w-full pt-4">
                                    <label className={`w-full py-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${uploading ? 'bg-gray-100 opacity-50' : 'bg-white/50 dark:bg-white/5 border-amber-300 dark:border-amber-500/30 hover:bg-white dark:hover:bg-white/10'
                                        }`}>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            accept=".pdf,image/*"
                                        />
                                        <Upload className={`w-6 h-6 ${uploading ? 'animate-bounce' : 'text-amber-500'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                            {uploading ? 'Subiendo...' : 'Subir Certificado (PDF/IMG)'}
                                        </span>
                                    </label>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-3">
                                        * Al subirlo, el staff verificará la validez del documento.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-liceo-primary to-[#0B1526] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-white/20"></div>
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-liceo-gold" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-black uppercase text-xs tracking-widest text-liceo-gold">Importante</h4>
                                <p className="text-xs font-medium leading-relaxed text-gray-300">
                                    Recordá que el apto médico debe ser renovado anualmente antes del inicio de la temporada competitiva.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
