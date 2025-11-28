'use client'

import { useEffect, useState, useRef } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { api } from '@/lib/api'
import VideoHero from '@/components/VideoHero'
import SplitSection from '@/components/SplitSection'
import SplitSectionReverse from '@/components/SplitSectionReverse'
import BenefitsSection from '@/components/BenefitsSection'
import Timeline from '@/components/Timeline'
import VisionSection from '@/components/VisionSection'
import FAQSection from '@/components/FAQSection'
import styles from './page.module.css'

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

  // Fetch homepage video from API
  useEffect(() => {
    const loadHomepageVideo = async () => {
      try {
        // Add cache-busting parameter to ensure fresh data
        const videoData = await api.getActiveHomepageVideo()
        if (videoData.videoUrl) {
          // Force video reload by adding timestamp to URL if it's not a data URL
          const videoUrl = videoData.videoUrl.startsWith('data:') 
            ? videoData.videoUrl 
            : `${videoData.videoUrl}${videoData.videoUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`
          setVideoSrc(videoUrl)
        }
        if (videoData.title) {
          setVideoTitle(videoData.title)
        }
        if (videoData.subtitle) {
          setVideoSubtitle(videoData.subtitle)
        }
      } catch (error) {
        console.error('Failed to load homepage video:', error)
        // Keep default video if API fails
      }
    }

    loadHomepageVideo()
    
    // Listen for custom event to refresh when video is updated in admin panel
    const handleVideoUpdate = () => {
      loadHomepageVideo()
    }
    
    window.addEventListener('homepage_video_updated', handleVideoUpdate)
    
    // Also check periodically (every 30 seconds) for updates
    const interval = setInterval(loadHomepageVideo, 30000)
    
    return () => {
      window.removeEventListener('homepage_video_updated', handleVideoUpdate)
      clearInterval(interval)
    }
  }, [])

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
      <VisionSection scrollY={scrollY} />
      <BenefitsSection scrollY={scrollY} />
      <Timeline scrollY={scrollY} />
      <FAQSection scrollY={scrollY} />
    </div>
  )
}

