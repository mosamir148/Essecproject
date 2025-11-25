'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/hooks/useLanguage'
import styles from './Timeline.module.css'

interface TimelineStep {
  titleKey: string
  descriptionKey: string
  image: string
}

interface TimelineProps {
  scrollY?: number
}

export default function Timeline({ scrollY = 0 }: TimelineProps) {
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

  const timelineSteps: TimelineStep[] = [
    {
      titleKey: 'step1Title',
      descriptionKey: 'step1Description',
      image: '/timeline/step1.jpg',
    },
    {
      titleKey: 'step2Title',
      descriptionKey: 'step2Description',
      image: '/timeline/step2.jpg',
    },
    {
      titleKey: 'step3Title',
      descriptionKey: 'step3Description',
      image: '/timeline/step3.jpg',
    },
    {
      titleKey: 'step4Title',
      descriptionKey: 'step4Description',
      image: '/timeline/step4.jpg',
    },
  ]

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Professional Motion Background */}
      <div className={styles.motionBackground}>
        <div className={styles.waveContainer}>
          <div className={`${styles.wave} ${styles.wave1}`}></div>
          <div className={`${styles.wave} ${styles.wave2}`}></div>
          <div className={`${styles.wave} ${styles.wave3}`}></div>
        </div>
        <div className={styles.particles}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={styles.particle} style={{ '--delay': `${i * 0.5}s` } as React.CSSProperties}></div>
          ))}
        </div>
        <div className={styles.geometricShapes}>
          <div className={`${styles.shape} ${styles.shape1}`}></div>
          <div className={`${styles.shape} ${styles.shape2}`}></div>
          <div className={`${styles.shape} ${styles.shape3}`}></div>
          <div className={`${styles.shape} ${styles.shape4}`}></div>
        </div>
        <div className={styles.gradientOrbs}>
          <div className={`${styles.orb} ${styles.orb1}`}></div>
          <div className={`${styles.orb} ${styles.orb2}`}></div>
          <div className={`${styles.orb} ${styles.orb3}`}></div>
        </div>
      </div>
      
      <div className={styles.container}>
        <h2 className={`${styles.sectionTitle} ${isVisible ? styles.visible : styles.hidden}`}>
          {t('home.timeline.title')}
        </h2>

        <div className={styles.timelineWrapper}>
          {/* Center vertical line */}
          <div className={styles.centerLine}></div>

          {/* Timeline steps */}
          <div className={styles.stepsContainer}>
            {timelineSteps.map((step, index) => {
              const isEven = index % 2 === 0
              // Step 1 (index 0): image right, text left (isEven = true)
              // Step 2 (index 1): image left, text right (isEven = false)
              
              return (
                <div
                  key={index}
                  className={`${styles.step} ${isVisible ? styles.stepVisible : styles.stepHidden}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Text content */}
                  <div
                    className={`${styles.stepContent} ${isEven ? styles.contentLeft : styles.contentRight}`}
                  >
                    <div className={styles.stepNumber}>{index + 1}</div>
                    <h3 className={styles.stepTitle}>{t(`home.timeline.${step.titleKey}`)}</h3>
                    <p className={styles.stepDescription}>{t(`home.timeline.${step.descriptionKey}`)}</p>
                  </div>

                  {/* Center dot */}
                  <div className={styles.centerDot}></div>

                  {/* Image */}
                  <div
                    className={`${styles.stepImage} ${isEven ? styles.imageRight : styles.imageLeft}`}
                  >
                    <div className={styles.imageWrapper}>
                      <Image
                        src={step.image}
                        alt={t(`home.timeline.${step.titleKey}`)}
                        fill
                        className={styles.image}
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23e2e8f0" width="600" height="400"/%3Ctext fill="%2364758b" font-family="sans-serif" font-size="20" dy="10.5" font-weight="600" x="50%25" y="50%25" text-anchor="middle"%3E' + encodeURIComponent(t(`home.timeline.${step.titleKey}`)) + '%3C/text%3E%3C/svg%3E'
                        }}
                      />
                      <div className={styles.imageOverlay}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

