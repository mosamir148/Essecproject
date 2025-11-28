'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import DefaultImage from '@/components/DefaultImage'
import styles from './LoadingPage.module.css'

interface LoadingPageProps {
  logo?: string
  websiteName?: string
  onComplete?: () => void
  minDisplayTime?: number // Minimum time to show loader in ms
}

export default function LoadingPage({ 
  logo = '/logo.PNG', 
  websiteName = 'ESSEC',
  onComplete,
  minDisplayTime = 2000 
}: LoadingPageProps) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0) // Always start at 0 to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const startTime = useRef(Date.now())
  const isCompleteRef = useRef(false)
  const previousPathname = useRef(pathname)

  // Set mounted flag to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset loading state when pathname changes
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      // Route changed - show loading page
      setIsVisible(true)
      setProgress(0)
      startTime.current = Date.now()
      isCompleteRef.current = false
      previousPathname.current = pathname
    }
  }, [pathname])

  useEffect(() => {
    if (!isVisible || !mounted) return

    let isMounted = true
    let progressInterval: NodeJS.Timeout | null = null
    let contentCheckInterval: NodeJS.Timeout | null = null
    let fallbackTimeout: NodeJS.Timeout | null = null
    let completeTimeout: NodeJS.Timeout | null = null
    let finalTimeout: NodeJS.Timeout | null = null

    // Calculate loading progress
    const calculateProgress = () => {
      if (typeof window === 'undefined' || !isMounted) return 0

      try {
        let baseProgress = 50 // Start at 50% since document is usually already loaded in SPA

        // Check if images are loaded
        const images = document.querySelectorAll('img')
        if (images.length > 0) {
          let loadedImages = 0
          images.forEach((img) => {
            if (img.complete && img.naturalHeight !== 0) {
              loadedImages++
            }
          })
          const imageProgress = (loadedImages / images.length) * 50
          return Math.min(100, baseProgress + imageProgress)
        }

        return baseProgress
      } catch (error) {
        // If DOM access fails, return safe default
        return 50
      }
    }

    // Simulate smooth progress animation
    let currentProgress = 0
    const targetProgress = 100
    progressInterval = setInterval(() => {
      if (!isMounted) {
        if (progressInterval) clearInterval(progressInterval)
        return
      }
      // Gradually increase progress
      if (currentProgress < targetProgress) {
        currentProgress = Math.min(targetProgress, currentProgress + 2)
        setProgress(currentProgress)
      }
    }, 50)

    // Check for content readiness
    const checkContentReady = () => {
      if (typeof window === 'undefined' || !isMounted) return false
      
      try {
        // Check if main content exists and images are loading/loaded
        const main = document.querySelector('main')
        const images = document.querySelectorAll('img')
        
        if (main && images.length > 0) {
          let allImagesLoaded = true
          images.forEach((img) => {
            if (!img.complete || img.naturalHeight === 0) {
              allImagesLoaded = false
            }
          })
          return allImagesLoaded
        }
        
        return main !== null
      } catch (error) {
        // If DOM access fails, return false
        return false
      }
    }

    // Handle completion
    const handleComplete = () => {
      if (isCompleteRef.current || !isMounted) return
      
      const elapsed = Date.now() - startTime.current
      const remainingTime = Math.max(0, minDisplayTime - elapsed)
      
      completeTimeout = setTimeout(() => {
        if (isCompleteRef.current || !isMounted) return
        isCompleteRef.current = true
        
        if (isMounted) {
          setProgress(100)
        }
        
        if (progressInterval) {
          clearInterval(progressInterval)
          progressInterval = null
        }
        
        finalTimeout = setTimeout(() => {
          if (isMounted) {
            setIsVisible(false)
            if (onComplete) {
              setTimeout(() => {
                if (isMounted && onComplete) {
                  onComplete()
                }
              }, 500)
            }
          }
        }, 300)
      }, remainingTime)
    }

    // Check content readiness periodically
    contentCheckInterval = setInterval(() => {
      if (!isMounted) {
        if (contentCheckInterval) {
          clearInterval(contentCheckInterval)
          contentCheckInterval = null
        }
        return
      }
      
      if (checkContentReady() && currentProgress >= 90) {
        if (contentCheckInterval) {
          clearInterval(contentCheckInterval)
          contentCheckInterval = null
        }
        handleComplete()
      }
    }, 100)

    // Fallback: complete after reasonable time even if content check doesn't trigger
    fallbackTimeout = setTimeout(() => {
      if (!isCompleteRef.current && isMounted) {
        if (contentCheckInterval) {
          clearInterval(contentCheckInterval)
          contentCheckInterval = null
        }
        handleComplete()
      }
    }, Math.max(minDisplayTime, 1500))

    return () => {
      isMounted = false
      if (progressInterval) clearInterval(progressInterval)
      if (contentCheckInterval) clearInterval(contentCheckInterval)
      if (fallbackTimeout) clearTimeout(fallbackTimeout)
      if (completeTimeout) clearTimeout(completeTimeout)
      if (finalTimeout) clearTimeout(finalTimeout)
    }
  }, [onComplete, minDisplayTime, isVisible, pathname, mounted])

  if (!isVisible || !mounted) return null

  return (
    <div className={styles.loadingContainer}>
      {/* Background with subtle 3D gradient */}
      <div className={styles.background}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Logo or Website Name */}
        <div className={styles.logoContainer}>
          <DefaultImage 
            src={'/logo.PNG'} 
            alt={websiteName} 
            width={200} 
            height={70}
            className={styles.logo}
            priority
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>

        {/* Animated Loader */}
        <div className={styles.loaderWrapper}>
          {/* Energy Wave Animation */}
          <div className={styles.energyWaves}>
            <div className={styles.wave} style={{ '--delay': '0s' } as React.CSSProperties} />
            <div className={styles.wave} style={{ '--delay': '0.3s' } as React.CSSProperties} />
            <div className={styles.wave} style={{ '--delay': '0.6s' } as React.CSSProperties} />
          </div>

          {/* Solar Panel Grid */}
          <div className={styles.solarGrid}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={styles.solarPanel}>
                <div className={styles.panelSurface} />
                <div className={styles.panelGlow} />
              </div>
            ))}
          </div>

          {/* Central Energy Core */}
          <div className={styles.energyCore}>
            <div className={styles.coreInner} />
            <div className={styles.corePulse} />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className={styles.progressText} suppressHydrationWarning>
            {mounted ? `${Math.round(Math.min(progress, 100))}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  )
}

