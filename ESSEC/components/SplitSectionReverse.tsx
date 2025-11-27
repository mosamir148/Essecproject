'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import DefaultImage from '@/components/DefaultImage'
import styles from './SplitSectionReverse.module.css'

interface SplitSectionReverseProps {
  scrollY?: number
}

export default function SplitSectionReverse({ scrollY = 0 }: SplitSectionReverseProps) {
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

