'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import enTranslations from '@/locales/en.json'
import arTranslations from '@/locales/ar.json'
import frTranslations from '@/locales/fr.json'

type Language = 'en' | 'ar' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: enTranslations,
  ar: arTranslations,
  fr: frTranslations,
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language
      if (saved && ['en', 'ar', 'fr'].includes(saved)) {
        setLanguageState(saved)
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('language', lang)
        if (document && document.documentElement) {
          document.documentElement.lang = lang
          document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
        }
      } catch (error) {
        // Silently handle DOM/localStorage errors
        console.error('Error setting language:', error)
      }
    }
  }

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      try {
        if (document && document.documentElement) {
          document.documentElement.lang = language
          document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
        }
      } catch (error) {
        // Silently handle DOM errors
        console.error('Error updating document language:', error)
      }
    }
  }, [language, mounted])

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return key
    }
    
    return typeof value === 'string' ? value : key
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dir: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

