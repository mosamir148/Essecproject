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
  onLoadingChange?: (isLoading: boolean) => void // Callback to notify parent of loading state
}

export default function LoadingPage({ 
  logo = '/logo.PNG', 
  websiteName = 'ESSEC',
  onComplete,
  minDisplayTime = 2000, // 2 seconds for navigation
  onLoadingChange
}: LoadingPageProps) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0) // Always start at 0 to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const startTime = useRef(Date.now())
  const isCompleteRef = useRef(false)
  const isInitialLoad = useRef(true)
  const previousPathname = useRef(pathname)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Set mounted flag to avoid hydration issues
  useEffect(() => {
    setMounted(true)
    // Notify parent immediately on mount that we're loading
    if (onLoadingChange) {
      onLoadingChange(true)
    }
  }, [onLoadingChange])

  // Notify parent of loading state changes
  useEffect(() => {
    if (onLoadingChange && mounted) {
      onLoadingChange(isVisible)
    }
  }, [isVisible, mounted, onLoadingChange])

  // Show loading page on every navigation (initial load and client-side navigation)
  useEffect(() => {
    // Check if this is a navigation (pathname changed)
    const isNavigation = previousPathname.current !== pathname
    
    if (isNavigation) {
      // Show loading page immediately on navigation
      setIsVisible(true)
      setProgress(0)
      startTime.current = Date.now()
      isCompleteRef.current = false
      previousPathname.current = pathname
      
      // Reset any existing intervals
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [pathname])

  useEffect(() => {
    if (!isVisible || !mounted) return

    let isMounted = true
    let progressInterval: NodeJS.Timeout | null = null
    progressIntervalRef.current = null // Reset
    let completeTimeout: NodeJS.Timeout | null = null
    let finalTimeout: NodeJS.Timeout | null = null

    // Wait for all images to load (including dynamically added ones)
    const waitForImages = (): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') {
          resolve()
          return
        }

        const trackedElements = new Set<HTMLElement>()
        let resolved = false
        let observer: MutationObserver | null = null
        let checkInterval: NodeJS.Timeout | null = null
        let timeout: NodeJS.Timeout | null = null

        const checkElement = (element: HTMLElement) => {
          if (trackedElements.has(element)) return
          trackedElements.add(element)

          if (element.tagName === 'IMG') {
            const img = element as HTMLImageElement
            if (img.complete && img.naturalHeight !== 0) {
              return true
            } else {
              img.addEventListener('load', () => checkAllComplete(), { once: true })
              img.addEventListener('error', () => checkAllComplete(), { once: true })
              return false
            }
          } else if (element.tagName === 'VIDEO') {
            const video = element as HTMLVideoElement
            if (video.readyState >= 3) {
              return true
            } else {
              video.addEventListener('loadeddata', () => checkAllComplete(), { once: true })
              video.addEventListener('error', () => checkAllComplete(), { once: true })
              return false
            }
          } else if (element.tagName === 'IFRAME') {
            const iframe = element as HTMLIFrameElement
            if (iframe.contentDocument?.readyState === 'complete') {
              return true
            } else {
              iframe.addEventListener('load', () => checkAllComplete(), { once: true })
              iframe.addEventListener('error', () => checkAllComplete(), { once: true })
              return false
            }
          }
          return true
        }

        const checkAllComplete = () => {
          if (resolved) return

          const images = Array.from(document.querySelectorAll('img'))
          const videos = Array.from(document.querySelectorAll('video'))
          const iframes = Array.from(document.querySelectorAll('iframe'))
          const allElements = [...images, ...videos, ...iframes] as HTMLElement[]

          if (allElements.length === 0) {
            // No media elements, resolve
            if (!resolved) {
              resolved = true
              cleanup()
              resolve()
            }
            return
          }

          // Check all elements
          let allLoaded = true
          allElements.forEach((el) => {
            if (!checkElement(el)) {
              allLoaded = false
            }
          })

          // If all are loaded and we've given them time to render
          if (allLoaded && allElements.length > 0) {
            // Wait a bit more to ensure no new elements are added
            setTimeout(() => {
              if (!resolved) {
                const finalImages = Array.from(document.querySelectorAll('img'))
                const finalVideos = Array.from(document.querySelectorAll('video'))
                const finalIframes = Array.from(document.querySelectorAll('iframe'))
                
                // Check if any new elements were added
                if (finalImages.length === images.length && 
                    finalVideos.length === videos.length && 
                    finalIframes.length === iframes.length) {
                  resolved = true
                  cleanup()
                  resolve()
                }
              }
            }, 500)
          }
        }

        const cleanup = () => {
          if (observer) {
            observer.disconnect()
            observer = null
          }
          if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
          }
          if (timeout) {
            clearTimeout(timeout)
            timeout = null
          }
        }

        // Watch for new elements being added
        observer = new MutationObserver(() => {
          checkAllComplete()
        })

        try {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          })
        } catch (error) {
          // If observer fails, fall back to interval checking
        }

        // Check periodically
        checkInterval = setInterval(checkAllComplete, 200)

        // Initial check
        checkAllComplete()

        // Fallback timeout
        timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true
            cleanup()
            resolve()
          }
        }, 15000) // 15 second max wait
      })
    }

    // Wait for fonts to load
    const waitForFonts = (): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof document === 'undefined' || !('fonts' in document)) {
          resolve()
          return
        }

        try {
          // Check if fonts are loaded
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready
              .then(() => {
                // Additional small delay to ensure fonts are rendered
                setTimeout(resolve, 100)
              })
              .catch(() => resolve())
          } else {
            resolve()
          }
        } catch (error) {
          resolve()
        }
      })
    }

    // Calculate loading progress based on actual resource loading
    const updateProgress = () => {
      if (typeof window === 'undefined' || !isMounted) return

      try {
        let progress = 0
        const images = document.querySelectorAll('img')
        const videos = document.querySelectorAll('video')
        const totalMedia = images.length + videos.length

        if (totalMedia > 0) {
          let loadedCount = 0
          images.forEach((img) => {
            if (img.complete && img.naturalHeight !== 0) {
              loadedCount++
            }
          })
          videos.forEach((video) => {
            if (video.readyState >= 3) {
              loadedCount++
            }
          })
          progress = Math.min(95, (loadedCount / totalMedia) * 90)
        } else {
          // If no media, progress based on DOM readiness
          if (document.readyState === 'complete') {
            progress = 90
          } else if (document.readyState === 'interactive') {
            progress = 50
          } else {
            progress = 20
          }
        }

        setProgress(progress)
      } catch (error) {
        // Silent fail
      }
    }

    // Note: Progress will be updated in checkFullPageLoad for smoother animation
    // We'll start with a basic progress update here
    progressInterval = setInterval(updateProgress, 100)
    progressIntervalRef.current = progressInterval

    // Wait for content to be loaded (check for loading states and empty content)
    const waitForContentLoaded = (): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve()

        let checkCount = 0
        const maxChecks = 150 // 15 seconds max (100ms intervals)
        let checkInterval: NodeJS.Timeout | null = null
        let stabilityCount = 0
        const requiredStability = 3 // Content must be stable for 300ms

        const checkContent = () => {
          checkCount++
          
          try {
            const main = document.querySelector('main')
            if (!main) {
              if (checkCount >= maxChecks) {
                if (checkInterval) clearInterval(checkInterval)
                resolve()
              }
              return
            }

            // Check for loading indicators
            const loadingSelectors = [
              '[class*="loading"]',
              '[class*="Loading"]',
              '[class*="spinner"]',
              '[class*="Spinner"]',
              '[class*="skeleton"]',
              '[class*="Skeleton"]'
            ]
            
            let hasLoadingIndicator = false
            for (const selector of loadingSelectors) {
              const elements = main.querySelectorAll(selector)
              // Filter out the LoadingPage component itself
              const filtered = Array.from(elements).filter(el => {
                const classes = el.className
                if (typeof classes === 'string') {
                  return !classes.includes('loadingContainer') && 
                         !classes.includes('LoadingPage')
                }
                return true
              })
              if (filtered.length > 0) {
                hasLoadingIndicator = true
                break
              }
            }

            // Check if main content has children and is not empty
            const hasChildren = main.children.length > 0
            const hasText = main.textContent && main.textContent.trim().length > 20 // At least some content
            
            // Check for common empty state indicators
            const emptyStates = main.querySelectorAll('[class*="empty"], [class*="Empty"]')
            const isEmptyState = emptyStates.length > 0 && emptyStates[0].textContent?.includes('No') || false

            // Content is ready if:
            // 1. Has children OR has text
            // 2. No loading indicators
            // 3. Not in empty state (unless it's intentionally showing "No projects")
            const isReady = (hasChildren || hasText) && !hasLoadingIndicator

            if (isReady) {
              stabilityCount++
              if (stabilityCount >= requiredStability) {
                if (checkInterval) clearInterval(checkInterval)
                resolve()
              }
            } else {
              stabilityCount = 0
            }

            // Timeout after max checks
            if (checkCount >= maxChecks) {
              if (checkInterval) clearInterval(checkInterval)
              resolve()
            }
          } catch (error) {
            // If check fails, resolve after timeout
            if (checkCount >= maxChecks) {
              if (checkInterval) clearInterval(checkInterval)
              resolve()
            }
          }
        }

        // Start checking after a short delay to let React render
        setTimeout(() => {
          checkInterval = setInterval(checkContent, 100)
          checkContent() // Initial check
        }, 500)
      })
    }

    // Wait for dynamically loaded content using MutationObserver
    const waitForDynamicContent = (): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve()

        let observer: MutationObserver | null = null
        let stabilityCheckCount = 0
        const requiredStabilityChecks = 5 // Content must be stable for 500ms
        let checkInterval: NodeJS.Timeout | null = null

        const checkContentStability = () => {
          const main = document.querySelector('main')
          const hasContent = main && main.children.length > 0
          
          // Check for common loading indicators
          const loadingIndicators = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="Loading"]')
          const hasLoadingIndicators = loadingIndicators.length > 0

          // Check for empty content areas that might be loading
          const emptyContainers = Array.from(document.querySelectorAll('div, section')).filter(el => {
            const htmlEl = el as HTMLElement
            const hasChildren = el.children.length > 0
            const hasText = el.textContent && el.textContent.trim().length > 0
            const isVisible = htmlEl.offsetHeight > 0
            return isVisible && !hasChildren && !hasText
          })

          if (hasContent && !hasLoadingIndicators && emptyContainers.length === 0) {
            stabilityCheckCount++
            if (stabilityCheckCount >= requiredStabilityChecks) {
              if (observer) observer.disconnect()
              if (checkInterval) clearInterval(checkInterval)
              resolve()
            }
          } else {
            stabilityCheckCount = 0
          }
        }

        // Watch for DOM changes
        observer = new MutationObserver(() => {
          stabilityCheckCount = 0 // Reset stability counter on any change
        })

        try {
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
          })
        } catch (error) {
          // If observer fails, just resolve after a delay
          setTimeout(resolve, 1000)
          return
        }

        // Check stability every 100ms
        checkInterval = setInterval(checkContentStability, 100)

        // Fallback timeout
        setTimeout(() => {
          if (observer) observer.disconnect()
          if (checkInterval) clearInterval(checkInterval)
          resolve()
        }, 10000)
      })
    }

    // Show loader for 2 seconds on navigation
    const checkFullPageLoad = async () => {
      if (!isMounted || isCompleteRef.current) return

      try {
        // Stop the old progress interval and start smooth animation
        if (progressInterval) {
          clearInterval(progressInterval)
          progressInterval = null
          progressIntervalRef.current = null
        }

        // Animate progress to 100% smoothly over 2 seconds
        const progressSteps = 100
        const stepInterval = minDisplayTime / progressSteps
        let currentProgress = 0
        
        const progressTimer = setInterval(() => {
          if (!isMounted || isCompleteRef.current) {
            clearInterval(progressTimer)
            return
          }
          currentProgress += 1
          if (currentProgress <= 100) {
            setProgress(currentProgress)
          } else {
            clearInterval(progressTimer)
          }
        }, stepInterval)

        // Wait for DOM to be ready (fast check)
        if (document.readyState === 'loading') {
          await new Promise<void>((resolve) => {
            if (document.readyState !== 'loading') {
              resolve()
            } else {
              document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
              setTimeout(resolve, 500)
            }
          })
        }

        // Quick check for main content
        let checkCount = 0
        while (checkCount < 3) {
          const main = document.querySelector('main')
          if (main && main.children.length > 0) {
            break
          }
          await new Promise(resolve => setTimeout(resolve, 50))
          checkCount++
        }

        if (!isMounted || isCompleteRef.current) {
          clearInterval(progressTimer)
          return
        }

        // Ensure minimum display time of 2 seconds
        const elapsed = Date.now() - startTime.current
        const remainingTime = Math.max(0, minDisplayTime - elapsed)

        completeTimeout = setTimeout(() => {
          if (!isMounted || isCompleteRef.current) {
            clearInterval(progressTimer)
            return
          }
          isCompleteRef.current = true
          clearInterval(progressTimer)

          if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
            progressIntervalRef.current = null
          }

          finalTimeout = setTimeout(() => {
            if (isMounted) {
              setIsVisible(false)
              if (onComplete) {
                onComplete()
              }
            }
          }, 100)
        }, remainingTime)

      } catch (error) {
        // If anything fails, complete quickly
        if (!isMounted || isCompleteRef.current) return
        
        const elapsed = Date.now() - startTime.current
        const remainingTime = Math.max(0, minDisplayTime - elapsed)
        
        completeTimeout = setTimeout(() => {
          if (!isMounted || isCompleteRef.current) return
          isCompleteRef.current = true
          setProgress(100)
          
          if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
            progressIntervalRef.current = null
          }
          
          finalTimeout = setTimeout(() => {
            if (isMounted) {
              setIsVisible(false)
              if (onComplete) {
                onComplete()
              }
            }
          }, 100) // Reduced from 300ms
        }, remainingTime)
      }
    }

    // Start the full page load check
    checkFullPageLoad()

    return () => {
      isMounted = false
      if (progressInterval) clearInterval(progressInterval)
      if (completeTimeout) clearTimeout(completeTimeout)
      if (finalTimeout) clearTimeout(finalTimeout)
    }
  }, [onComplete, minDisplayTime, isVisible, pathname, mounted])

  // Always render the container, but control visibility with CSS
  // This ensures it's in the DOM from the start and can hide content behind it
  if (!mounted) return null

  return (
    <div className={`${styles.loadingContainer} ${!isVisible ? styles.hidden : ''}`}>
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

