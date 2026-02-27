'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Shield, Plus, Users, ArrowRight, Loader2, Trash2, LayoutGrid, List, X, Eye, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { useLang } from '@/components/lang-provider'

export default function TeamsClient({ initialTeams, allPlayers }: { initialTeams: any[], allPlayers: any[] }) {
    const router = useRouter()
    const supabase = createClient()
    const { t } = useLang()
    const [teams, setTeams] = useState(initialTeams)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isCreating, setIsCreating] = useState(false)
    const [newTeam, setNewTeam] = useState({ name: '', player_count: 15, substitutes_count: 8 })
    const [loading, setLoading] = useState(false)
    const [teamToDelete, setTeamToDelete] = useState<any>(null)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [rosterTeam, setRosterTeam] = useState<any>(null)
    const [isCopied, setIsCopied] = useState(false)

    const handleCopyLineup = () => {
        if (!rosterTeam) return
        const playerIds = Object.values(rosterTeam.lineup)
        const teamPlayers = allPlayers.filter(p => playerIds.includes(p.id))
        const textToCopy = teamPlayers.map(p => `${p.last_name}, ${p.first_name} - ${p.position?.split(',')[0]} (${p.category})`).join('\n')

        navigator.clipboard.writeText(`Alineación ${rosterTeam.name}:\n\n${textToCopy}`)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data, error } = await supabase
            .from('teams')
            .insert([{
                name: newTeam.name,
                player_count: newTeam.player_count,
                substitutes_count: newTeam.substitutes_count,
                lineup: {}
            }])
            .select()

        if (!error && data) {
            setTeams([data[0], ...teams])
            setIsCreating(false)
            setNewTeam({ name: '', player_count: 15, substitutes_count: 8 })
            showSuccessToast(t.teams.toastCreated, t.teams.toastCreatedDesc.replace('{name}', newTeam.name))
            router.push(`/dashboard/teams/${data[0].id}`)
        } else {
            console.error(error)
            showErrorToast(t.teams.toastCreateError, t.teams.toastCreateErrorDesc)
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!teamToDelete) return
        setIsDeleting(true)
        const { error } = await supabase.from('teams').delete().eq('id', teamToDelete.id)
        if (!error) {
            setTeams(teams.filter(t => t.id !== teamToDelete.id))
            showSuccessToast(t.teams.toastDeleted, t.teams.toastDeletedDesc)
            setTeamToDelete(null)
            setDeleteConfirmText('')
            router.refresh()
        } else {
            console.error(error)
            showErrorToast(t.teams.toastDeleteError, t.teams.toastDeleteErrorDesc)
        }
        setIsDeleting(false)
    }

    return (
        <div className="p-6 md:p-10 min-h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-liceo-primary/30 via-background to-background dark:from-liceo-primary/20 dark:via-background dark:to-background text-foreground transition-colors space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-liceo-primary to-liceo-accent dark:from-white dark:to-liceo-accent mb-2">
                        {t.teams.title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {t.teams.subtitle}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl shadow-inner border border-gray-200 dark:border-white/10 w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'grid' ? 'bg-white dark:bg-[#111f38] text-liceo-primary dark:text-[#5EE5F8] shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-white dark:bg-[#111f38] text-liceo-primary dark:text-[#5EE5F8] shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full sm:w-auto bg-liceo-primary hover:bg-liceo-primary/90 dark:bg-liceo-gold dark:hover:bg-yellow-400 rounded-xl px-4 py-2.5 shadow-lg dark:shadow-[0_4px_20px_rgba(255,217,0,0.3)] flex items-center justify-center gap-2 transition-all font-bold text-sm text-white dark:text-[#0B1526]"
                    >
                        <Plus className="w-5 h-5" />
                        {t.teams.newTeam}
                    </button>
                </div>
            </header>

            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <form onSubmit={handleCreate} className="bg-white dark:bg-[#0B1526] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 dark:text-white">
                            <Shield className="w-6 h-6 text-liceo-primary dark:text-liceo-gold" />
                            {t.teams.createTeam}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t.teams.teamName}</label>
                                <input
                                    required
                                    value={newTeam.name}
                                    onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                                    placeholder={t.teams.placeholderFormat}
                                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t.teams.players}</label>
                                    <input
                                        type="number" required min="7" max="15"
                                        value={newTeam.player_count}
                                        onChange={e => setNewTeam({ ...newTeam, player_count: parseInt(e.target.value) })}
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white font-bold text-center"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t.teams.substitutes}</label>
                                    <input
                                        type="number" required min="0" max="15"
                                        value={newTeam.substitutes_count}
                                        onChange={e => setNewTeam({ ...newTeam, substitutes_count: parseInt(e.target.value) })}
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-liceo-accent dark:text-white font-bold text-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            >
                                {t.teams.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !newTeam.name}
                                className="flex-1 py-3 rounded-xl font-bold bg-liceo-primary dark:bg-liceo-gold text-white dark:text-[#0B1526] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.teams.create}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {teamToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0B1526] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 text-red-500 flex items-center justify-center rounded-2xl mb-4 mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black mb-2 text-center text-gray-900 dark:text-white">{t.teams.deleteTeam}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                            {t.teams.deleteWarningPre}<span className="font-bold text-gray-900 dark:text-white">{teamToDelete.name}</span>{t.teams.deleteWarningPost}<strong className="text-red-500 select-none">{t.teams.deleteWarningConfirmText}</strong>{t.teams.deleteWarningPost2}
                        </p>

                        <input
                            type="text"
                            placeholder={t.teams.deletePlaceholder}
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-bold mb-6 dark:text-white"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setTeamToDelete(null); setDeleteConfirmText(''); }}
                                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            >
                                {t.teams.cancel}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting || deleteConfirmText.toLowerCase() !== t.teams.deleteWarningConfirmText.toLowerCase() && deleteConfirmText.toLowerCase() !== 'delete'}
                                className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : t.teams.deleteAction}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rosterTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0B1526] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-liceo-primary dark:text-liceo-gold" />
                                Jugadores en {rosterTeam.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopyLineup}
                                    title="Copiar lista"
                                    className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 dark:text-gray-300 text-gray-600" />}
                                </button>
                                <button onClick={() => setRosterTeam(null)} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-4 h-4 dark:text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 pr-2 space-y-2">
                            {(() => {
                                const playerIds = Object.values(rosterTeam.lineup)
                                const teamPlayers = allPlayers.filter(p => playerIds.includes(p.id))

                                if (teamPlayers.length === 0) {
                                    return <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No hay jugadores asignados a este equipo aún.</p>
                                }

                                return teamPlayers.map(player => (
                                    <div key={player.id} className="bg-gray-50 dark:bg-[#102035] p-3 rounded-xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-[#0B1526] rounded-full flex items-center justify-center font-black text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-white/5 shadow-sm">
                                            {player.first_name?.charAt(0)}{player.last_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{player.last_name}, {player.first_name}</p>
                                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{player.category} • {player.position?.split(',')[0]}</p>
                                        </div>
                                    </div>
                                ))
                            })()}
                        </div>
                    </div>
                </div>
            )}

            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                {teams.map(team => (
                    viewMode === 'grid' ? (
                        <div key={team.id} className="bg-white/80 dark:bg-[#0B1526]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:shadow-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all flex flex-col relative group">

                            <button onClick={() => setTeamToDelete(team)} className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity dark:bg-red-500/10 dark:hover:bg-red-500/20">
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="w-14 h-14 bg-liceo-primary/10 dark:bg-liceo-gold/10 rounded-2xl flex items-center justify-center mb-5 text-liceo-primary dark:text-liceo-gold group-hover:scale-110 transition-transform">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{team.name}</h3>

                            <div className="flex gap-4 mb-6 pt-4 border-t border-gray-100 dark:border-white/5">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400">{t.teams.starters}</p>
                                    <p className="text-lg font-black text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Users className="w-4 h-4 text-liceo-primary dark:text-liceo-gold" />
                                        {team.player_count}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400">{t.teams.substitutes}</p>
                                    <p className="text-lg font-black text-gray-700 dark:text-gray-300">
                                        {team.substitutes_count}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto flex gap-2 w-full">
                                <button onClick={() => setRosterTeam(team)} className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-colors" title="Ver Jugadores">
                                    <Eye className="w-4 h-4" />
                                </button>
                                <Link href={`/dashboard/teams/${team.id}`} className="flex-[3] flex items-center justify-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-liceo-primary hover:text-white dark:hover:bg-liceo-gold dark:hover:text-[#0B1526] text-liceo-primary dark:text-liceo-gold py-3 rounded-xl font-bold transition-colors">
                                    {t.teams.viewLineup}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div key={team.id} className="bg-white/80 dark:bg-[#0B1526]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-liceo-primary/10 dark:bg-liceo-gold/10 rounded-xl flex items-center justify-center shrink-0 text-liceo-primary dark:text-liceo-gold group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-liceo-primary dark:group-hover:text-liceo-gold transition-colors">{team.name}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {team.player_count} {t.teams.starters.toLowerCase()}
                                        </span>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {team.substitutes_count} {t.teams.substitutes.toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setTeamToDelete(team)} className="p-2 sm:p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity dark:bg-red-500/10 dark:hover:bg-red-500/20">
                                    <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                </button>
                                <button onClick={() => setRosterTeam(team)} className="p-2 sm:p-2 bg-gray-50 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300" title="Ver Jugadores">
                                    <Eye className="w-5 h-5 sm:w-5 sm:h-5" />
                                </button>
                                <Link href={`/dashboard/teams/${team.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-liceo-primary hover:text-white dark:hover:bg-liceo-gold dark:hover:text-[#0B1526] text-liceo-primary dark:text-liceo-gold px-6 py-2.5 sm:py-2 rounded-xl font-bold transition-colors">
                                    {t.teams.viewLineup}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )
                ))}

                {teams.length === 0 && !isCreating && (
                    <div className="col-span-full py-16 text-center flex flex-col items-center">
                        <div className="bg-white/50 dark:bg-white/5 p-6 rounded-full inline-block mb-4">
                            <Shield className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.teams.noTeams}</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                            {t.teams.noTeamsDesc}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
