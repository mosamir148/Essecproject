'use client'

import { useEffect, useState, useRef } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
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
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={pageRef} className={styles.page}>
      <VideoHero
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        videoSrc="/video.mp4"
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

