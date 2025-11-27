'use client'

import { useLanguage } from '@/hooks/useLanguage'
import DefaultImage from '@/components/DefaultImage'
import { Settings, Wrench, Headphones, Truck } from 'lucide-react'
import styles from './services.module.css'

export default function ServicesPage() {
  const { t } = useLanguage()

  const services = [
    {
      icon: Settings,
      title: t('services.systemDesign'),
      description: 'Our expert engineers design custom solar systems tailored to your specific energy needs, location, and budget. We conduct comprehensive site assessments and provide detailed system specifications.',
      color: 'blue',
    },
    {
      icon: Wrench,
      title: t('services.installation'),
      description: 'Professional installation by certified technicians with full warranty coverage. We ensure all systems meet local codes and standards, with ongoing maintenance support to maximize performance.',
      color: 'green',
    },
    {
      icon: Headphones,
      title: t('services.aftersale'),
      description: 'Comprehensive after-sales support including system monitoring, troubleshooting, and regular maintenance. Our team is available 24/7 to address any concerns and ensure optimal system performance.',
      color: 'purple',
    },
    {
      icon: Truck,
      title: t('services.delivery'),
      description: 'Reliable delivery and logistics services ensuring all components arrive on time and in perfect condition. We coordinate with suppliers to guarantee quality equipment and timely project completion.',
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
    <div className={styles.page}>
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
                alt="ESSEC Services"
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

      {/* Process Section */}
      <section className={styles.processSection}>
        <div className={styles.container}>
          <div className={styles.processHeader}>
            <h2 className={styles.processTitle}>
              Our Process
            </h2>
            <p className={styles.processSubtitle}>
              From consultation to completion, we guide you every step of the way
            </p>
          </div>

          <div className={styles.processGrid}>
            {[
              { step: '1', title: 'Consultation', desc: 'Initial assessment and energy needs analysis' },
              { step: '2', title: 'Design', desc: 'Custom system design and proposal' },
              { step: '3', title: 'Installation', desc: 'Professional installation and testing' },
              { step: '4', title: 'Support', desc: 'Ongoing monitoring and maintenance' },
            ].map((item, index) => (
              <div key={index} className={styles.processItem}>
                <div className={styles.processStep}>
                  {item.step}
                </div>
                <h3 className={styles.processItemTitle}>
                  {item.title}
                </h3>
                <p className={styles.processItemDesc}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

