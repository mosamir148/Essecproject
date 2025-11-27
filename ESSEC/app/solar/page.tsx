'use client'

import { useLanguage } from '@/hooks/useLanguage'
import VideoHero from '@/components/VideoHero'
import DefaultImage from '@/components/DefaultImage'
import { solarSystems } from '@/data/solarSystems'
import Link from 'next/link'
import { ArrowRight, Zap, Leaf, Wrench } from 'lucide-react'
import styles from './page.module.css'

export default function SolarPage() {
  const { t } = useLanguage()

  return (
    <div className={styles.page}>
      <VideoHero
        title={t('solar.title')}
        subtitle={t('solar.subtitle')}
        imageSrc="/solar.png"
        fullHeight={false}
      />

      {/* Systems Grid */}
      <section className={styles.systemsSection}>
        <div className={styles.container}>
          <div className={styles.systemsGrid}>
            {solarSystems.map((system) => (
              <Link
                key={system.id}
                href={`/solar/${system.id}`}
                className={styles.systemCard}
              >
                <div className={styles.cardImageContainer}>
                  <div className={styles.cardImageOverlay} />
                  <div className={styles.cardIconContainer}>
                    <Zap className={styles.cardIcon} />
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>
                    {t(`solar.${system.nameKey}`)}
                  </h3>
                  <p className={styles.cardDescription}>
                    {t(`solar.${system.summaryKey}`)}
                  </p>
                  <div className={styles.cardLink}>
                    <span>{t('common.learnMore')}</span>
                    <ArrowRight className={styles.cardLinkIcon} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.benefitsContainer}>
          <div className={styles.benefitsHeader}>
            <h2 className={styles.benefitsTitle}>
              {t('solar.benefits.title')}
            </h2>
            <p className={styles.benefitsSubtitle}>
              {t('solar.benefits.subtitle')}
            </p>
          </div>

          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIconContainer} ${styles.benefitIconContainerGreen}`}>
                <Leaf className={`${styles.benefitIcon} ${styles.benefitIconGreen}`} />
              </div>
              <h3 className={styles.benefitTitle}>
                {t('solar.benefits.environmentallyFriendly.title')}
              </h3>
              <p className={styles.benefitText}>
                {t('solar.benefits.environmentallyFriendly.description')}
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIconContainer} ${styles.benefitIconContainerBlue}`}>
                <Zap className={`${styles.benefitIcon} ${styles.benefitIconBlue}`} />
              </div>
              <h3 className={styles.benefitTitle}>
                {t('solar.benefits.costSavings.title')}
              </h3>
              <p className={styles.benefitText}>
                {t('solar.benefits.costSavings.description')}
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIconContainer} ${styles.benefitIconContainerPurple}`}>
                <Wrench className={`${styles.benefitIcon} ${styles.benefitIconPurple}`} />
              </div>
              <h3 className={styles.benefitTitle}>
                {t('solar.benefits.lowMaintenance.title')}
              </h3>
              <p className={styles.benefitText}>
                {t('solar.benefits.lowMaintenance.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
