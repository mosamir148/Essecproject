'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { api, auth } from '@/lib/api'
import { Project } from '@/data/projects'
import { ArrowLeft, Save, X, Plus, Upload } from 'lucide-react'
import DefaultImage from '@/components/DefaultImage'
import styles from './page.module.css'

export default function NewProjectPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    location: '',
    year: new Date().getFullYear(),
    duration: '',
    image: '',
    video: '',
    description: '',
    challenges: [],
    executionMethods: [],
    results: [],
    technicalNotes: '',
    gallery: [],
  })
  const [challengeInput, setChallengeInput] = useState('')
  const [methodInput, setMethodInput] = useState('')
  const [resultInput, setResultInput] = useState('')
  const [galleryInput, setGalleryInput] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (formData.image) {
      setImagePreview(formData.image)
    } else {
      setImagePreview(null)
    }
  }, [formData.image])

  useEffect(() => {
    if (formData.video) {
      setVideoPreview(formData.video)
    } else {
      setVideoPreview(null)
    }
  }, [formData.video])

  const checkAuth = async () => {
    const token = auth.getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      await api.getCurrentAdmin()
      setAuthenticated(true)
    } catch (err) {
      auth.removeToken()
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.createProject(formData as Omit<Project, 'id'>)
      router.push('/admin')
    } catch (err) {
      alert(err instanceof Error ? err.message : t('admin.error'))
    } finally {
      setSaving(false)
    }
  }

  const addArrayItem = (field: 'challenges' | 'executionMethods' | 'results' | 'gallery', value: string) => {
    if (!value.trim()) return
    setFormData({
      ...formData,
      [field]: [...(formData[field] as string[]), value.trim()],
    })
    if (field === 'challenges') setChallengeInput('')
    if (field === 'executionMethods') setMethodInput('')
    if (field === 'results') setResultInput('')
    if (field === 'gallery') setGalleryInput('')
  }

  const removeArrayItem = (field: 'challenges' | 'executionMethods' | 'results' | 'gallery', index: number) => {
    const newArray = [...(formData[field] as string[])]
    newArray.splice(index, 1)
    setFormData({
      ...formData,
      [field]: newArray,
    })
  }

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image: url })
  }

  const handleVideoUrlChange = (url: string) => {
    setFormData({ ...formData, video: url })
  }

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Check file size (limit to 10MB for base64 conversion)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('Image file is too large. Please use a file smaller than 10MB or upload via URL instead.')
      return
    }

    setUploadingImage(true)
    const reader = new FileReader()
    
    try {
      reader.onloadend = () => {
        try {
          const result = reader.result as string
          if (result) {
            handleImageUrlChange(result)
          }
        } catch (error) {
          console.error('Error processing image:', error)
          alert('Error processing image file. Please try a smaller file or use a URL instead.')
        } finally {
          setUploadingImage(false)
        }
      }
      reader.onerror = () => {
        alert('Error reading image file. Please try a smaller file or use a URL instead.')
        setUploadingImage(false)
      }
      reader.onabort = () => {
        alert('Image upload was cancelled.')
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error reading image file:', error)
      alert('Error reading image file. Please try a smaller file or use a URL instead.')
      setUploadingImage(false)
    }
  }

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's a video
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file')
      return
    }

    // Check file size (limit to 50MB for base64 conversion)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      alert('Video file is too large. Please use a file smaller than 50MB or upload via URL instead.')
      return
    }

    setUploadingVideo(true)
    const reader = new FileReader()
    
    try {
      reader.onloadend = () => {
        try {
          const result = reader.result as string
          if (result) {
            handleVideoUrlChange(result)
          }
        } catch (error) {
          console.error('Error processing video:', error)
          alert('Error processing video file. Please try a smaller file or use a URL instead.')
        } finally {
          setUploadingVideo(false)
        }
      }
      reader.onerror = () => {
        alert('Error reading video file. Please try a smaller file or use a URL instead.')
        setUploadingVideo(false)
      }
      reader.onabort = () => {
        alert('Video upload was cancelled.')
        setUploadingVideo(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error reading video file:', error)
      alert('Error reading video file. Please try a smaller file or use a URL instead.')
      setUploadingVideo(false)
    }
  }

  const triggerImageFileInput = () => {
    imageInputRef.current?.click()
  }

  const triggerVideoFileInput = () => {
    videoInputRef.current?.click()
  }

  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingGallery(true)

    try {
      const newGalleryImages: string[] = []
      const maxSize = 10 * 1024 * 1024 // 10MB per image

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
          alert(`File "${file.name}" is not an image. Skipping.`)
          continue
        }

        // Check file size
        if (file.size > maxSize) {
          alert(`Image "${file.name}" is too large (max 10MB). Skipping.`)
          continue
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            try {
              const result = reader.result as string
              if (result) {
                resolve(result)
              } else {
                reject(new Error('Failed to read file'))
              }
            } catch (error) {
              reject(error)
            }
          }
          reader.onerror = () => reject(new Error('Error reading file'))
          reader.readAsDataURL(file)
        })

        newGalleryImages.push(base64)
      }

      // Add all new images to gallery
      if (newGalleryImages.length > 0) {
        setFormData({
          ...formData,
          gallery: [...(formData.gallery || []), ...newGalleryImages],
        })
        alert(`Successfully added ${newGalleryImages.length} image(s) to gallery`)
      }
    } catch (error) {
      console.error('Error processing gallery images:', error)
      alert('Error processing gallery images. Please try again.')
    } finally {
      setUploadingGallery(false)
      // Reset input so same files can be selected again
      if (galleryInputRef.current) {
        galleryInputRef.current.value = ''
      }
    }
  }

  const triggerGalleryFileInput = () => {
    galleryInputRef.current?.click()
  }

  if (loading || !authenticated) {
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
    <div className={styles.page} dir={dir}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button
            onClick={() => router.push('/admin')}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backButtonIcon} />
          </button>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{t('admin.createProject')}</h1>
            <p className={styles.subtitle}>{t('admin.manageProjects')}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.form}>
            {/* Basic Information Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('admin.basicInfo') || 'Basic Information'}</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('admin.projectName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('admin.location')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('admin.year')} *
                  </label>
                  <input
                    type="number"
                    required
                    min="2000"
                    max="2100"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('admin.duration')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 12 months"
                    className={styles.formInput}
                  />
                </div>
              </div>
            </div>

            {/* Image URL with Preview */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('admin.imageUrl')} *</h2>
              <div className={styles.uploadSection}>
                <div className={styles.uploadInputGroup}>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg or upload from PC"
                    className={`${styles.formInput} ${styles.uploadInput}`}
                  />
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className={styles.hiddenInput}
                  />
                  <button
                    type="button"
                    onClick={triggerImageFileInput}
                    disabled={uploadingImage}
                    className={styles.uploadButton}
                  >
                    <Upload className={styles.uploadButtonIcon} />
                    {uploadingImage ? t('admin.loading') : t('admin.uploadImage')}
                  </button>
                </div>
                {imagePreview && (
                  <div className={styles.previewContainer}>
                    <DefaultImage
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: '' })
                        setImagePreview(null)
                      }}
                      className={styles.removeButton}
                    >
                      <X className={styles.removeButtonIcon} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Video URL with Preview */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('admin.videoUrl')}</h2>
              <div className={styles.uploadSection}>
                <div className={styles.uploadInputGroup}>
                  <input
                    type="text"
                    value={formData.video || ''}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://example.com/video.mp4 or upload from PC"
                    className={`${styles.formInput} ${styles.uploadInput}`}
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
                    {uploadingVideo ? t('admin.loading') : t('admin.uploadVideo')}
                  </button>
                </div>
                {videoPreview && (
                  <div className={styles.previewContainer}>
                    <video
                      src={videoPreview}
                      controls
                      className={styles.previewVideo}
                      onError={(e) => {
                        console.error('Video preview error:', e)
                        setVideoPreview(null)
                        alert('Error loading video preview. The video may be too large. Please use a URL instead.')
                      }}
                      onLoadStart={() => {
                        // Video is starting to load
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, video: '' })
                        setVideoPreview(null)
                      }}
                      className={styles.removeButton}
                    >
                      <X className={styles.removeButtonIcon} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('admin.description')} *</h2>
              <div className={styles.formGroup}>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={styles.formTextarea}
                />
              </div>
            </div>

            {/* Challenges */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('admin.challenges')}</h2>
              <div className={styles.arraySection}>
                <div className={styles.arrayInputGroup}>
                  <input
                    type="text"
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayItem('challenges', challengeInput)
                      }
                    }}
                    placeholder={t('admin.addChallenge')}
                    className={`${styles.formInput} ${styles.arrayInput}`}
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('challenges', challengeInput)}
                    className={styles.arrayAddButton}
                  >
                    <Plus className={styles.arrayAddButtonIcon} />
                  </button>
                </div>
                <div className={styles.arrayItems}>
                  {(formData.challenges || []).map((challenge, idx) => (
                    <span
                      key={idx}
                      className={`${styles.arrayItem} ${styles.arrayItemBlue}`}
                    >
                      {challenge}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('challenges', idx)}
                        className={styles.arrayItemRemove}
                      >
                        <X className={styles.arrayItemRemoveIcon} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Execution Methods */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('admin.executionMethods')}</h2>
              <div className={styles.arraySection}>
                <div className={styles.arrayInputGroup}>
                  <input
                    type="text"
                    value={methodInput}
                    onChange={(e) => setMethodInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayItem('executionMethods', methodInput)
                      }
                    }}
                    placeholder={t('admin.addMethod')}
                    className={`${styles.formInput} ${styles.arrayInput}`}
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('executionMethods', methodInput)}
                    className={styles.arrayAddButton}
                  >
                    <Plus className={styles.arrayAddButtonIcon} />
                  </button>
                </div>
                <div className={styles.arrayItems}>
                  {(formData.executionMethods || []).map((method, idx) => (
                    <span
                      key={idx}
                      className={`${styles.arrayItem} ${styles.arrayItemGreen}`}
                    >
                      {method}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('executionMethods', idx)}
                        className={styles.arrayItemRemove}
                      >
                        <X className={styles.arrayItemRemoveIcon} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('admin.results')}</h2>
              <div className={styles.arraySection}>
                <div className={styles.arrayInputGroup}>
                  <input
                    type="text"
                    value={resultInput}
                    onChange={(e) => setResultInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayItem('results', resultInput)
                      }
                    }}
                    placeholder={t('admin.addResult')}
                    className={`${styles.formInput} ${styles.arrayInput}`}
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('results', resultInput)}
                    className={styles.arrayAddButton}
                  >
                    <Plus className={styles.arrayAddButtonIcon} />
                  </button>
                </div>
                <div className={styles.arrayItems}>
                  {(formData.results || []).map((result, idx) => (
                    <span
                      key={idx}
                      className={`${styles.arrayItem} ${styles.arrayItemPurple}`}
                    >
                      {result}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('results', idx)}
                        className={styles.arrayItemRemove}
                      >
                        <X className={styles.arrayItemRemoveIcon} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Notes */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('admin.technicalNotes')}</h2>
              <div className={styles.formGroup}>
                <textarea
                  rows={4}
                  value={formData.technicalNotes || ''}
                  onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
                  className={styles.formTextarea}
                />
              </div>
            </div>

            {/* Gallery */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('admin.gallery')}</h2>
              <div className={styles.arraySection}>
                <div className={styles.uploadInputGroup}>
                  <input
                    type="text"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayItem('gallery', galleryInput)
                      }
                    }}
                    placeholder="Image URL or upload multiple images"
                    className={`${styles.formInput} ${styles.uploadInput}`}
                  />
                  <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFileSelect}
                    className={styles.hiddenInput}
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('gallery', galleryInput)}
                    className={styles.arrayAddButton}
                    disabled={!galleryInput.trim()}
                  >
                    <Plus className={styles.arrayAddButtonIcon} />
                  </button>
                  <button
                    type="button"
                    onClick={triggerGalleryFileInput}
                    disabled={uploadingGallery}
                    className={styles.uploadButton}
                  >
                    <Upload className={styles.uploadButtonIcon} />
                    {uploadingGallery ? t('admin.loading') : 'Upload Images'}
                  </button>
                </div>
                
                {/* Gallery Images Grid */}
                {(formData.gallery || []).length > 0 && (
                  <div className={styles.galleryGrid}>
                    {(formData.gallery || []).map((url, idx) => (
                      <div key={idx} className={styles.galleryItem}>
                        <div className={styles.galleryPreview}>
                          <DefaultImage
                            src={url}
                            alt={`Gallery image ${idx + 1}`}
                            fill
                            className={styles.galleryPreviewImage}
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('gallery', idx)}
                            className={styles.galleryRemoveButton}
                          >
                            <X className={styles.removeButtonIcon} />
                          </button>
                        </div>
                        <div className={styles.galleryItemLabel}>Image {idx + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actionsSection}>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className={`${styles.actionButton} ${styles.actionButtonCancel}`}
              >
                {t('admin.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`${styles.actionButton} ${styles.actionButtonSave}`}
              >
                <Save className={styles.actionButtonIcon} />
                {saving ? t('admin.loading') : t('admin.save')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

