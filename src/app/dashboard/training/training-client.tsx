'use client'

import { useState } from 'react'
import { Plus, Database, CalendarDays, BookOpen, AlertCircle, X, Loader2, ArrowRight, Shield, Clock, ExternalLink, Edit2, Trash2, LayoutGrid, List, Check, Save, Users } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { useLang } from '@/components/lang-provider'
import Link from 'next/link'

export default function TrainingClient({ initialEvents, initialDrills, coaches, needsSetup, attendanceCounts = {} }: { initialEvents: any[], initialDrills: any[], coaches: any[], needsSetup: boolean, attendanceCounts?: Record<string, number> }) {
    const supabase = createClient()
    const [events, setEvents] = useState(initialEvents)
    const [drills, setDrills] = useState(initialDrills)
    const [viewMode, setViewMode] = useState<'events' | 'drills'>('events')
    const [eventsLayout, setEventsLayout] = useState<'grid' | 'list'>('grid')
    const { t } = useLang()

    // Modals & Inline Edit
    const [isCreatingEvent, setIsCreatingEvent] = useState(false)
    const [isCreatingDrill, setIsCreatingDrill] = useState(false)
    const [editingDrillId, setEditingDrillId] = useState<string | null>(null)

    // Inline Event Title Edit
    const [editingEventId, setEditingEventId] = useState<string | null>(null)
    const [editingEventTitle, setEditingEventTitle] = useState('')
    const [loading, setLoading] = useState(false)

    // Form states
    const [newEvent, setNewEvent] = useState({ title: '', event_date: '', event_time: '', location: '', objectives: '' })
    const [newDrill, setNewDrill] = useState({ name: '', description: '', duration_minutes: 15, focus_level_1: '', focus_level_2: '', youtube_link: '' })

    if (needsSetup) {
        return (
            <div className="p-6 md:p-10 min-h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] flex items-center justify-center">
                <div className="bg-white dark:bg-[#0B1526] p-8 rounded-3xl shadow-xl max-w-xl text-center border border-gray-200 dark:border-white/10">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Database className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black mb-4 dark:text-white">Base de Datos No Encontrada</h2>
                    <button onClick={() => window.location.reload()} className="bg-liceo-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:opacity-90">
                        Recargar
                    </button>
                </div>
            </div>
        )
    }

    const handleSaveDrill = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        if (editingDrillId) {
            const { data, error } = await supabase.from('drills').update(newDrill).eq('id', editingDrillId).select()
            if (!error && data) {
                setDrills(drills.map((d: any) => d.id === editingDrillId ? data[0] : d))
                closeDrillModal()
                showSuccessToast('Drill Actualizado', 'El ejercicio fue modificado con éxito.')
            } else {
                console.error(error)
                showErrorToast('Error', 'No se pudo actualizar el drill.')
            }
        } else {
            const { data, error } = await supabase.from('drills').insert([newDrill]).select()
            if (!error && data) {
                setDrills([...drills, data[0]])
                closeDrillModal()
                showSuccessToast('Drill Creado', 'El ejercicio se guardó en la librería.')
            } else {
                console.error(error)
                showErrorToast('Error', 'No se pudo crear el drill.')
            }
        }
        setLoading(false)
    }

    const openEditDrill = (drill: any) => {
        setNewDrill({
            name: drill.name,
            description: drill.description || '',
            duration_minutes: drill.duration_minutes || 15,
            focus_level_1: drill.focus_level_1 || '',
            focus_level_2: drill.focus_level_2 || '',
            youtube_link: drill.youtube_link || ''
        })
        setEditingDrillId(drill.id)
        setIsCreatingDrill(true)
    }

    const closeDrillModal = () => {
        setIsCreatingDrill(false)
        setEditingDrillId(null)
        setNewDrill({ name: '', description: '', duration_minutes: 15, focus_level_1: '', focus_level_2: '', youtube_link: '' })
    }

    const handleDeleteDrill = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este drill de la librería?')) return;

        const { error } = await supabase.from('drills').delete().eq('id', id)
        if (!error) {
            setDrills(drills.filter((d: any) => d.id !== id))
            showSuccessToast('Drill Eliminado', 'Se ha quitado el ejercicio de la librería.')
        } else {
            console.error(error)
            showErrorToast('Error de Integridad', 'No se puede eliminar. Es probable que este drill ya esté asociado a una planificación pasada o futura.')
        }
    }

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { data, error } = await supabase.from('events').insert([newEvent]).select()
        if (!error && data) {
            setEvents([data[0], ...events]) // Add to top since it's order desc
            setIsCreatingEvent(false)
            setNewEvent({ title: '', event_date: '', event_time: '', location: '', objectives: '' })
            showSuccessToast('Evento Creado', 'Entrenamiento planificado correctamente.')
        } else {
            console.error(error)
            showErrorToast('Error', 'No se pudo crear el evento.')
        }
        setLoading(false)
    }

    const handleSaveEventTitle = async (id: string) => {
        if (!editingEventTitle.trim()) {
            setEditingEventId(null)
            return
        }

        const { error } = await supabase.from('events').update({ title: editingEventTitle }).eq('id', id)
        if (!error) {
            setEvents(events.map((e: any) => e.id === id ? { ...e, title: editingEventTitle } : e))
            setEditingEventId(null)
            showSuccessToast('Título Actualizado', 'El nombre del entrenamiento ha cambiado.')
        } else {
            showErrorToast('Error', 'No se pudo actualizar el nombre.')
        }
    }

    return (
        <div className="p-6 md:p-10 min-h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-liceo-primary/30 via-background to-background dark:from-liceo-primary/20 dark:via-background dark:to-background text-foreground transition-colors space-y-8">
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-liceo-primary to-liceo-accent dark:from-white dark:to-liceo-accent mb-2">
                        {viewMode === 'events' ? t.training.title : t.training.libraryTitle}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {viewMode === 'events' ? t.training.subtitle : t.training.librarySubtitle}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    {viewMode === 'events' && (
                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl shadow-inner border border-gray-200 dark:border-white/10 w-full sm:w-auto self-start sm:self-auto">
                            <button onClick={() => setEventsLayout('grid')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${eventsLayout === 'grid' ? 'bg-white dark:bg-[#0B1526] text-liceo-primary dark:text-[#5EE5F8] shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEventsLayout('list')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${eventsLayout === 'list' ? 'bg-white dark:bg-[#0B1526] text-liceo-primary dark:text-[#5EE5F8] shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode(viewMode === 'events' ? 'drills' : 'events')}
                            className="flex-1 sm:flex-none bg-white hover:bg-gray-50 dark:bg-[#0B1526] dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 shadow-sm text-liceo-primary dark:text-[#5EE5F8] font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            {viewMode === 'events' ? <><BookOpen className="w-4 h-4" /> {t.training.viewLibrary}</> : <><CalendarDays className="w-4 h-4" /> {t.training.viewEvents}</>}
                        </button>
                        <button
                            onClick={() => viewMode === 'events' ? setIsCreatingEvent(true) : setIsCreatingDrill(true)}
                            className="flex-1 sm:flex-none bg-liceo-primary hover:bg-liceo-primary/90 dark:bg-liceo-gold dark:hover:bg-yellow-400 rounded-xl px-4 py-2.5 shadow-lg dark:shadow-[0_4px_20px_rgba(255,217,0,0.3)] flex items-center justify-center gap-2 transition-all font-bold text-sm text-white dark:text-[#0B1526]"
                        >
                            <Plus className="w-5 h-5" />
                            {viewMode === 'events' ? t.training.planEvent : t.training.createDrill}
                        </button>
                    </div>
                </div>
            </header>

            {/* CREATE DRILL MODAL */}
            {isCreatingDrill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0B1526] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black dark:text-white flex items-center gap-2"><BookOpen className="w-6 h-6 text-liceo-primary dark:text-[#5EE5F8]" /> {editingDrillId ? 'Editar Drill' : 'Nuevo Drill'}</h2>
                            <button onClick={closeDrillModal} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full"><X className="w-5 h-5 dark:text-white" /></button>
                        </div>
                        <form onSubmit={handleSaveDrill} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Nombre del Ejercicio</label>
                                <input required value={newDrill.name} onChange={e => setNewDrill({ ...newDrill, name: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Descripción / Mecánica</label>
                                <textarea required value={newDrill.description} onChange={e => setNewDrill({ ...newDrill, description: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white min-h-[100px]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Foco Nivel 1 (Básico)</label>
                                    <input value={newDrill.focus_level_1} onChange={e => setNewDrill({ ...newDrill, focus_level_1: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Foco Nivel 2 (Avanzado)</label>
                                    <input value={newDrill.focus_level_2} onChange={e => setNewDrill({ ...newDrill, focus_level_2: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Duración Default (min)</label>
                                    <input type="number" required value={newDrill.duration_minutes} onChange={e => setNewDrill({ ...newDrill, duration_minutes: parseInt(e.target.value) })} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Video Ref (YouTube Link)</label>
                                    <input value={newDrill.youtube_link} onChange={e => setNewDrill({ ...newDrill, youtube_link: e.target.value })} placeholder="https://youtube.com/..." className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white text-sm" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full mt-6 py-3 rounded-xl font-bold bg-liceo-primary dark:bg-liceo-gold text-white dark:text-[#0B1526] hover:opacity-90 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingDrillId ? 'Guardar Cambios' : 'Guardar Drill en Librería'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE EVENT MODAL */}
            {isCreatingEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0B1526] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black dark:text-white flex items-center gap-2"><CalendarDays className="w-6 h-6 text-liceo-primary dark:text-[#5EE5F8]" /> Nuevo Evento</h2>
                            <button onClick={() => setIsCreatingEvent(false)} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full"><X className="w-5 h-5 dark:text-white" /></button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Título / Tipo</label>
                                <input required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Ej. Entrenamiento Martes" className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Fecha</label>
                                    <input type="date" required value={newEvent.event_date} onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Hora</label>
                                    <input type="time" required value={newEvent.event_time} onChange={e => setNewEvent({ ...newEvent, event_time: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Lugar</label>
                                <input required value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Cancha 1" className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Objetivo del Día</label>
                                <textarea required value={newEvent.objectives} onChange={e => setNewEvent({ ...newEvent, objectives: e.target.value })} placeholder="Duelo, contacto, rucks rápidos..." className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white min-h-[80px]" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full mt-6 py-3 rounded-xl font-bold bg-liceo-primary dark:bg-liceo-gold text-white dark:text-[#0B1526] hover:opacity-90 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Agendar Entrenamiento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEWS */}
            {viewMode === 'events' && (
                <div className={eventsLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                    {events.map((ev: any) => {
                        const isPast = new Date(ev.event_date + 'T' + (ev.event_time || '00:00')) < new Date()
                        const statusToDisplay = isPast ? 'Completo' : ev.status
                        const attendees = attendanceCounts[ev.id] || 0

                        return eventsLayout === 'grid' ? (
                            <div key={ev.id} className="bg-white/80 dark:bg-[#0B1526]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col relative group">
                                <div className={`absolute top-4 right-4 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold ${isPast ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                    {statusToDisplay}
                                </div>
                                <div className="pr-16 mb-1">
                                    {editingEventId === ev.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                value={editingEventTitle}
                                                onChange={(e) => setEditingEventTitle(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEventTitle(ev.id); else if (e.key === 'Escape') setEditingEventId(null) }}
                                                className="w-full text-xl font-black text-gray-900 dark:text-white bg-transparent border-b-2 border-liceo-primary dark:border-[#5EE5F8] focus:outline-none"
                                            />
                                            <button onClick={() => handleSaveEventTitle(ev.id)} className="text-emerald-500 p-1"><Save className="w-5 h-5" /></button>
                                            <button onClick={() => setEditingEventId(null)} className="text-gray-400 p-1"><X className="w-5 h-5" /></button>
                                        </div>
                                    ) : (
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white group flex items-center gap-2">
                                            {ev.title}
                                            <button onClick={() => { setEditingEventId(ev.id); setEditingEventTitle(ev.title) }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-liceo-primary transition-opacity"><Edit2 className="w-4 h-4" /></button>
                                        </h3>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
                                    <p suppressHydrationWarning className="text-sm text-liceo-primary dark:text-[#5EE5F8] font-bold flex items-center gap-1.5">
                                        <CalendarDays className="w-4 h-4" />
                                        {new Date(ev.event_date + 'T00:00:00').toLocaleDateString('es-AR')} a las {ev.event_time?.slice(0, 5)}hs
                                    </p>
                                    {isPast && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                                            <Users className="w-4 h-4" />
                                            {attendees} asistencias
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">{ev.objectives}</p>

                                <Link href={`/dashboard/training/${ev.id}`} className="mt-auto flex items-center justify-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-liceo-primary hover:text-white dark:hover:bg-liceo-gold dark:hover:text-[#0B1526] text-liceo-primary dark:text-liceo-gold py-3 rounded-xl font-bold transition-colors">
                                    {t.training.openPlan}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div key={ev.id} className="bg-white dark:bg-[#0B1526] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${isPast ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                            {statusToDisplay}
                                        </div>
                                        <p suppressHydrationWarning className="text-xs text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5">
                                            <CalendarDays className="w-3 h-3" />
                                            {new Date(ev.event_date + 'T00:00:00').toLocaleDateString('es-AR')} - {ev.event_time?.slice(0, 5)}hs
                                        </p>
                                        {isPast && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                                                <Users className="w-3 h-3" />
                                                {attendees}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center max-w-lg">
                                        {editingEventId === ev.id ? (
                                            <div className="flex items-center gap-2 w-full">
                                                <input
                                                    autoFocus
                                                    value={editingEventTitle}
                                                    onChange={(e) => setEditingEventTitle(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEventTitle(ev.id); else if (e.key === 'Escape') setEditingEventId(null) }}
                                                    className="flex-1 text-lg font-black text-gray-900 dark:text-white bg-transparent border-b-2 border-liceo-primary dark:border-[#5EE5F8] focus:outline-none py-1"
                                                />
                                                <button onClick={() => handleSaveEventTitle(ev.id)} className="text-emerald-500 p-2"><Save className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingEventId(null)} className="text-gray-400 p-2"><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <div className="group flex items-center gap-2 w-full">
                                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{ev.title}</h3>
                                                <button onClick={() => { setEditingEventId(ev.id); setEditingEventTitle(ev.title) }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-liceo-primary transition-opacity p-2"><Edit2 className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{ev.objectives || 'Sin descripción'}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <Link href={`/dashboard/training/${ev.id}`} className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-liceo-primary hover:text-white dark:hover:bg-liceo-gold dark:hover:text-[#0B1526] text-liceo-primary dark:text-liceo-gold px-6 py-2.5 rounded-xl font-bold transition-colors w-full md:w-auto">
                                        Abrir
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                    {events.length === 0 && (
                        <div className="col-span-full py-16 text-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.training.noEvents}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{t.training.noEventsDesc}</p>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'drills' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {drills.map((d: any) => (
                        <div key={d.id} className="bg-white dark:bg-[#0B1526] border border-gray-200 dark:border-white/10 rounded-3xl p-5 shadow-lg flex flex-col relative group">

                            {/* Action Buttons (Hover) */}
                            <div className="absolute top-4 right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                                <button onClick={() => openEditDrill(d)} className="p-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-gray-700 dark:text-white shadow-md transition-colors border border-gray-200 dark:border-white/20 backdrop-blur-md">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteDrill(d.id)} className="p-1.5 bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/40 rounded-lg text-rose-600 dark:text-rose-400 shadow-md transition-colors border border-rose-200 dark:border-rose-500/30 backdrop-blur-md">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 bg-liceo-primary/10 dark:bg-[#5EE5F8]/10 text-liceo-primary dark:text-[#5EE5F8] rounded-xl flex items-center justify-center font-black">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full group-hover:opacity-0 transition-opacity"><Clock className="w-3 h-3" /> {d.duration_minutes}m</span>
                            </div>
                            <h3 className="font-black text-gray-900 dark:text-white mb-2">{d.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{d.description}</p>

                            <div className="space-y-2 mb-4 flex-1">
                                {d.focus_level_1 && <div className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-1 rounded font-semibold break-words border border-blue-100 dark:border-blue-500/20"><span className="font-black uppercase tracking-wider">Nv 1:</span> {d.focus_level_1}</div>}
                                {d.focus_level_2 && <div className="text-[10px] bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 px-2 py-1 rounded font-semibold break-words border border-purple-100 dark:border-purple-500/20"><span className="font-black uppercase tracking-wider">Nv 2:</span> {d.focus_level_2}</div>}
                            </div>

                            {d.youtube_link && (
                                <a href={d.youtube_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 py-2 rounded-lg transition-colors">
                                    <ExternalLink className="w-3 h-3" />
                                    Ver Video Referencia
                                </a>
                            )}
                        </div>
                    ))}
                    {drills.length === 0 && (
                        <div className="col-span-full py-16 text-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.training.emptyLibrary}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{t.training.emptyLibraryDesc}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
