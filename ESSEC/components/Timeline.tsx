'use client'

import { useEffect, useRef, useState } from 'react'
import DefaultImage from '@/components/DefaultImage'
import { useLanguage } from '@/hooks/useLanguage'
import styles from './Timeline.module.css'

interface TimelineStep {
  titleKey: string
  descriptionKey: string
  image: string
  position: 'above' | 'below'
  textPosition: 'left' | 'right'
  waveY: number // percentage
  imageY: number // percentage
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

  // Positions based on SVG viewBox (1200x2000)
  // Wave points: 300, 700, 1300, 1700 (at x=600, center)
  // Image centers: 280 (20px above), 720 (20px below), 1280 (20px above), 1720 (20px below)
  const timelineSteps: TimelineStep[] = [
    {
      titleKey: 'step1Title',
      descriptionKey: 'step1Description',
      image: '/timeline/step1.jpg',
      position: 'above',
      textPosition: 'right',
      waveY: 15, // 300/2000 = 15%
      imageY: 14, // 280/2000 = 14% (20px above wave)
    },
    {
      titleKey: 'step2Title',
      descriptionKey: 'step2Description',
      image: '/timeline/step2.jpg',
      position: 'below',
      textPosition: 'left',
      waveY: 35, // 700/2000 = 35%
      imageY: 36, // 720/2000 = 36% (20px below wave)
    },
    {
      titleKey: 'step3Title',
      descriptionKey: 'step3Description',
      image: '/timeline/step3.jpg',
      position: 'above',
      textPosition: 'right',
      waveY: 65, // 1300/2000 = 65%
      imageY: 64, // 1280/2000 = 64% (20px above wave)
    },
    {
      titleKey: 'step4Title',
      descriptionKey: 'step4Description',
      image: '/timeline/step4.jpg',
      position: 'below',
      textPosition: 'left',
      waveY: 85, // 1700/2000 = 85%
      imageY: 86, // 1720/2000 = 86% (20px below wave)
    },
  ]

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <h2 className={`${styles.sectionTitle} ${isVisible ? styles.visible : styles.hidden}`}>
          {t('home.timeline.title')}
        </h2>

        <div className={styles.timelineWrapper}>
          {/* S-shaped wave path */}
          <svg 
            className={styles.sWaveSVG} 
            viewBox="0 0 1200 2000" 
            preserveAspectRatio="xMidYMin meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#457B9D" stopOpacity="0.9"/>
                <stop offset="25%" stopColor="#1D3557" stopOpacity="0.95"/>
                <stop offset="50%" stopColor="#457B9D" stopOpacity="0.9"/>
                <stop offset="75%" stopColor="#1D3557" stopOpacity="0.95"/>
                <stop offset="100%" stopColor="#457B9D" stopOpacity="0.9"/>
              </linearGradient>
              <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path 
              id="sWave" 
              d="M 600 50 
                 C 800 150, 800 250, 600 300
                 C 400 350, 400 550, 600 700
                 C 800 850, 800 1150, 600 1300
                 C 400 1450, 400 1650, 600 1700
                 C 800 1750, 800 1850, 600 1950"
              stroke="url(#waveGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#waveGlow)"
            />
            
            {/* Connection dots on the wave */}
            <circle cx="600" cy="300" r="8" fill="#457B9D" opacity="0.8"/>
            <circle cx="600" cy="700" r="8" fill="#457B9D" opacity="0.8"/>
            <circle cx="600" cy="1300" r="8" fill="#457B9D" opacity="0.8"/>
            <circle cx="600" cy="1700" r="8" fill="#457B9D" opacity="0.8"/>
          </svg>

            {/* Timeline steps */}
          <div className={styles.stepsContainer}>
            {timelineSteps.map((step, index) => {
              // Calculate connection height in percentage (20px out of 2000px = 1%)
              const connectionHeightPercent = Math.abs(step.imageY - step.waveY);
              
              // Calculate offset as numeric value for calc() function
              // imageOffsetFromWave is the difference: imageY% - waveY%
              // This will be used in calc() as: calc(var(--image-offset-percent) * 20px)
              // where 20px = 1% of 2000px base height
              const imageOffsetFromWave = step.imageY - step.waveY;
              
              return (
                <div
                  key={index}
                  className={`${styles.step} ${isVisible ? styles.stepVisible : styles.stepHidden}`}
                  style={{ 
                    transitionDelay: `${index * 150}ms`,
                    top: `${step.waveY}%`,
                    '--wave-y-percent': `${step.waveY}%`,
                    '--image-y-percent': `${step.imageY}%`,
                    '--connection-height-percent': `${connectionHeightPercent}`,
                    '--image-offset-percent': `${imageOffsetFromWave}`,
                  } as React.CSSProperties}
                >
                  {/* Connection line from wave to image - vertical line at center */}
                  <div 
                    className={styles.connectionLine}
                    style={{
                      top: step.position === 'above' 
                        ? `calc(var(--image-offset-percent) * -20px)` 
                        : '0',
                      transform: 'translateX(-50%)',
                    }}
                  />

                  {/* Circular image - centered on the connection line */}
                  <div 
                    className={`${styles.stepImage} ${styles[step.position]}`}
                  >
                    <div className={styles.imageWrapper}>
                      <DefaultImage
                        src={step.image}
                        alt={t(`home.timeline.${step.titleKey}`)}
                        fill
                        className={styles.image}
                      />
                    </div>
                  </div>

                  {/* Text content */}
                  <div
                    className={`${styles.stepContent} ${styles[step.textPosition]}`}
                  >
                    <h3 className={styles.stepTitle}>{t(`home.timeline.${step.titleKey}`)}</h3>
                    <p className={styles.stepDescription}>{t(`home.timeline.${step.descriptionKey}`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

