'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { solarSystems, SolarSystem } from '@/data/solarSystems'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Zap, Settings, CheckCircle, MapPin, Lightbulb, Wrench, TrendingUp, FileText, Image as ImageIcon } from 'lucide-react'
import styles from './page.module.css'

export default function SolarSystemDetailPage() {
  const params = useParams()
  const { t } = useLanguage()
  const systemId = params?.id as string
  const [system, setSystem] = useState<SolarSystem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (systemId) {
      const foundSystem = solarSystems.find((s) => s.id === systemId)
      setSystem(foundSystem || null)
      setLoading(false)
    }
  }, [systemId])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading system...</p>
        </div>
      </div>
    )
  }

  if (!system) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>System Not Found</h1>
          <p className={styles.errorText}>The solar system you're looking for doesn't exist.</p>
          <Link href="/solar" className={styles.errorLink}>
            <ArrowLeft className={styles.errorLinkIcon} />
            Back to Solar Systems
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {t(`solar.${system.nameKey}`)}
              </h1>
              <p className={styles.heroSubtitle}>
                {t(`solar.${system.summaryKey}`)}
              </p>
            </div>
            {system.images && system.images.length > 0 && (
              <div className={styles.heroImage}>
                <Image
                  src={system.images[0]}
                  alt={t(`solar.${system.nameKey}`)}
                  fill
                  className={styles.heroImageContent}
                  priority
                  onError={(e) => {
                    e.currentTarget.src = '/3 (2).jpg'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Back Button Section */}
      <div className={styles.backSection}>
        <div className={styles.backContainer}>
          <Link href="/solar" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            {t('common.back')} to Solar Systems
          </Link>
        </div>
      </div>

      {/* Main Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.contentGrid}>
            {/* Main Content Column */}
            <div className={styles.mainContent}>
              {/* Description Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconBlue}`}>
                    <FileText className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('solar.detail.description')}
                  </h2>
                </div>
                <p className={styles.sectionText}>
                  {system.description}
                </p>
              </div>

              {/* How It Works Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconPurple}`}>
                    <Settings className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('solar.detail.howItWorks')}
                  </h2>
                </div>
                <p className={styles.sectionText}>
                  {system.howItWorks}
                </p>
              </div>

              {/* Technical Details Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconBlue}`}>
                    <Wrench className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('solar.detail.technicalDetails')}
                  </h2>
                </div>
                <ul className={styles.list}>
                  {system.technicalDetails.map((detail, index) => (
                    <li key={index} className={styles.listItem}>
                      <span className={styles.listBulletBlue}>•</span>
                      <span className={styles.listText}>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconGreen}`}>
                    <TrendingUp className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('solar.detail.benefits')}
                  </h2>
                </div>
                <ul className={styles.list}>
                  {system.benefits.map((benefit, index) => (
                    <li key={index} className={styles.listItem}>
                      <CheckCircle className={styles.listIcon} />
                      <span className={styles.listText}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usage Scenarios Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconYellow}`}>
                    <MapPin className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('solar.detail.usageScenarios')}
                  </h2>
                </div>
                <ul className={styles.list}>
                  {system.usageScenarios.map((scenario, index) => (
                    <li key={index} className={styles.listItem}>
                      <span className={styles.listBulletPurple}>•</span>
                      <span className={styles.listText}>{scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gallery Section */}
              {system.images && system.images.length > 1 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={`${styles.sectionIcon} ${styles.sectionIconYellow}`}>
                      <ImageIcon className={styles.sectionIconSvg} />
                    </div>
                    <h2 className={styles.sectionTitle}>
                      Gallery
                    </h2>
                  </div>
                  <div className={styles.galleryGrid}>
                    {system.images.slice(1).map((image, index) => (
                      <div key={index} className={styles.galleryItem}>
                        <Image
                          src={image}
                          alt={`${t(`solar.${system.nameKey}`)} - Image ${index + 2}`}
                          fill
                          className={styles.galleryImage}
                          onError={(e) => {
                            e.currentTarget.src = '/3 (2).jpg'
                          }}
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
                  System Information
                </h3>
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <Zap className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <p className={styles.infoLabel}>System Type</p>
                      <p className={styles.infoValue}>
                        {t(`solar.${system.nameKey}`)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <Lightbulb className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <p className={styles.infoLabel}>Category</p>
                      <p className={styles.infoValue}>
                        {system.id.includes('grid') || system.id.includes('meter') || system.id.includes('inverter') || system.id.includes('battery')
                          ? 'Power Generation'
                          : system.id.includes('heating') || system.id.includes('heater')
                          ? 'Water Heating'
                          : 'Water Systems'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Image */}
              {system.images && system.images.length > 0 && (
                <div className={styles.sidebarImage}>
                  <Image
                    src={system.images[0]}
                    alt={t(`solar.${system.nameKey}`)}
                    fill
                    className={styles.sidebarImageContent}
                    onError={(e) => {
                      e.currentTarget.src = '/3 (2).jpg'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

