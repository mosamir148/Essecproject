'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { api } from '@/lib/api'
import DefaultImage from '@/components/DefaultImage'
import Link from 'next/link'
import { Award, Users, Calendar, Briefcase, UserCog } from 'lucide-react'
import styles from './about.module.css'

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  profileImage: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
    website?: string
  }
  cvUrl?: string
  displayOrder: number
}

export default function AboutPage() {
  const { t } = useLanguage()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const members = await api.getTeamMembers()
      // Sort by displayOrder
      const sortedMembers = members.sort((a: TeamMember, b: TeamMember) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      )
      setTeamMembers(sortedMembers)
    } catch (err) {
      console.error('Failed to load team members:', err)
      setError('Failed to load team members')
      // Fallback to empty array so page still renders
      setTeamMembers([])
    } finally {
      setLoading(false)
    }
  }

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

          {loading ? (
            <div className={styles.teamGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.teamCard} style={{ opacity: 0.8 }}>
                  <div className={styles.teamCardImage}>
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', 
                      backgroundSize: '200% 100%', 
                      animation: 'skeletonShimmer 2s ease-in-out infinite',
                      borderRadius: '8px'
                    }}></div>
                  </div>
                  <div className={styles.teamCardContent}>
                    <div style={{ height: '1.5rem', width: '70%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                    <div style={{ height: '1rem', width: '50%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '4px', marginBottom: '0.75rem' }}></div>
                    <div style={{ height: '0.875rem', width: '100%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                    <div style={{ height: '0.875rem', width: '90%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>{error}</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>No team members available.</p>
            </div>
          ) : (
            <div className={styles.teamGrid}>
              {teamMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/team/${member.id}`}
                  className={styles.teamCard}
                >
                  <div className={styles.teamCardImage}>
                    <DefaultImage
                      src={member.profileImage || '/team/placeholder.jpg'}
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
                      {member.role}
                    </p>
                    <p className={styles.teamCardBio}>
                      {member.bio}
                    </p>
                    {/* Social Links */}
                    {member.socialLinks && Object.values(member.socialLinks).some(link => link && link.trim()) && (
                      <div className={styles.socialLinks}>
                        {member.socialLinks.linkedin && (
                          <a 
                            href={member.socialLinks.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="LinkedIn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            LinkedIn
                          </a>
                        )}
                        {member.socialLinks.twitter && (
                          <a 
                            href={member.socialLinks.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="Twitter"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Twitter
                          </a>
                        )}
                        {member.socialLinks.website && (
                          <a 
                            href={member.socialLinks.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="Website"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Website
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

