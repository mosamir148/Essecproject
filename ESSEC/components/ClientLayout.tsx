'use client'

import { Providers } from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import LoadingPage from '@/components/LoadingPage'
import { ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

function LoadingPageWithTheme() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which logo to use based on theme
  // Use resolvedTheme to handle 'system' theme, fallback to checking document class
  const isDarkMode = mounted && (resolvedTheme === 'dark' || (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')))
  const logoSrc = isDarkMode ? '/logo w.PNG' : '/logo.PNG'

  return <LoadingPage logo={logoSrc} websiteName="ESSEC" />
}

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <LoadingPageWithTheme />
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </Providers>
  )
}

