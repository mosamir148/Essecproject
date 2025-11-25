'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import styles from './StatsPanel.module.css'

interface Stat {
  value: number | string
  label: string
  suffix?: string
}

interface StatsPanelProps {
  stats: Stat[]
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const { dir } = useLanguage()
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current)
    }

    const observers = refs.current.map((ref, index) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && isVisible) {
              const target = entry.target as HTMLElement
              const finalValue = stats[index].value
              
              if (typeof finalValue === 'number') {
                let current = 0
                const increment = finalValue / 50
                const timer = setInterval(() => {
                  current += increment
                  if (current >= finalValue) {
                    current = finalValue
                    clearInterval(timer)
                  }
                  target.textContent = Math.floor(current).toString() + (stats[index].suffix || '')
                }, 30)
              } else {
                target.textContent = finalValue + (stats[index].suffix || '')
              }
              
              observer.unobserve(target)
            }
          })
        },
        { threshold: 0.5 }
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      sectionObserver.disconnect()
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [stats, isVisible])

  return (
    <div ref={sectionRef} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${styles.statItem} ${
                isVisible ? styles.statItemVisible : styles.statItemHidden
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                ref={(el) => (refs.current[index] = el)}
                className={styles.statValue}
              >
                0{stat.suffix || ''}
              </div>
              <div className={styles.statLabel}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

