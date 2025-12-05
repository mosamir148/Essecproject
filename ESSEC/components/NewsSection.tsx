'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { api } from '@/lib/api'
import DefaultImage from '@/components/DefaultImage'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import styles from './NewsSection.module.css'

interface NewsItem {
  id: string
  title: string
  mainImage: string
  summary: string
  publicationDate: string
}

interface NewsSectionProps {
  scrollY?: number
}

export default function NewsSection({ scrollY = 0 }: NewsSectionProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

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
    // Only load news when section becomes visible (lazy loading)
    if (!isVisible) return
    
    let mounted = true
    
    const loadNews = async () => {
      try {
        setLoading(true)
        // API client handles timeout (10s) - limit to 5 items initially to reduce payload
        const news = await api.getNews('displayOrder', 5)
        if (mounted) {
          setNewsItems(news)
        }
      } catch (error) {
        if (!mounted) return
        
        // Silently handle errors - show empty state
        if (error instanceof Error && process.env.NODE_ENV === 'development') {
          if (error.message.includes('Failed to fetch')) {
            console.warn('Backend server may not be running. Please ensure the backend is started on port 5000.')
          } else if (error.message.includes('timeout')) {
            console.warn('Request timed out - images may be too large. Consider optimizing image storage.')
          }
        }
        // Set empty array on error to show empty state instead of hanging
        setNewsItems([])
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Small delay to ensure smooth rendering
    const timeoutId = setTimeout(loadNews, 100)
    
    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [isVisible])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? newsItems.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === newsItems.length - 1 ? 0 : prev + 1))
  }

  const handleReadMore = (id: string) => {
    // Validate ID before navigation
    if (!id || id === 'undefined' || typeof id !== 'string' || id.trim() === '') {
      console.error('Invalid news ID:', id)
      return
    }
    router.push(`/news/${id}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate parallax offset when section is in viewport
      if (rect.bottom > 0 && rect.top < windowHeight) {
        // Calculate scroll progress through the section
        const scrollProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)))
        // Parallax speed: 0.3 means background moves at 30% of scroll speed
        // Note: parallaxOffset state removed, but keeping effect for future use
      }
    }
  }, [scrollY])

  if (loading) {
    return (
      <section ref={sectionRef} className={styles.section}>
        {/* Soft 3D Background */}
        <div className={styles.motionBackground}>
          <div className={styles.spheres3D}>
            <div className={`${styles.sphere3D} ${styles.sphere1}`}></div>
            <div className={`${styles.sphere3D} ${styles.sphere2}`}></div>
            <div className={`${styles.sphere3D} ${styles.sphere3}`}></div>
            <div className={`${styles.sphere3D} ${styles.sphere4}`}></div>
          </div>
          
          <div className={styles.fluidShapes}>
            <div className={`${styles.fluidShape} ${styles.fluid1}`}></div>
            <div className={`${styles.fluidShape} ${styles.fluid2}`}></div>
            <div className={`${styles.fluidShape} ${styles.fluid3}`}></div>
          </div>
          
          <div className={styles.glowEffects}>
            <div className={`${styles.glow} ${styles.glow1}`}></div>
            <div className={`${styles.glow} ${styles.glow2}`}></div>
            <div className={`${styles.glow} ${styles.glow3}`}></div>
          </div>
          
          <div className={styles.energyParticles}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.energyParticle}></div>
            ))}
          </div>
          
          <div className={styles.centerCleanZone}></div>
        </div>
        
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} ${isVisible ? styles.visible : styles.hidden}`}>
            {t('home.news.title')}
          </h2>
          
          {/* Skeleton Loader */}
          <div className={styles.sliderContainer}>
            <div className={styles.skeletonNavButton}></div>
            
            <div className={styles.slider}>
              <div className={styles.sliderTrack}>
                <div className={styles.skeletonCard}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonDate}></div>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonTitle} style={{ width: '80%' }}></div>
                    <div className={styles.skeletonSummary}></div>
                    <div className={styles.skeletonSummary}></div>
                    <div className={styles.skeletonSummary} style={{ width: '60%' }}></div>
                    <div className={styles.skeletonButton}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.skeletonNavButton}></div>
          </div>
          
          <div className={styles.skeletonDots}>
            <div className={styles.skeletonDot}></div>
            <div className={styles.skeletonDot}></div>
            <div className={styles.skeletonDot}></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className={styles.section}>
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
          {t('home.news.title')}
        </h2>

        {newsItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <p>No news available at the moment. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className={styles.sliderContainer}>
              <button
                className={styles.navButton}
                onClick={handlePrev}
                aria-label="Previous news"
              >
                <ChevronLeft size={24} />
              </button>

              <div ref={sliderRef} className={styles.slider}>
                <div
                  className={styles.sliderTrack}
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                    width: `${newsItems.length * 100}%`
                  }}
                >
                  {newsItems.map((item) => {
                    // Handle both id and _id (fallback for backward compatibility)
                    const itemId = item.id || item._id?.toString() || ''
                    return (
                    <div key={itemId || `news-${item.title}`} className={styles.newsCard}>
                      <div className={styles.imageContainer}>
                        <DefaultImage
                          src={item.mainImage}
                          alt={item.title}
                          fill
                          className={styles.newsImage}
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className={styles.cardContent}>
                        <div className={styles.dateContainer}>
                          <Calendar size={16} />
                          <span className={styles.date}>
                            {formatDate(item.publicationDate)}
                          </span>
                        </div>
                        <h3 className={styles.newsTitle}>{item.title}</h3>
                        <p className={styles.newsSummary}>{item.summary}</p>
                        <button
                          className={styles.readMoreButton}
                          onClick={() => handleReadMore(itemId)}
                        >
                          {t('home.news.readMore')}
                        </button>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>

              <button
                className={styles.navButton}
                onClick={handleNext}
                aria-label="Next news"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className={styles.dots}>
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to news ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

