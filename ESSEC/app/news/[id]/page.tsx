'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { api } from '@/lib/api'
import DefaultImage from '@/components/DefaultImage'
import Link from 'next/link'
import { ArrowLeft, Calendar, Image as ImageIcon } from 'lucide-react'
import styles from './page.module.css'

interface NewsItem {
  id: string
  title: string
  mainImage: string
  summary: string
  fullText: string
  additionalImages: string[]
  publicationDate: string
  extraData?: any
}

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t, dir } = useLanguage()
  const newsId = params?.id as string
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNews = async () => {
      try {
        const news = await api.getNewsItem(newsId)
        setNewsItem(news)
      } catch (error) {
        console.error('Error loading news:', error)
      } finally {
        setLoading(false)
      }
    }

    if (newsId) {
      loadNews()
    }
  }, [newsId])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!newsItem) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>News Not Found</h1>
          <p className={styles.errorText}>The news item you're looking for doesn't exist.</p>
          <Link href="/" className={styles.errorLink}>
            <ArrowLeft className={styles.errorLinkIcon} />
            {t('news.backToNews')}
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFullText = (text: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
    return paragraphs
  }

  return (
    <div className={styles.page} dir={dir}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroImageContainer}>
          <DefaultImage
            src={newsItem.mainImage}
            alt={newsItem.title}
            fill
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {newsItem.title}
              </h1>
              <div className={styles.heroMeta}>
                <Calendar className={styles.heroMetaIcon} />
                <span className={styles.heroMetaText}>
                  {t('news.publishedOn')} {formatDate(newsItem.publicationDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back Button Section */}
      <div className={styles.backSection}>
        <div className={styles.backContainer}>
          <button onClick={() => router.push('/')} className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            {t('news.backToNews')}
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.contentGrid}>
            {/* Main Content Column */}
            <div className={styles.mainContent}>
              {/* Summary Section */}
              {newsItem.summary && (
                <div className={styles.section}>
                  <p className={styles.summaryText}>
                    {newsItem.summary}
                  </p>
                </div>
              )}

              {/* Full Text Section */}
              <div className={styles.section}>
                <div className={styles.fullText}>
                  {formatFullText(newsItem.fullText).map((paragraph, index) => (
                    <p key={index} className={styles.paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Additional Images Gallery */}
              {newsItem.additionalImages && newsItem.additionalImages.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={`${styles.sectionIcon} ${styles.sectionIconBlue}`}>
                      <ImageIcon className={styles.sectionIconSvg} />
                    </div>
                    <h2 className={styles.sectionTitle}>
                      Additional Images
                    </h2>
                  </div>
                  <div className={styles.galleryGrid}>
                    {newsItem.additionalImages.map((image, index) => (
                      <div key={index} className={styles.galleryItem}>
                        <DefaultImage
                          src={image}
                          alt={`${newsItem.title} - Image ${index + 1}`}
                          fill
                          className={styles.galleryImage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className={styles.sidebar}>
              {/* Info Card */}
              <div className={styles.infoCard}>
                <h3 className={styles.infoCardTitle}>
                  Publication Information
                </h3>
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <Calendar className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <p className={styles.infoLabel}>
                        Published Date
                      </p>
                      <p className={styles.infoValue}>
                        {formatDate(newsItem.publicationDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}



