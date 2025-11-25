'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/hooks/useLanguage'
import { MapPin, Calendar, Clock, Play, Image as ImageIcon } from 'lucide-react'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
  id: string
  name: string
  location: string
  year: number
  duration: string
  image: string
  video?: string
}

export default function ProjectCard({ id, name, location, year, duration, image, video }: ProjectCardProps) {
  const { t } = useLanguage()
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isHovered])

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Section */}
      <div className={styles.mediaContainer}>
        {video && (
          <div className={`${styles.videoContainer} ${isHovered ? styles.videoContainerVisible : styles.videoContainerHidden}`}>
            <video
              ref={videoRef}
              loop
              muted
              playsInline
              className={styles.video}
              onError={() => {}}
            >
              <source src={video} type="video/mp4" />
            </video>
            <div className={styles.videoOverlay} />
            <div className={styles.videoBadge}>
              <Play className={styles.videoBadgeIcon} />
              <span className={styles.videoBadgeText}>Video</span>
            </div>
          </div>
        )}
        <div className={`${styles.imageContainer} ${isHovered && video ? styles.imageContainerHidden : styles.imageContainerVisible}`}>
          <Image
            src={image}
            alt={name}
            fill
            className={styles.image}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23ddd" width="600" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E' + name + '%3C/text%3E%3C/svg%3E'
            }}
          />
          <div className={styles.imageGradient} />
          {video && (
            <div className={styles.playButtonContainer}>
              <div className={styles.playButton}>
                <Play className={styles.playIcon} />
              </div>
            </div>
          )}
          <div className={styles.photoBadge}>
            <ImageIcon className={styles.photoBadgeIcon} />
            <span className={styles.photoBadgeText}>Photo</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <Link href={`/projects/${id}`}>
        <div className={styles.content}>
          <h3 className={styles.title}>
            {name}
          </h3>
          
          {/* Project Details */}
          <div className={styles.detailsContainer}>
            <div className={styles.detailRow}>
              <MapPin className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <p className={styles.detailLabel}>
                  {t('projects.card.location')}
                </p>
                <p className={styles.detailValue}>
                  {location}
                </p>
              </div>
            </div>
            
            <div className={styles.detailRowHorizontal}>
              <div className={styles.detailItem}>
                <Calendar className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <p className={styles.detailLabel}>
                    {t('projects.card.completed')}
                  </p>
                  <p className={styles.detailValue}>
                    {year}
                  </p>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <Clock className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <p className={styles.detailLabel}>
                    {t('projects.card.duration')}
                  </p>
                  <p className={styles.detailValue}>
                    {duration}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className={styles.ctaSection}>
            <div className={styles.ctaContent}>
              <span className={styles.ctaText}>
                {t('common.viewDetails')}
              </span>
              <div className={styles.ctaIconContainer}>
                <svg
                  className={styles.ctaIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

