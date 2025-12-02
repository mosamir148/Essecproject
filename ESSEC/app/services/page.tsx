'use client'

import { useLanguage } from '@/hooks/useLanguage'
import DefaultImage from '@/components/DefaultImage'
import { Settings, Wrench, Headphones, Truck, Award } from 'lucide-react'
import styles from './services.module.css'

export default function ServicesPage() {
  const { t, dir } = useLanguage()

  const services = [
    {
      icon: Settings,
      title: t('services.systemDesign'),
      description: t('services.systemDesignDesc'),
      color: 'blue',
    },
    {
      icon: Wrench,
      title: t('services.installation'),
      description: t('services.installationDesc'),
      color: 'green',
    },
    {
      icon: Headphones,
      title: t('services.aftersale'),
      description: t('services.aftersaleDesc'),
      color: 'purple',
    },
    {
      icon: Truck,
      title: t('services.delivery'),
      description: t('services.deliveryDesc'),
      color: 'orange',
    },
  ]

  const colorClasses = {
    blue: {
      iconContainer: styles.iconContainerBlue,
      icon: styles.iconBlue,
    },
    green: {
      iconContainer: styles.iconContainerGreen,
      icon: styles.iconGreen,
    },
    purple: {
      iconContainer: styles.iconContainerPurple,
      icon: styles.iconPurple,
    },
    orange: {
      iconContainer: styles.iconContainerOrange,
      icon: styles.iconOrange,
    },
  }

  return (
    <div className={styles.page} dir={dir}>
      {/* Hero Section with Photo */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {t('services.title')}
              </h1>
              <p className={styles.heroSubtitle}>
                {t('services.subtitle')}
              </p>
            </div>
            <div className={styles.heroImage}>
              <DefaultImage
                src="/ourservise.png"
                alt={t('services.heroImageAlt')}
                fill
                className={styles.heroImageContent}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={styles.servicesSection}>
        <div className={styles.container}>
          <div className={styles.servicesHeader}>
            <h2 className={styles.servicesTitle}>
              {t('services.title')}
            </h2>
            <p className={styles.servicesSubtitle}>
              {t('services.subtitle')}
            </p>
          </div>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => {
              const Icon = service.icon
              const colors = colorClasses[service.color as keyof typeof colorClasses]
              
              return (
                <div
                  key={index}
                  className={styles.serviceCard}
                >
                  <div className={`${styles.iconContainer} ${colors.iconContainer}`}>
                    <Icon className={`${styles.icon} ${colors.icon}`} />
                  </div>
                  <h3 className={styles.serviceTitle}>
                    {service.title}
                  </h3>
                  <p className={styles.serviceDescription}>
                    {service.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Work Areas Section */}
      <section className={styles.workAreasSection}>
        <div className={styles.container}>
          <div className={styles.workAreasHeader}>
            <h2 className={styles.workAreasTitle}>
              {t('services.workAreas.title')}
            </h2>
          </div>
          <div className={styles.workAreasList}>
            {[
              'gridConnected',
              'offGrid',
              'irrigationPumps',
              'waterHeatingManufacturing',
              'centralHeating',
              'poolHeating',
              'waterTreatment',
              'solarDrying',
              'upsSystems',
              'researchLabs'
            ].map((key, index) => (
              <div key={key} className={styles.workAreaItem}>
                <Award className={styles.workAreaIcon} />
                <span className={styles.workAreaText}>
                  {t(`services.workAreas.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={styles.processSection}>
        <div className={styles.container}>
          <div className={styles.processHeader}>
            <h2 className={styles.processTitle}>
              {t('services.process.title')}
            </h2>
            <p className={styles.processSubtitle}>
              {t('services.process.subtitle')}
            </p>
          </div>

          <div className={styles.processGrid}>
            {[
              { step: '1', titleKey: 'step1.title', descKey: 'step1.description' },
              { step: '2', titleKey: 'step2.title', descKey: 'step2.description' },
              { step: '3', titleKey: 'step3.title', descKey: 'step3.description' },
              { step: '4', titleKey: 'step4.title', descKey: 'step4.description' },
            ].map((item, index) => (
              <div key={index} className={styles.processItem}>
                <div className={styles.processStep}>
                  {item.step}
                </div>
                <h3 className={styles.processItemTitle}>
                  {t(`services.process.${item.titleKey}`)}
                </h3>
                <p className={styles.processItemDesc}>
                  {t(`services.process.${item.descKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

