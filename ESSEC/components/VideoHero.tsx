'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import Image from 'next/image'
import styles from './VideoHero.module.css'

interface VideoHeroProps {
  title: string
  subtitle?: string
  videoSrc?: string
  imageSrc?: string
  fullHeight?: boolean
  scrollY?: number
}

export default function VideoHero({ title, subtitle, videoSrc, imageSrc, fullHeight = true, scrollY = 0 }: VideoHeroProps) {
  const { dir } = useLanguage()
  const [videoError, setVideoError] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const [parallaxOffset, setParallaxOffset] = useState(0)

  useEffect(() => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate parallax offset: video moves slower than scroll
      // Parallax effect when hero section is visible
      if (rect.bottom > 0 && rect.top < windowHeight) {
        // Calculate how much of the hero is scrolled past
        const scrollProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)))
        // Parallax speed: 0.5 means video moves at half the scroll speed
        setParallaxOffset(scrollProgress * rect.height * 0.5)
      } else if (rect.top >= windowHeight) {
        // Before entering viewport
        setParallaxOffset(0)
      } else {
        // After leaving viewport
        setParallaxOffset(rect.height * 0.5)
      }
    }
  }, [scrollY])

  const handleVideoError = () => {
    setVideoError(true)
  }

  return (
    <div ref={heroRef} className={`${styles.container} ${fullHeight ? styles.containerFullHeight : styles.containerPartialHeight}`}>
      {/* Video Background with Parallax */}
      {videoSrc && !videoError ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.video}
          style={{ transform: `translateY(${parallaxOffset}px)` }}
          onError={handleVideoError}
        >
          <source src={videoSrc} type={`video/${videoSrc.split('.').pop()}`} />
        </video>
      ) : imageSrc ? (
        <div className={styles.imageContainer} style={{ transform: `translateY(${parallaxOffset}px)` }}>
          <Image
            src={imageSrc}
            alt={title}
            fill
            className={styles.image}
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div 
          className={styles.gradientBackground}
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        />
      )}

      {/* Overlay */}
      <div className={styles.overlay} />

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>
            {title}
          </h1>
          {subtitle && (
            <p className={styles.subtitle}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      {fullHeight && (
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollIndicatorInner}>
            <div className={styles.scrollIndicatorDot} />
          </div>
        </div>
      )}
    </div>
  )
}

