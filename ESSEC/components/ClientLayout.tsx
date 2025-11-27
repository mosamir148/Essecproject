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
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update isDarkMode when resolvedTheme changes
  useEffect(() => {
    if (mounted) {
      const checkDarkMode = () => {
        const dark = resolvedTheme === 'dark' || 
                    (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
        setIsDarkMode(dark)
      }
      checkDarkMode()
      
      // Also listen for DOM changes in case the class is updated asynchronously
      const observer = new MutationObserver(checkDarkMode)
      if (typeof document !== 'undefined') {
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class']
        })
      }
      
      return () => observer.disconnect()
    }
  }, [mounted, resolvedTheme])

  // Determine which logo to use based on theme
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

