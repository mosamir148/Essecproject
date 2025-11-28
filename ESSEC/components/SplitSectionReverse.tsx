'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import DefaultImage from '@/components/DefaultImage'
import styles from './SplitSectionReverse.module.css'

interface SplitSectionReverseProps {
  scrollY?: number
}

export default function SplitSectionReverse({ scrollY = 0 }: SplitSectionReverseProps) {
  const { t, dir } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Function to check if element is in viewport
  const checkVisibility = useCallback(() => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight || document.documentElement.clientHeight
      const windowWidth = window.innerWidth || document.documentElement.clientWidth
      
      // More lenient check for mobile - if any part is visible or close to viewport
      const isInViewport = 
        rect.top < windowHeight + 200 && // 200px buffer for mobile
        rect.bottom > -200 && // Allow elements slightly above viewport
        rect.left < windowWidth + 200 &&
        rect.right > -200
      
      if (isInViewport) {
        setIsVisible(true)
        return true
      }
    }
    return false
  }, [])

  useEffect(() => {
    // Check initial visibility immediately and after delays
    // This handles cases where the layout hasn't fully rendered yet
    checkVisibility()
    
    const timeouts: NodeJS.Timeout[] = []
    
    // Multiple checks to ensure visibility on mobile
    timeouts.push(setTimeout(() => checkVisibility(), 50))
    timeouts.push(setTimeout(() => checkVisibility(), 200))
    timeouts.push(setTimeout(() => checkVisibility(), 500))
    
    // Fallback: ensure visibility after 1 second on mobile devices
    // This prevents image/text from staying hidden if IntersectionObserver fails
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      timeouts.push(setTimeout(() => {
        setIsVisible(true)
      }, 1000))
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { 
        threshold: 0.1, 
        rootMargin: isMobile ? '100px' : '50px' // Larger margin on mobile
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [checkVisibility])

  // Re-check visibility when language/direction changes
  useEffect(() => {
    // Multiple checks with delays to handle RTL layout changes
    // This is especially important on mobile where layout changes can be more dramatic
    const timeouts: NodeJS.Timeout[] = []
    
    timeouts.push(setTimeout(() => checkVisibility(), 100))
    timeouts.push(setTimeout(() => checkVisibility(), 300))
    timeouts.push(setTimeout(() => checkVisibility(), 600))
    
    // On mobile + RTL, ensure visibility after layout settles
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    if (isMobile) {
      timeouts.push(setTimeout(() => {
        setIsVisible(true)
      }, 1200))
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [dir, checkVisibility])

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        {/* Left Half - Image */}
        <div className={`${styles.imageHalf} ${isVisible ? styles.visible : styles.hidden}`}>
          <div className={styles.imageWrapper}>
            <DefaultImage
              src="/se.jpg"
              alt={t('home.splitSectionReverse.imageAlt')}
              fill
              className={styles.image}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className={styles.imageOverlay}></div>
          </div>
        </div>

        {/* Right Half - Text Content */}
        <div className={`${styles.textHalf} ${isVisible ? styles.visible : styles.hidden}`}>
          <div className={styles.textContent}>
            <h2 className={styles.heading}>
              {t('home.splitSectionReverse.title')}
            </h2>
            <p className={styles.paragraph}>
              {t('home.splitSectionReverse.description')}
            </p>
            <button className={styles.button}>
              {t('home.splitSectionReverse.button')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

