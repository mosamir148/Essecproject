'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { ChevronDown } from 'lucide-react'
import styles from './FAQSection.module.css'

interface FAQSectionProps {
  scrollY?: number
}

export default function FAQSection({ scrollY = 0 }: FAQSectionProps) {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(0)
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

  const faqs = [
    { q: 'q1', a: 'a1' },
    { q: 'q2', a: 'a2' },
    { q: 'q3', a: 'a3' },
    { q: 'q4', a: 'a4' },
    { q: 'q5', a: 'a5' },
    { q: 'q6', a: 'a6' },
  ]

  return (
    <section
      ref={sectionRef}
      className={styles.section}
    >
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
      {/* Overlay for text readability */}
      <div className={styles.overlay} />
      
      <div className={styles.container}>
        <h2 className={`${styles.sectionTitle} ${isVisible ? styles.visible : styles.hidden}`}>
            {t('home.faq.title')}
          </h2>
        </div>

      <div className={styles.content}>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`${styles.faqItem} ${
                isVisible ? styles.faqItemVisible : styles.faqItemHidden
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={styles.faqButton}
              >
                <span className={styles.faqQuestion}>
                  {t(`home.faq.items.${faq.q}`)}
                </span>
                <ChevronDown
                  className={`${styles.chevronIcon} ${
                    openIndex === index ? styles.chevronRotated : ''
                  }`}
                />
              </button>
              <div
                className={`${styles.faqAnswer} ${
                  openIndex === index ? styles.faqAnswerOpen : styles.faqAnswerClosed
                }`}
              >
                <div className={styles.faqAnswerContent}>
                  <p className={styles.faqAnswerText}>
                    {t(`home.faq.items.${faq.a}`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

