'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { api, auth } from '@/lib/api'
import { Project } from '@/data/projects'
import { Plus, Edit, Trash2, Eye, LogOut, X, Video, Check, Upload, Home, FolderPlus, Menu, Users, Newspaper } from 'lucide-react'
import styles from './admin-dashboard.module.css'

interface HomepageVideo {
  id: string
  videoUrl: string
  title?: string
  subtitle?: string
  isActive: boolean
}

interface NewsItem {
  id: string
  title: string
  mainImage: string
  summary: string
  fullText: string
  additionalImages: string[]
  publicationDate: string
  displayOrder: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [homepageVideos, setHomepageVideos] = useState<HomepageVideo[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [editingVideo, setEditingVideo] = useState<HomepageVideo | null>(null)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [videoFormData, setVideoFormData] = useState({
    videoUrl: '',
    title: '',
    subtitle: '',
    isActive: true
  })
  const [activeSection, setActiveSection] = useState<'homepage' | 'projects' | 'team' | 'news'>('homepage')
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
      loadHomepageVideos()
      loadTeamMembers()
      loadNews()
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
    if (activeSection === 'projects') {
      router.push('/admin/projects/new')
    } else if (activeSection === 'team') {
      router.push('/admin/team/new')
    } else if (activeSection === 'news') {
      router.push('/admin/news/new')
    }
  }

