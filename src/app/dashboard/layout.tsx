'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Plus,
    Dumbbell,
    Trophy,
    Search,
    Bell,
    LogOut,
    UserCircle,
    Globe
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { LangProvider, useLang } from '@/components/lang-provider'
import { ModeToggle } from '@/components/mode-toggle'
import Image from 'next/image'
import { useEffect, useState } from 'react'

function DashboardHeader() {
    const { lang, setLang, t } = useLang()
    const router = useRouter()
    const supabase = createClient()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-[#0B1526]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 shadow-md py-3' : 'bg-white dark:bg-[#0B1526] py-4 md:py-5'} px-4 md:px-6 flex items-center justify-between`}>
            {/* Left Box: Logo & Title */}
            <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 dark:border-liceo-gold/30 bg-gray-50 dark:bg-[#111f38] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image src="/logo-cglnm-liceo-naval.png" alt="Liceo Logo" width={32} height={32} className="object-contain p-1" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-liceo-primary dark:text-liceo-gold font-black text-sm md:text-lg uppercase tracking-wider leading-tight">
                        M13 Liceo Naval
                    </h1>
                    <span className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-semibold tracking-wide uppercase">
                        {t.nav.system}
                    </span>
                </div>
            </div>

            {/* Middle Nav for Desktop Only */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-10">
                <Link href="/dashboard" className="text-liceo-primary dark:text-liceo-gold text-sm font-bold border-b-2 border-liceo-primary dark:border-liceo-gold pb-1 transition-colors">{t.nav.dashboard}</Link>
                <Link href="/dashboard/players" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-bold pb-1 transition-colors">{t.nav.roster}</Link>
                <Link href="/dashboard/teams" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-bold pb-1 transition-colors">{t.nav.teams}</Link>
                <Link href="/dashboard/training" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-bold pb-1 transition-colors">{t.nav.training}</Link>
                <Link href="/dashboard/matches" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-bold pb-1 transition-colors">{t.nav.matches}</Link>
            </nav>

            {/* Right Box: Actions */}
            <div className="flex items-center gap-2 md:gap-3 ml-auto">
                <button
                    onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#172540] px-2 py-2 md:px-3 md:py-2.5 rounded-xl border border-gray-200 dark:border-white/5 font-bold text-xs"
                >
                    <Globe className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline uppercase">{lang}</span>
                </button>

                <div className="bg-gray-100 dark:bg-[#172540] rounded-xl border border-gray-200 dark:border-white/5 px-2 md:px-2.5 py-1 flex items-center">
                    <ModeToggle />
                </div>

                {/* Return Search & Bell via dropdowns/modals generally, but keep for desktop space */}
                <button className="hidden xl:flex text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#172540] p-2 md:p-2.5 rounded-xl border border-gray-200 dark:border-white/5">
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="hidden xl:flex text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#172540] p-2 md:p-2.5 rounded-xl border border-gray-200 dark:border-white/5 relative">
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-liceo-accent dark:bg-liceo-gold rounded-full"></span>
                </button>

                {/* Profile Mobile/Desktop */}
                <Link href="/dashboard/profile" className="hidden sm:flex text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#172540] p-2 md:p-2.5 rounded-xl border border-gray-200 dark:border-white/5">
                    <UserCircle className="w-4 h-4 md:w-5 md:h-5" />
                </Link>

                {/* Logout Button */}
                <button onClick={handleLogout} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-gray-100 dark:bg-[#172540] p-2 md:p-2.5 rounded-xl border border-gray-200 dark:border-white/5 flex items-center gap-2">
                    <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
        </header>
    )
}

function DashboardBottomNav() {
    const pathname = usePathname()
    const { t } = useLang()

    const navItems = [
        { name: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
        { name: t.nav.roster, href: '/dashboard/players', icon: Users },
        { name: t.nav.teams, href: '/dashboard/teams', icon: Globe },
        { name: t.nav.add, href: '/dashboard/add', icon: Plus, isPrimary: true },
        { name: t.nav.training, href: '/dashboard/training', icon: Dumbbell }
    ]

    return (
        <div className="lg:hidden fixed bottom-0 w-full bg-white dark:bg-[#0B1526] border-t border-gray-200 dark:border-white/10 px-6 py-2 pb-safe flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => {
                const isActive = pathname === item.href

                if (item.isPrimary) {
                    return (
                        <div key={item.name} className="relative -top-6">
                            <button className="w-14 h-14 bg-liceo-primary dark:bg-liceo-gold text-white dark:text-[#0B1526] hover:bg-liceo-primary/90 dark:hover:bg-yellow-400 rounded-full flex items-center justify-center shadow-lg dark:shadow-[0_4px_20px_rgba(255,217,0,0.4)] transition-transform active:scale-95 border-4 border-white dark:border-[#0B1526]">
                                <item.icon className="w-7 h-7" />
                            </button>
                        </div>
                    )
                }

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-liceo-primary dark:text-liceo-gold' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'} transition-colors`}
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-[10px] sm:text-xs font-semibold uppercase">{item.name}</span>
                    </Link>
                )
            })}
        </div>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Force dark mode look globally for the dashboard
    return (
        <LangProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B1526] text-gray-900 dark:text-white flex flex-col font-sans selection:bg-liceo-gold selection:text-[#0B1526]">
                <DashboardHeader />
                <main className="flex-1 w-full pt-20 md:pt-24 pb-24 lg:pb-8">
                    {children}
                </main>
                <DashboardBottomNav />
            </div>
        </LangProvider>
    )
}
