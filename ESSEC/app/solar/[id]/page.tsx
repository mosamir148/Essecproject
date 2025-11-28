'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { solarSystems, SolarSystem } from '@/data/solarSystems'
import DefaultImage from '@/components/DefaultImage'
import Link from 'next/link'
import { ArrowLeft, Zap, Settings, CheckCircle, MapPin, Lightbulb, Wrench, TrendingUp, FileText, Image as ImageIcon } from 'lucide-react'
import styles from './page.module.css'

export default function SolarSystemDetailPage() {
  const params = useParams()
  const { t, dir } = useLanguage()
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
      <div className={styles.loadingContainer} dir={dir}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>{t('solar.detail.loading')}</p>
        </div>
      </div>
    )
  }

  if (!system) {
    return (
      <div className={styles.errorContainer} dir={dir}>
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>{t('solar.detail.notFound')}</h1>
          <p className={styles.errorText}>{t('solar.detail.notFoundMessage')}</p>
          <Link href="/solar" className={styles.errorLink}>
            <ArrowLeft className={styles.errorLinkIcon} />
            {t('solar.detail.backToSolar')}
          </Link>
        </div>
      </div>
    )
  }

  // Determine category based on system ID
  const getCategory = () => {
    if (system.id.includes('grid') || system.id.includes('meter') || system.id.includes('inverter') || system.id.includes('battery')) {
      return t('solar.detail.powerGeneration')
    } else if (system.id.includes('heating') || system.id.includes('heater')) {
      return t('solar.detail.waterHeating')
    } else {
      return t('solar.detail.waterSystems')
    }
  }

  return (
    <div className={styles.page} dir={dir}>
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
            {system.images && system.images.length > 0 ? (
              <div className={styles.heroImage}>
                <DefaultImage
                  src={system.images[0]}
                  alt={t(`solar.${system.nameKey}`)}
                  fill
                  className={styles.heroImageContent}
                  priority
                />
              </div>
            ) : (
              <div className={styles.heroImage}>
                <DefaultImage
                  src=""
                  alt={t(`solar.${system.nameKey}`)}
                  fill
                  className={styles.heroImageContent}
                  priority
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
            {t('solar.detail.backToSolar')}
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
                  {t(`solar.${system.descriptionKey}`)}
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
                  {t(`solar.${system.howItWorksKey}`)}
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
                  {system.technicalDetailsKeys.map((detailKey, index) => (
                    <li key={index} className={styles.listItem}>
                      <span className={styles.listBulletBlue}>•</span>
                      <span className={styles.listText}>{t(`solar.${detailKey}`)}</span>
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
                  {system.benefitsKeys.map((benefitKey, index) => (
                    <li key={index} className={styles.listItem}>
                      <CheckCircle className={styles.listIcon} />
                      <span className={styles.listText}>{t(`solar.${benefitKey}`)}</span>
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
                  {system.usageScenariosKeys.map((scenarioKey, index) => (
                    <li key={index} className={styles.listItem}>
                      <span className={styles.listBulletPurple}>•</span>
                      <span className={styles.listText}>{t(`solar.${scenarioKey}`)}</span>
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
                      {t('solar.detail.gallery')}
                    </h2>
                  </div>
                  <div className={styles.galleryGrid}>
                    {system.images.slice(1).map((image, index) => (
                      <div key={index} className={styles.galleryItem}>
                        <DefaultImage
                          src={image}
                          alt={`${t(`solar.${system.nameKey}`)} - Image ${index + 2}`}
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
                  {t('solar.detail.systemInformation')}
                </h3>
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <Zap className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <p className={styles.infoLabel}>{t('solar.detail.systemType')}</p>
                      <p className={styles.infoValue}>
                        {t(`solar.${system.nameKey}`)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <Lightbulb className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <p className={styles.infoLabel}>{t('solar.detail.category')}</p>
                      <p className={styles.infoValue}>
                        {getCategory()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Image */}
              <div className={styles.sidebarImage}>
                <DefaultImage
                  src={system.images && system.images.length > 0 ? system.images[0] : ''}
                  alt={t(`solar.${system.nameKey}`)}
                  fill
                  className={styles.sidebarImageContent}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