  const loadTeamMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getTeamMembers()
      setTeamMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) {
      return
    }

    try {
      await api.deleteTeamMember(id)
      await loadTeamMembers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete team member')
    }
  }

  const handleEditTeamMember = (member: any) => {
    router.push(`/admin/team/${member.id}/edit`)
  }

  const loadNews = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getNews('displayOrder')
      setNewsItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) {
      return
    }

    try {
      await api.deleteNews(id)
      await loadNews()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete news item')
    }
  }

  const handleEditNews = (news: NewsItem) => {
    router.push(`/admin/news/${news.id}/edit`)
  }

  const loadHomepageVideos = async () => {
    try {
      const videos = await api.getHomepageVideos()
      setHomepageVideos(videos)
    } catch (err) {
      console.error('Failed to load homepage videos:', err)
    }
  }

  const handleAddVideo = () => {
    setEditingVideo(null)
    setShowVideoForm(true)
    setSelectedVideoFile(null)
    setVideoFormData({
      videoUrl: '',
      title: '',
      subtitle: '',
      isActive: true
    })
  }

  const handleEditVideo = (video: HomepageVideo) => {
    setEditingVideo(video)
    setShowVideoForm(true)
    setSelectedVideoFile(null)
    setVideoFormData({
      videoUrl: video.videoUrl,
      title: video.title || '',
      subtitle: video.subtitle || '',
      isActive: video.isActive
    })
  }

  const handleSaveVideo = async () => {
    // Check if either file or URL is provided
    if (!selectedVideoFile && !videoFormData.videoUrl.trim()) {
      alert('Please provide a video file or video URL')
      return
    }

    try {
      setUploadingVideo(true)
      
      const videoData: any = {
        title: videoFormData.title,
        subtitle: videoFormData.subtitle,
        isActive: videoFormData.isActive
      }

      // If a file is selected, send it; otherwise send the URL
      if (selectedVideoFile) {
        videoData.videoFile = selectedVideoFile
      } else {
        videoData.videoUrl = videoFormData.videoUrl.trim()
      }

      if (editingVideo) {
        await api.updateHomepageVideo(editingVideo.id, videoData)
      } else {
        await api.createHomepageVideo(videoData)
      }
      await loadHomepageVideos()
      
      // Trigger homepage refresh by setting a flag in localStorage
      // This will cause the homepage to reload the video
      if (typeof window !== 'undefined') {
        localStorage.setItem('homepage_video_updated', Date.now().toString())
        // Also dispatch a custom event
        window.dispatchEvent(new Event('homepage_video_updated'))
      }
      
      setEditingVideo(null)
      setShowVideoForm(false)
      setSelectedVideoFile(null)
      setVideoFormData({
        videoUrl: '',
        title: '',
        subtitle: '',
        isActive: true
      })
      
      alert('Video saved successfully! The homepage will update shortly.')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save video')
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return
    }

    try {
      await api.deleteHomepageVideo(id)
      await loadHomepageVideos()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete video')
    }
  }

  const handleSetActiveVideo = async (id: string) => {
    try {
      await api.updateHomepageVideo(id, { isActive: true })
      await loadHomepageVideos()
      
      // Trigger homepage refresh
      if (typeof window !== 'undefined') {
        localStorage.setItem('homepage_video_updated', Date.now().toString())
        window.dispatchEvent(new Event('homepage_video_updated'))
      }
      
      alert('Video set as active! The homepage will update shortly.')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to set active video')
    }
  }

  const triggerVideoFileInput = () => {
    videoInputRef.current?.click()
  }

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's a video
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file')
      // Reset input
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
      return
    }

    // Check file size - 100MB limit (backend limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      alert(
        `Video file is too large (${fileSizeMB}MB).\n\n` +
        `Maximum file size is 100MB.\n\n` +
        `Please:\n` +
        `1. Compress the video to under 100MB\n` +
        `2. Upload the video to a hosting service and use the URL instead\n` +
        `3. Use a smaller video file`
      )
      // Reset input
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
      return
    }

    // Store the file directly - no need for FileReader
    setSelectedVideoFile(file)
    // Clear the URL field when a file is selected
    setVideoFormData({ ...videoFormData, videoUrl: '' })
    alert(`Video file selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)\n\nClick "Save Video" to upload.`)
    
    // Reset input so same file can be selected again if needed
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
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
      <div className={styles.dashboardLayout}>
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className={styles.sidebarOverlay}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}
        
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <div className={styles.sidebarHeader}>
            {sidebarOpen && <h2 className={styles.sidebarTitle}>Admin Panel</h2>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={styles.sidebarToggle}
              aria-label="Toggle sidebar"
            >
              <Menu className={styles.sidebarToggleIcon} />
            </button>
          </div>
          
          <nav className={styles.sidebarNav}>
            <button
              onClick={() => {
                setActiveSection('homepage')
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false)
                }
              }}
              className={`${styles.sidebarItem} ${activeSection === 'homepage' ? styles.sidebarItemActive : ''}`}
            >
              <Home className={styles.sidebarItemIcon} />
              {sidebarOpen && <span>Homepage Management</span>}
            </button>
            
            <button
              onClick={() => {
                setActiveSection('projects')
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false)
                }
              }}
              className={`${styles.sidebarItem} ${activeSection === 'projects' ? styles.sidebarItemActive : ''}`}
            >
              <FolderPlus className={styles.sidebarItemIcon} />
              {sidebarOpen && <span>Projects</span>}
            </button>
            
            <button
              onClick={() => {
                setActiveSection('team')
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false)
                }
              }}
              className={`${styles.sidebarItem} ${activeSection === 'team' ? styles.sidebarItemActive : ''}`}
            >
              <Users className={styles.sidebarItemIcon} />
              {sidebarOpen && <span>Team Members</span>}
            </button>
            
            <button
              onClick={() => {
                setActiveSection('news')
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false)
                }
              }}
              className={`${styles.sidebarItem} ${activeSection === 'news' ? styles.sidebarItemActive : ''}`}
            >
              <Newspaper className={styles.sidebarItemIcon} />
              {sidebarOpen && <span>News</span>}
            </button>
          </nav>
          
          <div className={styles.sidebarFooter}>
            <button
              onClick={handleLogout}
              className={styles.sidebarItem}
            >
              <LogOut className={styles.sidebarItemIcon} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Mobile Menu Button */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className={styles.mobileMenuButton}
              aria-label="Open sidebar"
            >
              <Menu className={styles.mobileMenuIcon} />
            </button>
          )}
          <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h1 className={styles.title}>
                  {activeSection === 'homepage' ? 'Homepage Management' : activeSection === 'projects' ? 'Projects Management' : activeSection === 'team' ? 'Team Management' : 'News Management'}
                </h1>
                <p className={styles.subtitle}>
                  {activeSection === 'homepage' 
                    ? 'Manage homepage video and content'
                    : activeSection === 'projects'
                    ? t('admin.manageProjects')
                    : activeSection === 'team'
                    ? 'Manage team members'
                    : 'Manage news items'}
                  {adminInfo && (
                    <span className={styles.subtitleSpan}>
                      - {t('admin.loggedInAs')} <span className={styles.subtitleBold}>{adminInfo.name || adminInfo.email}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Conditional Content Based on Active Section */}
            {activeSection === 'homepage' && (
              <>
                {/* Homepage Video Management Section */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <Video className={styles.sectionIcon} />
                      Homepage Video Management
                    </h2>
                    <button
                      onClick={handleAddVideo}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      <Plus className={styles.buttonIcon} />
                      Add New Video
                    </button>
                  </div>

                  {/* Video Form */}
                  {showVideoForm && (
                    <div className={styles.videoForm}>
                      <h3 className={styles.formTitle}>
                        {editingVideo ? 'Edit Video' : 'Add New Video'}
                      </h3>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Video URL or File *</label>
                        <div className={styles.uploadInputGroup}>
                          <input
                            type="text"
                            value={videoFormData.videoUrl}
                            onChange={(e) => {
                              setVideoFormData({ ...videoFormData, videoUrl: e.target.value })
                              // Clear selected file when URL is entered
                              if (e.target.value.trim()) {
                                setSelectedVideoFile(null)
                              }
                            }}
                            disabled={!!selectedVideoFile}
                            className={`${styles.formInput} ${styles.uploadInput}`}
                            placeholder={selectedVideoFile ? "File selected - clear file to enter URL" : "/video.mp4 or https://example.com/video.mp4 (or upload file up to 100MB)"}
                          />
                          <input
                            type="file"
                            ref={videoInputRef}
                            accept="video/*"
                            onChange={handleVideoFileSelect}
                            className={styles.hiddenInput}
                          />
                          <button
                            type="button"
                            onClick={triggerVideoFileInput}
                            disabled={uploadingVideo}
                            className={`${styles.uploadButton} ${styles.uploadButtonPurple}`}
                          >
                            <Upload className={styles.uploadButtonIcon} />
                            {uploadingVideo ? 'Uploading...' : 'Select Video File'}
                          </button>
                        </div>
                        {selectedVideoFile && (
                          <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(147, 51, 234, 0.1)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                            <strong>Selected file:</strong> {selectedVideoFile.name} ({(selectedVideoFile.size / (1024 * 1024)).toFixed(2)}MB)
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVideoFile(null)
                                if (videoInputRef.current) {
                                  videoInputRef.current.value = ''
                                }
                              }}
                              style={{ marginLeft: '1rem', color: 'rgb(147, 51, 234)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Title (optional)</label>
                        <input
                          type="text"
                          value={videoFormData.title}
                          onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                          className={styles.formInput}
                          placeholder="Video title"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Subtitle (optional)</label>
                        <input
                          type="text"
                          value={videoFormData.subtitle}
                          onChange={(e) => setVideoFormData({ ...videoFormData, subtitle: e.target.value })}
                          className={styles.formInput}
                          placeholder="Video subtitle"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formCheckboxLabel}>
                          <input
                            type="checkbox"
                            checked={videoFormData.isActive}
                            onChange={(e) => setVideoFormData({ ...videoFormData, isActive: e.target.checked })}
                            className={styles.formCheckbox}
                          />
                          Set as active video (will replace current active video)
                        </label>
                      </div>
                      <div className={styles.formActions}>
                        <button
                          onClick={handleSaveVideo}
                          className={`${styles.button} ${styles.buttonPrimary}`}
                        >
                          <Check className={styles.buttonIcon} />
                          {editingVideo ? 'Update Video' : 'Add Video'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingVideo(null)
                            setShowVideoForm(false)
                            setSelectedVideoFile(null)
                            setVideoFormData({
                              videoUrl: '',
                              title: '',
                              subtitle: '',
                              isActive: true
                            })
                          }}
                          className={`${styles.button} ${styles.buttonSecondary}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Videos List */}
                  <div className={styles.videosList}>
                    {homepageVideos.length === 0 ? (
                      <div className={styles.emptyState}>
                        <Video className={styles.emptyIcon} />
                        <p>No videos added yet. Click "Add New Video" to get started.</p>
                      </div>
                    ) : (
                      <div className={styles.videosGrid}>
                        {homepageVideos.map((video) => (
                          <div
                            key={video.id || `video-${video.videoUrl}`}
                            className={`${styles.videoCard} ${video.isActive ? styles.videoCardActive : ''}`}
                          >
                            <div className={styles.videoCardHeader}>
                              <div className={styles.videoCardInfo}>
                                {video.isActive && (
                                  <span className={styles.activeBadge}>Active</span>
                                )}
                                <h4 className={styles.videoCardTitle}>
                                  {video.title || 'Untitled Video'}
                                </h4>
                              </div>
                              <div className={styles.videoCardActions}>
                                {!video.isActive && (
                                  <button
                                    onClick={() => handleSetActiveVideo(video.id)}
                                    className={`${styles.actionButton} ${styles.actionButtonGreen}`}
                                    title="Set as Active"
                                  >
                                    <Check className={styles.actionIcon} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditVideo(video)}
                                  className={`${styles.actionButton} ${styles.actionButtonBlue}`}
                                  title="Edit"
                                >
                                  <Edit className={styles.actionIcon} />
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(video.id)}
                                  className={`${styles.actionButton} ${styles.actionButtonRed}`}
                                  title="Delete"
                                >
                                  <Trash2 className={styles.actionIcon} />
                                </button>
                              </div>
                            </div>
                            <div className={styles.videoCardBody}>
                              <p className={styles.videoCardUrl}>{video.videoUrl}</p>
                              {video.subtitle && (
                                <p className={styles.videoCardSubtitle}>{video.subtitle}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeSection === 'team' && (
              <>
                {/* Team Members Header with Add Button */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <Users className={styles.sectionIcon} />
                      Team Members Management
                    </h2>
                    <button
                      onClick={handleAddNew}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      <Plus className={styles.buttonIcon} />
                      Add New Team Member
                    </button>
                  </div>
                </div>

                {/* Team Members Table */}
                <div className={styles.tableContainer}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.tableHead}>
                        <tr className={styles.tableRow}>
                          <th className={styles.tableHeader}>
                            Name
                          </th>
                          <th className={styles.tableHeader}>
                            Role
                          </th>
                          <th className={styles.tableHeader}>
                            Display Order
                          </th>
                          <th className={`${styles.tableHeader} ${styles.tableHeaderRight}`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.length === 0 ? (
                          <tr key="empty-team" className={styles.tableRow}>
                            <td colSpan={4} className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                              No team members added yet. Click "Add New Team Member" to get started.
                            </td>
                          </tr>
                        ) : (
                          teamMembers.map((member) => (
                            <tr key={member.id || `member-${member.name}`} className={styles.tableRow}>
                              <td className={`${styles.tableCell} ${styles.tableCellName}`}>
                                {member.name}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellText}`}>
                                {member.role}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellText}`}>
                                {member.displayOrder}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                                <div className={styles.tableActions}>
                                  <button
                                    onClick={() => handleEditTeamMember(member)}
                                    className={`${styles.actionButton} ${styles.actionButtonGreen}`}
                                    title="Edit"
                                  >
                                    <Edit className={styles.actionIcon} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTeamMember(member.id)}
                                    className={`${styles.actionButton} ${styles.actionButtonRed}`}
                                    title="Delete"
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
              </>
            )}

            {activeSection === 'projects' && (
              <>
                {/* Projects Header with Add Button */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <FolderPlus className={styles.sectionIcon} />
                      Projects Management
                    </h2>
                    <button
                      onClick={handleAddNew}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      <Plus className={styles.buttonIcon} />
                      {t('admin.addNewProject')}
                    </button>
                  </div>
                </div>

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
                          <tr key="empty-projects" className={styles.tableRow}>
                            <td colSpan={5} className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                              {t('admin.noProjects')}
                            </td>
                          </tr>
                        ) : (
                          projects.map((project) => (
                            <tr key={project.id || `project-${project.name}`} className={styles.tableRow}>
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
              </>
            )}

            {activeSection === 'news' && (
              <>
                {/* News Header with Add Button */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <Newspaper className={styles.sectionIcon} />
                      News Management
                    </h2>
                    <button
                      onClick={handleAddNew}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      <Plus className={styles.buttonIcon} />
                      Add New News
                    </button>
                  </div>
                </div>

                {/* News Table */}
                <div className={styles.tableContainer}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.tableHead}>
                        <tr className={styles.tableRow}>
                          <th className={styles.tableHeader}>
                            Title
                          </th>
                          <th className={styles.tableHeader}>
                            Publication Date
                          </th>
                          <th className={styles.tableHeader}>
                            Display Order
                          </th>
                          <th className={`${styles.tableHeader} ${styles.tableHeaderRight}`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {newsItems.length === 0 ? (
                          <tr key="empty-news" className={styles.tableRow}>
                            <td colSpan={4} className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                              No news items added yet. Click "Add New News" to get started.
                            </td>
                          </tr>
                        ) : (
                          newsItems.map((news) => (
                            <tr key={news.id || `news-${news.title}`} className={styles.tableRow}>
                              <td className={`${styles.tableCell} ${styles.tableCellName}`}>
                                {news.title}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellText}`}>
                                {new Date(news.publicationDate).toLocaleDateString()}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellText}`}>
                                {news.displayOrder}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                                <div className={styles.tableActions}>
                                  <button
                                    onClick={() => handleEditNews(news)}
                                    className={`${styles.actionButton} ${styles.actionButtonGreen}`}
                                    title="Edit"
                                  >
                                    <Edit className={styles.actionIcon} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNews(news.id)}
                                    className={`${styles.actionButton} ${styles.actionButtonRed}`}
                                    title="Delete"
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
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

