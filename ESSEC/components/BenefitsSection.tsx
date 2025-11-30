'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Zap, Leaf, TrendingUp, Wrench, Shield, DollarSign, Award, Home, Battery } from 'lucide-react'
import styles from './BenefitsSection.module.css'

interface BenefitsSectionProps {
  scrollY?: number
}

export default function BenefitsSection({ scrollY = 0 }: BenefitsSectionProps) {
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

  // Benefits positioned along the crescent path
  const crescentBenefits = [
    { key: 'reducedCarbon', angle: 45, icon: Leaf },
    { key: 'lowerCosts', angle: 90, icon: DollarSign },
    { key: 'governmentIncentives', angle: 135, icon: Award },
    { key: 'propertyValue', angle: 180, icon: Home },
    { key: 'energyIndependence', angle: 225, icon: Battery },
  ]

  // Center features with icons
  const centerFeatures = [
    { 
      titleKey: 'energySaving', 
      descKey: 'energySavingDesc', 
      icon: Zap,
      accent: 'primary'
    },
    { 
      titleKey: 'feature2', 
      descKey: 'feature2Desc', 
      icon: Leaf,
      accent: 'secondary'
    },
    { 
      titleKey: 'feature3', 
      descKey: 'feature3Desc', 
      icon: TrendingUp,
      accent: 'tertiary'
    },
    { 
      titleKey: 'feature4', 
      descKey: 'feature4Desc', 
      icon: Wrench,
      accent: 'quaternary'
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
          {t('home.benefits.title')}
        </h2>

        <div className={styles.circleContainer}>
          {/* Crescent path benefits - Large screens only */}
          <div className={styles.crescentPath}>
            {crescentBenefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className={`${styles.benefitBadge} ${isVisible ? styles.benefitVisible : styles.benefitHidden}`}
                  style={{
                    '--angle': `${benefit.angle}deg`,
                    transitionDelay: `${index * 120}ms`,
                  } as React.CSSProperties}
                >
                  <div className={styles.benefitCard}>
                    <div className={styles.benefitIconWrapper}>
                      <Icon className={styles.benefitIcon} size={22} />
                    </div>
                    <span className={styles.benefitText}>{t(`home.benefits.crescent.${benefit.key}`)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Center circle content */}
          <div className={`${styles.centerCircle} ${isVisible ? styles.centerCircleVisible : styles.centerCircleHidden}`}>
            <div className={styles.centerCircleInner}>
              <div className={styles.centerTitleWrapper}>
                <Shield className={styles.titleIcon} size={28} />
                <h3 className={styles.centerTitle}>{t('home.benefits.whySolar')}</h3>
              </div>
              
              <div className={styles.features}>
                <div className={styles.featuresTrack}>
                  {/* First set of features */}
                  {centerFeatures.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div 
                        key={`first-${index}`}
                        className={styles.feature}
                        data-accent={feature.accent}
                        style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                      >
                        <div className={styles.featureIconContainer}>
                          <Icon className={styles.featureIcon} size={20} />
                        </div>
                        <div className={styles.featureContent}>
                          <div className={styles.featureTitle}>{t(`home.benefits.${feature.titleKey}`)}</div>
                          <div className={styles.featureDescription}>{t(`home.benefits.${feature.descKey}`)}</div>
                        </div>
                      </div>
                    )
                  })}
                  {/* Duplicate set for seamless loop - Large screens only */}
                  {centerFeatures.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div 
                        key={`second-${index}`}
                        className={`${styles.feature} ${styles.featureDuplicate}`}
                        data-accent={feature.accent}
                        aria-hidden="true"
                      >
                        <div className={styles.featureIconContainer}>
                          <Icon className={styles.featureIcon} size={20} />
                        </div>
                        <div className={styles.featureContent}>
                          <div className={styles.featureTitle}>{t(`home.benefits.${feature.titleKey}`)}</div>
                          <div className={styles.featureDescription}>{t(`home.benefits.${feature.descKey}`)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Benefits slider below the circle - Small screens only */}
          <div className={styles.benefitsSlider}>
            <div className={styles.benefitsSliderTrack}>
              {/* First set of benefits */}
              {crescentBenefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={`first-${index}`}
                    className={`${styles.benefitBadge} ${isVisible ? styles.benefitVisible : styles.benefitHidden}`}
                    style={{
                      transitionDelay: `${index * 120}ms`,
                    } as React.CSSProperties}
                  >
                    <div className={styles.benefitCard}>
                      <div className={styles.benefitIconWrapper}>
                        <Icon className={styles.benefitIcon} size={22} />
                      </div>
                      <span className={styles.benefitText}>{t(`home.benefits.crescent.${benefit.key}`)}</span>
                    </div>
                  </div>
                )
              })}
              {/* Duplicate set for seamless loop */}
              {crescentBenefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={`second-${index}`}
                    className={`${styles.benefitBadge} ${isVisible ? styles.benefitVisible : styles.benefitHidden}`}
                    aria-hidden="true"
                  >
                    <div className={styles.benefitCard}>
                      <div className={styles.benefitIconWrapper}>
                        <Icon className={styles.benefitIcon} size={22} />
                      </div>
                      <span className={styles.benefitText}>{t(`home.benefits.crescent.${benefit.key}`)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

