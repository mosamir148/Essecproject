'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { teamMembers } from '@/data/team'
import DefaultImage from '@/components/DefaultImage'
import { Award, Users, Calendar, Briefcase, UserCog } from 'lucide-react'
import styles from './about.module.css'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className={styles.page}>
      {/* Hero Section with Photo */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {t('about.title')}
              </h1>
              <p className={styles.heroSubtitle}>
                {t('about.heroSubtitle')}
              </p>
            </div>
            <div className={styles.heroImage}>
              <DefaultImage
                src="/aboutus1.png"
                alt={t('about.heroImageAlt')}
                fill
                className={styles.heroImageContent}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <UserCog className={styles.statIconSvg} />
              </div>
              <div className={styles.statValue}>25+</div>
              <div className={styles.statLabel}>{t('about.stats.engineers')}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users className={styles.statIconSvg} />
              </div>
              <div className={styles.statValue}>100+</div>
              <div className={styles.statLabel}>{t('about.stats.workers')}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Briefcase className={styles.statIconSvg} />
              </div>
              <div className={styles.statValue}>15+</div>
              <div className={styles.statLabel}>{t('about.stats.managers')}</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Company Info Section */}
      <section className={styles.companySection}>
        <div className={styles.companyContainer}>
          <div className={styles.companyGrid}>
            <div className={styles.companyContent}>
              <h2 className={styles.companyTitle}>
                {t('about.title')}
              </h2>
              <p className={styles.companyText}>
                {t('about.companyDescription1')}
              </p>
              <p className={styles.companyTextLast}>
                {t('about.companyDescription2')}
              </p>
              
              <div className={styles.establishmentInfo}>
                <Calendar className={styles.establishmentIcon} />
                <span className={styles.establishmentText}>{t('about.establishment')}: 2010</span>
              </div>
            </div>
            
            <div className={styles.solutionsBox}>
              <h3 className={styles.solutionsTitle}>
                {t('about.solutions')}
              </h3>
              <ul className={styles.solutionsList}>
                <li className={styles.solutionItem}>
                  <Award className={styles.solutionIcon} />
                  <span className={styles.solutionText}>
                    {t('about.solutionsList.solarPV')}
                  </span>
                </li>
                <li className={styles.solutionItem}>
                  <Award className={styles.solutionIcon} />
                  <span className={styles.solutionText}>
                    {t('about.solutionsList.waterHeating')}
                  </span>
                </li>
                <li className={styles.solutionItem}>
                  <Award className={styles.solutionIcon} />
                  <span className={styles.solutionText}>
                    {t('about.solutionsList.pumps')}
                  </span>
                </li>
                <li className={styles.solutionItem}>
                  <Award className={styles.solutionIcon} />
                  <span className={styles.solutionText}>
                    {t('about.solutionsList.designInstall')}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.teamContainer}>
          <div className={styles.teamHeader}>
            <h2 className={styles.teamTitle}>
              {t('about.team')}
            </h2>
            <p className={styles.teamSubtitle}>
              {t('about.teamSubtitle')}
            </p>
          </div>

          <div className={styles.teamGrid}>
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className={styles.teamCard}
              >
                <div className={styles.teamCardImage}>
                  <DefaultImage
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className={styles.teamCardContent}>
                  <h3 className={styles.teamCardName}>
                    {member.name}
                  </h3>
                  <p className={styles.teamCardRole}>
                    {t(`about.${member.roleKey}`)}
                  </p>
                  <p className={styles.teamCardBio}>
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

