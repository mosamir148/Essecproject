'use client'

import { Providers } from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import LoadingPage from '@/components/LoadingPage'
import { ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
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
    if (!mounted) return
    
    let observer: MutationObserver | null = null
    
    const checkDarkMode = () => {
      if (typeof document === 'undefined') return
      try {
        const dark = resolvedTheme === 'dark' || 
                    document.documentElement.classList.contains('dark')
        setIsDarkMode(dark)
      } catch (error) {
        // Silently handle any DOM access errors
        console.error('Error checking dark mode:', error)
      }
    }
    
    checkDarkMode()
    
    // Also listen for DOM changes in case the class is updated asynchronously
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        observer = new MutationObserver(checkDarkMode)
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class']
        })
      }
    } catch (error) {
      // Silently handle observer creation errors
      console.error('Error creating MutationObserver:', error)
    }
    
    return () => {
      if (observer) {
        try {
          observer.disconnect()
        } catch (error) {
          // Silently handle disconnect errors
        }
        observer = null
      }
    }
  }, [mounted, resolvedTheme])

  // Determine which logo to use based on theme
  const logoSrc = isDarkMode ? '/logo w.PNG' : '/logo.PNG'

  return <LoadingPage logo={logoSrc} websiteName="ESSEC" />
}

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  
  return (
    <Providers>
      <LoadingPageWithTheme />
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      {!isAdminPage && <Footer />}
      <ScrollToTop />
    </Providers>
  )
}

