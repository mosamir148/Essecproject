'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { api } from '@/lib/api'
import DefaultImage from '@/components/DefaultImage'
import Link from 'next/link'
import { ArrowLeft, User, Briefcase, FileText, Linkedin, Twitter, Facebook, Instagram, Globe, Download } from 'lucide-react'
import styles from './page.module.css'

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

export default function TeamMemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t, dir } = useLanguage()
  const memberId = params?.id as string
  const [member, setMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMember = async () => {
      try {
        const teamMember = await api.getTeamMember(memberId)
        setMember(teamMember)
      } catch (error) {
        console.error('Error loading team member:', error)
      } finally {
        setLoading(false)
      }
    }

    if (memberId) {
      loadMember()
    }
  }, [memberId])

  if (loading) {
    return (
      <div className={styles.loadingContainer} dir={dir}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>{t('team.detail.loading')}</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className={styles.errorContainer} dir={dir}>
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>{t('team.detail.notFound')}</h1>
          <p className={styles.errorText}>{t('team.detail.notFoundMessage')}</p>
          <Link href="/about" className={styles.errorLink}>
            <ArrowLeft className={styles.errorLinkIcon} />
            {t('team.detail.backToTeam')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroImageContainer}>
          <DefaultImage
            src={member.profileImage || '/team/placeholder.jpg'}
            alt={member.name}
            fill
            className={styles.heroImage}
            priority
            unoptimized
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {member.name}
              </h1>
              <div className={styles.heroMeta}>
                <Briefcase className={styles.heroMetaIcon} />
                <span className={styles.heroMetaText}>
                  {member.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back Button Section */}
      <div className={styles.backSection}>
        <div className={styles.backContainer}>
          <button onClick={() => router.push('/about')} className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            {t('team.detail.backToTeam')}
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.contentGrid}>
            {/* Main Content Column */}
            <div className={styles.mainContent}>
              {/* Bio Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconBlue}`}>
                    <User className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('team.detail.about')}
                  </h2>
                </div>
                <p className={styles.sectionText}>
                  {member.bio}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className={styles.sidebar}>
              {/* Profile Image Card */}
              <div className={styles.profileImageCard}>
                <DefaultImage
                  src={member.profileImage || '/team/placeholder.jpg'}
                  alt={member.name}
                  fill
                  className={styles.profileImage}
                  unoptimized
                />
              </div>

              {/* Info Card */}
              <div className={styles.infoCard}>
                <h3 className={styles.infoCardTitle}>
                  {t('team.detail.information')}
                </h3>
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <Briefcase className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <p className={styles.infoLabel}>
                        {t('team.detail.role')}
                      </p>
                      <p className={styles.infoValue}>
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links Card */}
              {member.socialLinks && Object.values(member.socialLinks).some(link => link && link.trim()) && (
                <div className={styles.infoCard}>
                  <h3 className={styles.infoCardTitle}>
                    {t('team.detail.socialLinks')}
                  </h3>
                  <div className={styles.socialLinksList}>
                    {member.socialLinks.linkedin && (
                      <a 
                        href={member.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.socialLinkItem}
                      >
                        <Linkedin className={styles.socialLinkIcon} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {member.socialLinks.twitter && (
                      <a 
                        href={member.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.socialLinkItem}
                      >
                        <Twitter className={styles.socialLinkIcon} />
                        <span>Twitter</span>
                      </a>
                    )}
                    {member.socialLinks.facebook && (
                      <a 
                        href={member.socialLinks.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.socialLinkItem}
                      >
                        <Facebook className={styles.socialLinkIcon} />
                        <span>Facebook</span>
                      </a>
                    )}
                    {member.socialLinks.instagram && (
                      <a 
                        href={member.socialLinks.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.socialLinkItem}
                      >
                        <Instagram className={styles.socialLinkIcon} />
                        <span>Instagram</span>
                      </a>
                    )}
                    {member.socialLinks.website && (
                      <a 
                        href={member.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.socialLinkItem}
                      >
                        <Globe className={styles.socialLinkIcon} />
                        <span>{t('team.detail.website')}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* CV Download Card */}
              {member.cvUrl && (
                <div className={styles.infoCard}>
                  <a 
                    href={member.cvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.cvLink}
                  >
                    <FileText className={styles.cvIcon} />
                    <span>{t('team.detail.downloadCV')}</span>
                    <Download className={styles.cvDownloadIcon} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

