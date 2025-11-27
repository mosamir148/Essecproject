'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import ProjectCard from '@/components/ProjectCard'
import { projects as staticProjects, Project } from '@/data/projects'
import { api } from '@/lib/api'
import DefaultImage from '@/components/DefaultImage'
import styles from './projects.module.css'

export default function ProjectsPage() {
  const { t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>(staticProjects)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch from API, fallback to static data
    const loadProjects = async () => {
      try {
        const apiProjects = await api.getProjects()
        if (apiProjects && apiProjects.length > 0) {
          setProjects(apiProjects)
        }
      } catch (error) {
        // If API fails, use static data (already set as default)
        console.log('Using static project data')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Hero Section with Photo */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {t('projects.title')}
              </h1>
              <p className={styles.heroSubtitle}>
                {t('projects.subtitle')}
              </p>
            </div>
            <div className={styles.heroImage}>
              <DefaultImage
                src="/se.jpg"
                alt="ESSEC Solar Projects"
                fill
                className={styles.heroImageContent}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className={styles.projectsSection}>
        <div className={styles.container}>
          {projects.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                No projects available at the moment.
              </p>
            </div>
          ) : (
            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  location={project.location}
                  year={project.year}
                  duration={project.duration}
                  image={project.image}
                  video={project.video}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

