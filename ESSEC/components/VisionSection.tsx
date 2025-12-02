'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Lightbulb, Leaf, Award, Users } from 'lucide-react'
import styles from './VisionSection.module.css'

interface VisionSectionProps {
  scrollY?: number
}

export default function VisionSection({ scrollY = 0 }: VisionSectionProps) {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [parallaxOffset, setParallaxOffset] = useState(0)
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

  useEffect(() => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate parallax offset when section is in viewport
      if (rect.bottom > 0 && rect.top < windowHeight) {
        // Calculate scroll progress through the section
        const scrollProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)))
        // Parallax speed: 0.3 means background moves at 30% of scroll speed
        setParallaxOffset(scrollProgress * rect.height * 0.3)
      } else {
        setParallaxOffset(0)
      }
    }
  }, [scrollY])

  const visionPoints = [
    {
      key: 'innovation',
      icon: Lightbulb,
      iconClass: styles.iconYellow,
      containerClass: styles.iconContainerYellow,
    },
    {
      key: 'sustainability',
      icon: Leaf,
      iconClass: styles.iconGreen,
      containerClass: styles.iconContainerGreen,
    },
    {
      key: 'excellence',
      icon: Award,
      iconClass: styles.iconBlue,
      containerClass: styles.iconContainerBlue,
    },
    {
      key: 'partnership',
      icon: Users,
      iconClass: styles.iconPurple,
      containerClass: styles.iconContainerPurple,
    },
  ]

  return (
    <section
      ref={sectionRef}
      className={styles.section}
    >
      {/* Soft 3D Background */}
      <div className={styles.motionBackground}>
        {/* 3D Floating Spheres */}
        <div className={styles.spheres3D}>
          <div className={`${styles.sphere3D} ${styles.sphere1}`}></div>
          <div className={`${styles.sphere3D} ${styles.sphere2}`}></div>
          <div className={`${styles.sphere3D} ${styles.sphere3}`}></div>
          <div className={`${styles.sphere3D} ${styles.sphere4}`}></div>
        </div>
        
        {/* Soft Fluid Shapes */}
        <div className={styles.fluidShapes}>
          <div className={`${styles.fluidShape} ${styles.fluid1}`}></div>
          <div className={`${styles.fluidShape} ${styles.fluid2}`}></div>
          <div className={`${styles.fluidShape} ${styles.fluid3}`}></div>
        </div>
        
        {/* Light Glow Effects */}
        <div className={styles.glowEffects}>
          <div className={`${styles.glow} ${styles.glow1}`}></div>
          <div className={`${styles.glow} ${styles.glow2}`}></div>
          <div className={`${styles.glow} ${styles.glow3}`}></div>
        </div>
        
        {/* Energy Particles */}
        <div className={styles.energyParticles}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.energyParticle}></div>
          ))}
        </div>
        
        {/* Center Clean Zone for Text */}
        <div className={styles.centerCleanZone}></div>
      </div>
      
      <div className={styles.container}>
        <h2 className={`${styles.sectionTitle} ${isVisible ? styles.visible : styles.hidden}`}>
          {t('home.vision.title')}
        </h2>
        {t('home.vision.description') && (
          <div className={`${styles.description} ${isVisible ? styles.visible : styles.hidden}`}>
            {t('home.vision.description').split('\n').map((paragraph, index) => (
              <p key={index} className={styles.descriptionParagraph}>
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
      
      <div className={styles.content}>

        <div className={styles.pointsGrid}>
          {visionPoints.map((point, index) => {
            const Icon = point.icon
            return (
              <div
                key={point.key}
                className={`${styles.pointCard} ${
                  isVisible
                    ? styles.pointCardVisible
                    : styles.pointCardHidden
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={styles.pointCardContent}>
                  <div className={`${styles.iconContainer} ${point.containerClass}`}>
                    <Icon className={`${styles.icon} ${point.iconClass}`} />
                  </div>
                  <h3 className={styles.pointTitle}>
                    {t(`home.vision.points.${point.key}`)}
                  </h3>
                  <p className={styles.pointDescription}>
                    {t(`home.vision.points.${point.key}Desc`)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

