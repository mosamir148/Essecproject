'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { teamMembers } from '@/data/team'
import Image from 'next/image'
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
                Leading the solar energy revolution
              </p>
            </div>
            <div className={styles.heroImage}>
              <Image
                src="/3 (2).jpg"
                alt="About ESSEC Solar Engineering"
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
              <div className={styles.statLabel}>Engineers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users className={styles.statIconSvg} />
              </div>
              <div className={styles.statValue}>100+</div>
              <div className={styles.statLabel}>Workers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Briefcase className={styles.statIconSvg} />
              </div>
              <div className={styles.statValue}>15+</div>
              <div className={styles.statLabel}>Managers</div>
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
                ESSEC Solar Engineering is a leading provider of comprehensive solar energy solutions, 
                committed to delivering sustainable and efficient renewable energy systems. With years of 
                experience in the industry, we specialize in designing, installing, and maintaining solar 
                photovoltaic systems for residential, commercial, and industrial applications.
              </p>
              <p className={styles.companyTextLast}>
                Our mission is to make clean, renewable energy accessible to everyone while providing 
                exceptional service and support throughout the entire project lifecycle.
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
                    Solar PV Power Generation Systems (On-Grid, Off-Grid, Net-Meter)
                  </span>
                </li>
                <li className={styles.solutionItem}>
                  <Award className={styles.solutionIcon} />
                  <span className={styles.solutionText}>
                    Solar Water Heating Systems
                  </span>
                </li>
                <li className={styles.solutionItem}>
                  <Award className={styles.solutionIcon} />
                  <span className={styles.solutionText}>
                    Solar Pumps and Irrigation Systems
                  </span>
                </li>
                <li className={styles.solutionItem}>
                  <Award className={styles.solutionIcon} />
                  <span className={styles.solutionText}>
                    System Design, Installation, and Maintenance
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
              Meet the experts behind our success
            </p>
          </div>

          <div className={styles.teamGrid}>
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className={styles.teamCard}
              >
                <div className={styles.teamCardImage}>
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#ddd" width="400" height="400"/><text fill="#999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%" y="50%" text-anchor="middle">${member.name}</text></svg>`)}`
                    }}
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

