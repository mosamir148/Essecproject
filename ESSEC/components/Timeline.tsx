'use client'

import { useEffect, useRef, useState } from 'react'
import DefaultImage from '@/components/DefaultImage'
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
      <div className={styles.container}>
        <h2 className={`${styles.sectionTitle} ${isVisible ? styles.visible : styles.hidden}`}>
          {t('home.timeline.title')}
        </h2>

        <div className={styles.timelineContainer}>
          {/* Vertical center line */}
          <div className={styles.centerLine}></div>
          
          {timelineSteps.map((step, index) => {
            const isEven = index % 2 === 0
            const imageSide = isEven ? 'left' : 'right'
            const textSide = isEven ? 'right' : 'left'

            return (
              <div
                key={index}
                className={`${styles.timelineItem} ${isVisible ? styles.itemVisible : styles.itemHidden}`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                {/* Image */}
                <div className={`${styles.itemImage} ${styles[imageSide]}`}>
                  <div className={styles.imageWrapper}>
                    <DefaultImage
                      src={step.image}
                      alt={t(`home.timeline.${step.titleKey}`)}
                      fill
                      className={styles.image}
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className={`${styles.itemContent} ${styles[textSide]}`}>
                  <h3 className={styles.itemTitle}>{t(`home.timeline.${step.titleKey}`)}</h3>
                  <p className={styles.itemDescription}>{t(`home.timeline.${step.descriptionKey}`)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
