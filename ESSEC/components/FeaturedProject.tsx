'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { projects } from '@/data/projects'
import DefaultImage from '@/components/DefaultImage'
import Link from 'next/link'
import { ArrowRight, MapPin, Calendar, Zap, TrendingUp } from 'lucide-react'
import styles from './FeaturedProject.module.css'

interface FeaturedProjectProps {
  scrollY?: number
}

export default function FeaturedProject({ scrollY = 0 }: FeaturedProjectProps) {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [parallaxOffset, setParallaxOffset] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Get the first project as featured
  const featuredProject = projects[0]

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

  return (
    <section ref={sectionRef} className={styles.section}>
      <div 
        className={styles.backgroundImage}
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      ></div>
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <div
          className={`${styles.header} ${
            isVisible ? styles.headerVisible : styles.headerHidden
          }`}
        >
          <h2 className={styles.title}>
            {t('home.featuredProject.title')}
          </h2>
          <p className={styles.subtitle}>
            {t('home.featuredProject.subtitle')}
          </p>
        </div>

        <div
          className={`${styles.projectCard} ${
            isVisible ? styles.projectCardVisible : styles.projectCardHidden
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className={styles.projectGrid}>
            {/* Image Section */}
            <div className={styles.imageContainer}>
              <DefaultImage
                src={featuredProject.image}
                alt={featuredProject.name}
                fill
                className={styles.projectImage}
              />
              <div className={styles.imageOverlay} />
            </div>

            {/* Content Section */}
            <div className={styles.contentSection}>
              <h3 className={styles.projectTitle}>
                {featuredProject.name}
              </h3>
              <p className={styles.projectDescription}>
                {featuredProject.description}
              </p>

              {/* Project Details */}
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <MapPin className={styles.detailIcon} />
                  <div>
                    <p className={styles.detailLabel}>
                      {t('home.featuredProject.location')}
                    </p>
                    <p className={styles.detailValue}>
                      {featuredProject.location}
                    </p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Calendar className={styles.detailIcon} />
                  <div>
                    <p className={styles.detailLabel}>
                      {t('home.featuredProject.completed')}
                    </p>
                    <p className={styles.detailValue}>
                      {featuredProject.year}
                    </p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <Zap className={styles.detailIcon} />
                  <div>
                    <p className={styles.detailLabel}>
                      {t('home.featuredProject.capacity')}
                    </p>
                    <p className={styles.detailValue}>
                      5MW
                    </p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <TrendingUp className={styles.detailIcon} />
                  <div>
                    <p className={styles.detailLabel}>
                      {t('home.featuredProject.results')}
                    </p>
                    <p className={styles.detailValue}>
                      80% Savings
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Results */}
              <div className={styles.resultsSection}>
                <h4 className={styles.resultsTitle}>
                  {t('home.featuredProject.results')}:
                </h4>
                <ul className={styles.resultsList}>
                  {featuredProject.results.slice(0, 3).map((result, index) => (
                    <li key={index} className={styles.resultItem}>
                      <span className={styles.resultCheck}>✓</span>
                      <span className={styles.resultText}>{result}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link href={`/projects/${featuredProject.id}`} className={styles.ctaButton}>
                {t('home.featuredProject.viewProject')}
                <ArrowRight className={styles.ctaIcon} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

