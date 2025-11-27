'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import DefaultImage from '@/components/DefaultImage'
import styles from './SplitSection.module.css'

interface SplitSectionProps {
  scrollY?: number
}

export default function SplitSection({ scrollY = 0 }: SplitSectionProps) {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        {/* Left Half - Text Content */}
        <div className={`${styles.textHalf} ${isVisible ? styles.visible : styles.hidden}`}>
          <div className={styles.textContent}>
            <h2 className={styles.heading}>
              {t('home.splitSection.title')}
            </h2>
            <p className={styles.paragraph}>
              {t('home.splitSection.description')}
            </p>
            <button className={styles.button}>
              {t('home.splitSection.button')}
            </button>
          </div>
        </div>

        {/* Right Half - Image */}
        <div className={`${styles.imageHalf} ${isVisible ? styles.visible : styles.hidden}`}>
          <div className={styles.imageWrapper}>
            <DefaultImage
              src="/Ex.jpg"
              alt={t('home.splitSection.imageAlt')}
              fill
              className={styles.image}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className={styles.imageOverlay}></div>
          </div>
        </div>
      </div>
    </section>
  )
}

