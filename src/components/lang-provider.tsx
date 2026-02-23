'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { dicts } from '@/utils/i18n'

type Language = 'es' | 'en'
type Dict = typeof dicts.es

interface LangContextType {
    lang: Language
    setLang: (lang: Language) => void
    t: Dict
}

const LangContext = createContext<LangContextType | undefined>(undefined)

export function LangProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>('es')

    useEffect(() => {
        const stored = localStorage.getItem('app-lang') as Language
        if (stored && (stored === 'es' || stored === 'en')) {
            setLang(stored)
        }
    }, [])

    const handleSetLang = (newLang: Language) => {
        setLang(newLang)
        localStorage.setItem('app-lang', newLang)
    }

    return (
        <LangContext.Provider value={{ lang, setLang: handleSetLang, t: dicts[lang] }}>
            {children}
        </LangContext.Provider>
    )
}

export const useLang = () => {
    const context = useContext(LangContext)
    if (!context) {
        throw new Error('useLang must be used within a LangProvider')
    }
    return context
}
