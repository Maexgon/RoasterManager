"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="inline-flex items-center justify-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <div className="w-[1.2rem] h-[1.2rem] bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
            </button>
        )
    }

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark")
        else if (theme === "dark") setTheme("system")
        else setTheme("light")
    }

    const getCurrentIcon = () => {
        if (theme === "light") return <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
        if (theme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-400" />
        return <Monitor className="h-[1.2rem] w-[1.2rem] text-gray-500 dark:text-gray-400" />
    }

    const getCurrentLabel = () => {
        if (theme === "light") return "Claro"
        if (theme === "dark") return "Oscuro"
        return "Sistema"
    }

    return (
        <button
            onClick={cycleTheme}
            className="flex items-center gap-2 justify-center p-1.5 md:p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title={`Tema actual: ${getCurrentLabel()}`}
        >
            {getCurrentIcon()}
            <span className="text-xs font-bold uppercase hidden sm:inline text-gray-600 dark:text-gray-300">
                {getCurrentLabel()}
            </span>
        </button>
    )
}
