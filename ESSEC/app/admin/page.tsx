'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { api, auth } from '@/lib/api'
import { Project } from '@/data/projects'
import { Plus, Edit, Trash2, Eye, LogOut, X } from 'lucide-react'
import styles from './admin.module.css'

export default function AdminDashboard() {
  const router = useRouter()
  const { t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = auth.getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const data = await api.getCurrentAdmin()
      setAdminInfo(data.admin)
      setAuthenticated(true)
      loadProjects()
    } catch (err) {
      auth.removeToken()
      router.push('/admin/login')
    }
  }

  const handleLogout = () => {
    api.logout()
    router.push('/admin/login')
  }

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getProjects()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) {
      return
    }

    try {
      await api.deleteProject(id)
      await loadProjects()
    } catch (err) {
      alert(err instanceof Error ? err.message : t('admin.error'))
    }
  }

  const handleEdit = (project: Project) => {
    router.push(`/admin/projects/${project.id}/edit`)
  }

  const handleAddNew = () => {
    router.push('/admin/projects/new')
  }

  if (!authenticated || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>{t('admin.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{t('admin.dashboard')}</h1>
            <p className={styles.subtitle}>
              {t('admin.manageProjects')}
              {adminInfo && (
                <span className={styles.subtitleSpan}>
                  - {t('admin.loggedInAs')} <span className={styles.subtitleBold}>{adminInfo.name || adminInfo.email}</span>
                </span>
              )}
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={handleAddNew}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              <Plus className={styles.buttonIcon} />
              {t('admin.addNewProject')}
            </button>
            <button
              onClick={handleLogout}
              className={`${styles.button} ${styles.buttonDanger}`}
            >
              <LogOut className={styles.buttonIcon} />
              {t('admin.logout')}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Projects Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr className={styles.tableRow}>
                  <th className={`${styles.tableHeader}`}>
                    {t('admin.projectName')}
                  </th>
                  <th className={styles.tableHeader}>
                    {t('admin.location')}
                  </th>
                  <th className={styles.tableHeader}>
                    {t('admin.year')}
                  </th>
                  <th className={styles.tableHeader}>
                    {t('admin.duration')}
                  </th>
                  <th className={`${styles.tableHeader} ${styles.tableHeaderRight}`}>
                    {t('admin.view')} / {t('admin.edit')} / {t('admin.delete')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr className={styles.tableRow}>
                    <td colSpan={5} className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                      {t('admin.noProjects')}
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellName}`}>
                        {project.name}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellText}`}>
                        {project.location}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellText}`}>
                        {project.year}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellText}`}>
                        {project.duration}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                        <div className={styles.tableActions}>
                          <button
                            onClick={() => setViewingProject(project)}
                            className={`${styles.actionButton} ${styles.actionButtonBlue}`}
                            title={t('admin.view')}
                          >
                            <Eye className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => handleEdit(project)}
                            className={`${styles.actionButton} ${styles.actionButtonGreen}`}
                            title={t('admin.edit')}
                          >
                            <Edit className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className={`${styles.actionButton} ${styles.actionButtonRed}`}
                            title={t('admin.delete')}
                          >
                            <Trash2 className={styles.actionIcon} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Project Modal */}
        {viewingProject && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalBody}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>{viewingProject.name}</h2>
                  <button
                    onClick={() => setViewingProject(null)}
                    className={styles.modalCloseButton}
                  >
                    <X className={styles.modalCloseIcon} />
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.modalField}>
                    <strong className={styles.modalFieldLabel}>Location:</strong>{' '}
                    <span className={styles.modalFieldValue}>{viewingProject.location}</span>
                  </div>
                  <div className={styles.modalField}>
                    <strong className={styles.modalFieldLabel}>Year:</strong>{' '}
                    <span className={styles.modalFieldValue}>{viewingProject.year}</span>
                  </div>
                  <div className={styles.modalField}>
                    <strong className={styles.modalFieldLabel}>Duration:</strong>{' '}
                    <span className={styles.modalFieldValue}>{viewingProject.duration}</span>
                  </div>
                  <div className={styles.modalField}>
                    <strong className={styles.modalFieldLabel}>Description:</strong>
                    <p className={styles.modalFieldValue}>{viewingProject.description}</p>
                  </div>
                  {viewingProject.challenges.length > 0 && (
                    <div className={styles.modalField}>
                      <strong className={styles.modalFieldLabel}>Challenges:</strong>
                      <ul className={styles.modalList}>
                        {viewingProject.challenges.map((challenge, idx) => (
                          <li key={idx}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewingProject.executionMethods.length > 0 && (
                    <div className={styles.modalField}>
                      <strong className={styles.modalFieldLabel}>Execution Methods:</strong>
                      <ul className={styles.modalList}>
                        {viewingProject.executionMethods.map((method, idx) => (
                          <li key={idx}>{method}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewingProject.results.length > 0 && (
                    <div className={styles.modalField}>
                      <strong className={styles.modalFieldLabel}>Results:</strong>
                      <ul className={styles.modalList}>
                        {viewingProject.results.map((result, idx) => (
                          <li key={idx}>{result}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewingProject.technicalNotes && (
                    <div className={styles.modalField}>
                      <strong className={styles.modalFieldLabel}>Technical Notes:</strong>
                      <p className={styles.modalFieldValue}>{viewingProject.technicalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

