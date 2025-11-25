'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { projects as staticProjects, Project } from '@/data/projects'
import { api } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Clock, CheckCircle, Lightbulb, Wrench, TrendingUp, FileText, Image as ImageIcon } from 'lucide-react'
import styles from './page.module.css'

export default function ProjectDetailPage() {
  const params = useParams()
  const { t } = useLanguage()
  const projectId = params?.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProject = async () => {
      try {
        // Try to fetch from API first
        try {
          const apiProject = await api.getProject(projectId)
          setProject(apiProject)
        } catch (apiError) {
          // If API fails, try to find in static data
          const staticProject = staticProjects.find((p) => p.id === projectId)
          if (staticProject) {
            setProject(staticProject)
          }
        }
      } catch (error) {
        console.error('Error loading project:', error)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>Project Not Found</h1>
          <p className={styles.errorText}>The project you're looking for doesn't exist.</p>
          <Link href="/projects" className={styles.errorLink}>
            <ArrowLeft className={styles.errorLinkIcon} />
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.heroSection} style={{ backgroundImage: `url('${project.image}')` }}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {project.name}
              </h1>
              <p className={styles.heroSubtitle}>
                {project.location}
              </p>
            </div>
            <div className={styles.heroImage}>
              <Image
                src={project.image}
                alt={project.name}
                fill
                className={styles.heroImageContent}
                priority
                onError={(e) => {
                  e.currentTarget.src = '/3 (2).jpg'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Back Button Section */}
      <div className={styles.backSection}>
        <div className={styles.backContainer}>
          <Link href="/projects" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            {t('common.back')} to Projects
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
                    {t('projects.detail.description')}
                  </h2>
                </div>
                <p className={styles.sectionText}>
                  {project.description}
                </p>
              </div>

              {/* Challenges Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconRed}`}>
                    <Lightbulb className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('projects.detail.challenges')}
                  </h2>
                </div>
                <ul className={styles.list}>
                  {project.challenges.map((challenge, index) => (
                    <li key={index} className={styles.listItem}>
                      <span className={styles.listBullet}>•</span>
                      <span className={styles.listText}>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Execution Methods Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconBlue}`}>
                    <Wrench className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('projects.detail.execution')}
                  </h2>
                </div>
                <ul className={styles.list}>
                  {project.executionMethods.map((method, index) => (
                    <li key={index} className={styles.listItem}>
                      <span className={styles.listBulletBlue}>•</span>
                      <span className={styles.listText}>{method}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Results Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconGreen}`}>
                    <TrendingUp className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('projects.detail.results')}
                  </h2>
                </div>
                <ul className={styles.list}>
                  {project.results.map((result, index) => (
                    <li key={index} className={styles.listItem}>
                      <CheckCircle className={styles.listIcon} />
                      <span className={styles.listText}>{result}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Notes Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconPurple}`}>
                    <FileText className={styles.sectionIconSvg} />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {t('projects.detail.technicalNotes')}
                  </h2>
                </div>
                <p className={styles.sectionText}>
                  {project.technicalNotes}
                </p>
              </div>

              {/* Gallery Section */}
              {project.gallery && project.gallery.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={`${styles.sectionIcon} ${styles.sectionIconYellow}`}>
                      <ImageIcon className={styles.sectionIconSvg} />
                    </div>
                    <h2 className={styles.sectionTitle}>
                      {t('projects.detail.gallery')}
                    </h2>
                  </div>
                  <div className={styles.galleryGrid}>
                    {project.gallery.map((image, index) => (
                      <div key={index} className={styles.galleryItem}>
                        <Image
                          src={image}
                          alt={`${project.name} - Image ${index + 1}`}
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
                  Project Information
                </h3>
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <MapPin className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <p className={styles.infoLabel}>
                        {t('projects.card.location')}
                      </p>
                      <p className={styles.infoValue}>
                        {project.location}
                      </p>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <Calendar className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <p className={styles.infoLabel}>
                        {t('projects.card.completed')}
                      </p>
                      <p className={styles.infoValue}>
                        {project.year}
                      </p>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <Clock className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <p className={styles.infoLabel}>
                        {t('projects.card.duration')}
                      </p>
                      <p className={styles.infoValue}>
                        {project.duration}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Image */}
              <div className={styles.sidebarImage}>
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className={styles.sidebarImageContent}
                  onError={(e) => {
                    e.currentTarget.src = '/3 (2).jpg'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
