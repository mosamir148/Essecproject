'use client'

import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/hooks/useLanguage'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  )
}

