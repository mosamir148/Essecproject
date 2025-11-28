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
  const hasBeenVisibleRef = useRef(false)
  const rafIdRef = useRef<number | null>(null)

  // Optimized visibility check using requestAnimationFrame
  const checkVisibility = useCallback(() => {
    if (hasBeenVisibleRef.current || !sectionRef.current) {
      return
    }

    const rect = sectionRef.current.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    
    // Check if section is in or near viewport
    const isInViewport = rect.top < windowHeight + 100 && rect.bottom > -100
    
    if (isInViewport && !hasBeenVisibleRef.current) {
      hasBeenVisibleRef.current = true
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    // Initial check
    checkVisibility()
    
    // Use requestAnimationFrame for smooth performance
    const scheduleCheck = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = requestAnimationFrame(() => {
        checkVisibility()
        rafIdRef.current = null
      })
    }

    // Check on scroll with throttling
    const handleScroll = () => {
      if (!hasBeenVisibleRef.current) {
        scheduleCheck()
      }
    }

    // IntersectionObserver for better performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisibleRef.current) {
            hasBeenVisibleRef.current = true
            setIsVisible(true)
            // Once visible, disconnect observer
            if (sectionRef.current) {
              observer.unobserve(sectionRef.current)
            }
          }
        })
      },
      { 
        threshold: 0.05,
        rootMargin: '50px'
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    // Fallback: ensure visibility after a short delay on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const fallbackTimeout = isMobile ? setTimeout(() => {
      if (!hasBeenVisibleRef.current) {
        hasBeenVisibleRef.current = true
        setIsVisible(true)
      }
    }, 800) : null

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      window.removeEventListener('scroll', handleScroll)
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout)
      }
    }
  }, [checkVisibility])

  // Re-check visibility when language/direction changes (only if not already visible)
  useEffect(() => {
    if (!hasBeenVisibleRef.current) {
      const timeout = setTimeout(() => {
        checkVisibility()
      }, 100)
      return () => clearTimeout(timeout)
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

