'use client'

import { useEffect, useState, useRef, Suspense, lazy } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { api } from '@/lib/api'
import VideoHero from '@/components/VideoHero'
import SplitSection from '@/components/SplitSection'
import SplitSectionReverse from '@/components/SplitSectionReverse'
import styles from './page.module.css'

// Lazy load below-the-fold components for better initial load performance
const NewsSection = lazy(() => import('@/components/NewsSection'))
const BenefitsSection = lazy(() => import('@/components/BenefitsSection'))
const Timeline = lazy(() => import('@/components/Timeline'))
const VisionSection = lazy(() => import('@/components/VisionSection'))
const FAQSection = lazy(() => import('@/components/FAQSection'))

export default function Home() {
  const { t } = useLanguage()
  const [scrollY, setScrollY] = useState(0)
  const [videoSrc, setVideoSrc] = useState<string>('/video.mp4') // Default fallback
  const [videoTitle, setVideoTitle] = useState<string>('')
  const [videoSubtitle, setVideoSubtitle] = useState<string>('')
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch homepage video from API (non-blocking)
  useEffect(() => {
    let mounted = true
    
    const loadHomepageVideo = async () => {
      try {
        // Use a timeout to prevent blocking the page load
        const videoData = await Promise.race([
          api.getActiveHomepageVideo(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Video load timeout')), 3000)
          )
        ]) as any
        
        if (!mounted) return
        
        if (videoData.videoUrl) {
          // Use video URL directly - let browser handle caching
          setVideoSrc(videoData.videoUrl)
        }
        if (videoData.title) {
          setVideoTitle(videoData.title)
        }
        if (videoData.subtitle) {
          setVideoSubtitle(videoData.subtitle)
        }
      } catch (error) {
        // Silently fail - use default video
        if (mounted && process.env.NODE_ENV === 'development') {
          console.log('Using default video:', error)
        }
      }
    }

    // Load video after a short delay to prioritize initial render
    const timeoutId = setTimeout(loadHomepageVideo, 100)
    
    // Listen for custom event to refresh when video is updated in admin panel
    const handleVideoUpdate = () => {
      loadHomepageVideo()
    }
    
    window.addEventListener('homepage_video_updated', handleVideoUpdate)
    
    return () => {
      mounted = false
      clearTimeout(timeoutId)
      window.removeEventListener('homepage_video_updated', handleVideoUpdate)
    }
  }, [])

  // Loading fallback component - minimal to avoid blocking
  const LoadingFallback = () => (
    <div style={{ 
      minHeight: '200px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      opacity: 0.3
    }}>
      {/* Minimal loading indicator */}
    </div>
  )

  return (
    <div ref={pageRef} className={styles.page}>
      <VideoHero
        title={videoTitle || t('home.title')}
        subtitle={videoSubtitle || t('home.subtitle')}
        videoSrc={videoSrc}
        scrollY={scrollY}
      />
      <SplitSection scrollY={scrollY} />
      <SplitSectionReverse scrollY={scrollY} />
      
      {/* Lazy loaded components with Suspense */}
      <Suspense fallback={<LoadingFallback />}>
        <NewsSection scrollY={scrollY} />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <VisionSection scrollY={scrollY} />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <BenefitsSection scrollY={scrollY} />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <Timeline scrollY={scrollY} />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <FAQSection scrollY={scrollY} />
      </Suspense>
    </div>
  )
}

