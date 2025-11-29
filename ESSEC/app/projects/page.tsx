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
      <div className={styles.page}>
        {/* Hero Section Skeleton */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <div style={{ height: '3rem', width: '60%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '8px', marginBottom: '1rem' }}></div>
                <div style={{ height: '1.5rem', width: '80%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '4px' }}></div>
              </div>
              <div className={styles.heroImage}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '12px' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid Skeleton */}
        <section className={styles.projectsSection}>
          <div className={styles.container}>
            <div className={styles.projectsGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px -5px rgba(9, 168, 107, 0.1)',
                  border: '1px solid rgba(9, 168, 107, 0.15)'
                }}>
                  <div style={{ 
                    width: '100%', 
                    height: '200px', 
                    background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', 
                    backgroundSize: '200% 100%', 
                    animation: 'skeletonShimmer 2s ease-in-out infinite' 
                  }}></div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ height: '1.5rem', width: '80%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '4px', marginBottom: '0.75rem' }}></div>
                    <div style={{ height: '1rem', width: '60%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                    <div style={{ height: '1rem', width: '40%', background: 'linear-gradient(90deg, rgba(9, 168, 107, 0.1) 0%, rgba(16, 119, 217, 0.15) 50%, rgba(9, 168, 107, 0.1) 100%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 2s ease-in-out infinite', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <style jsx>{`
          @keyframes skeletonShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
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
              {projects.map((project) => {
                // Ensure project has a valid ID
                const projectId = project.id || project._id || `project-${project.name?.toLowerCase().replace(/\s+/g, '-') || Math.random()}`;
                return (
                  <ProjectCard
                    key={projectId}
                    id={projectId}
                    name={project.name}
                    location={project.location}
                    year={project.year}
                    duration={project.duration}
                    image={project.image}
                    video={project.video}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

