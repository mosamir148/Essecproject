'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { api, auth } from '@/lib/api'
import { ArrowLeft, Save, Upload, X, Plus } from 'lucide-react'
import DefaultImage from '@/components/DefaultImage'
import styles from './page.module.css'

interface NewsFormData {
  title: string
  mainImage: string
  summary: string
  fullText: string
  additionalImages: string[]
  publicationDate: string
  displayOrder: number
}

export default function NewNewsPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    mainImage: '',
    summary: '',
    fullText: '',
    additionalImages: [],
    publicationDate: new Date().toISOString().split('T')[0],
    displayOrder: 0,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [additionalImageInput, setAdditionalImageInput] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const additionalImageInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAdditionalImage, setUploadingAdditionalImage] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (formData.mainImage) {
      setImagePreview(formData.mainImage)
    } else {
      setImagePreview(null)
    }
  }, [formData.mainImage])

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
      await api.createNews({
        title: formData.title,
        mainImage: formData.mainImage,
        summary: formData.summary,
        fullText: formData.fullText,
        additionalImages: formData.additionalImages,
        publicationDate: formData.publicationDate,
        displayOrder: formData.displayOrder,
      })
      router.push('/admin-dashboard')
    } catch (err) {
      alert(err instanceof Error ? err.message : t('admin.failedToCreateNews'))
    } finally {
      setSaving(false)
    }
  }

  const triggerImageFileInput = () => {
    imageInputRef.current?.click()
  }

  const triggerAdditionalImageFileInput = () => {
    additionalImageInputRef.current?.click()
  }

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, mainImage: url })
  }

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(t('admin.pleaseSelectImage'))
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert(t('admin.imageFileTooLarge'))
      return
    }

    setUploadingImage(true)
    const reader = new FileReader()
    
    reader.onloadend = () => {
      try {
        const result = reader.result as string
        if (result) {
          setFormData({ ...formData, mainImage: result })
          alert(t('admin.imageUploadedSuccess'))
        }
      } catch (error) {
        alert(t('admin.errorProcessingImage'))
      } finally {
        setUploadingImage(false)
        if (imageInputRef.current) {
          imageInputRef.current.value = ''
        }
      }
    }
    
    reader.onerror = () => {
      alert(t('admin.errorReadingImage'))
      setUploadingImage(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
    
    reader.readAsDataURL(file)
  }

  const handleAdditionalImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(t('admin.pleaseSelectImage'))
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert(t('admin.imageFileTooLarge'))
      return
    }

    setUploadingAdditionalImage(true)
    const reader = new FileReader()
    
    reader.onloadend = () => {
      try {
        const result = reader.result as string
        if (result) {
          setFormData({
            ...formData,
            additionalImages: [...formData.additionalImages, result],
          })
          setAdditionalImageInput('')
          alert(t('admin.imageUploadedSuccess'))
        }
      } catch (error) {
        alert(t('admin.errorProcessingImage'))
      } finally {
        setUploadingAdditionalImage(false)
        if (additionalImageInputRef.current) {
          additionalImageInputRef.current.value = ''
        }
      }
    }
    
    reader.onerror = () => {
      alert(t('admin.errorReadingImage'))
      setUploadingAdditionalImage(false)
      if (additionalImageInputRef.current) {
        additionalImageInputRef.current.value = ''
      }
    }
    
    reader.readAsDataURL(file)
  }

  const addAdditionalImage = () => {
    if (!additionalImageInput.trim()) return
    setFormData({
      ...formData,
      additionalImages: [...formData.additionalImages, additionalImageInput.trim()],
    })
    setAdditionalImageInput('')
  }

  const removeAdditionalImage = (index: number) => {
    const newArray = [...formData.additionalImages]
    newArray.splice(index, 1)
    setFormData({
      ...formData,
      additionalImages: newArray,
    })
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>{t('admin.loading')}</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            onClick={() => router.push('/admin-dashboard')}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} />
            {t('admin.backToDashboard')}
          </button>
          <h1 className={styles.title}>{t('admin.addNewNewsItem')}</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('admin.basicInformation')}</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('admin.title')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('admin.enterNewsTitle')}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('admin.publicationDateRequired')}
                </label>
                <input
                  type="date"
                  required
                  value={formData.publicationDate}
                  onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('admin.displayOrder')}
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('admin.summary')}</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {t('admin.summaryRequired')}
              </label>
              <textarea
                required
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder={t('admin.enterShortSummary')}
                rows={3}
                className={styles.formTextarea}
              />
            </div>
          </div>

          {/* Full Text */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('admin.fullText')}</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {t('admin.fullTextRequired')}
              </label>
              <textarea
                required
                value={formData.fullText}
                onChange={(e) => setFormData({ ...formData, fullText: e.target.value })}
                placeholder={t('admin.enterFullNewsText')}
                rows={15}
                className={styles.formTextarea}
              />
            </div>
          </div>

          {/* Main Image */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('admin.mainImage')}</h2>
            <div className={styles.uploadSection}>
              <div className={styles.uploadInputGroup}>
                <input
                  type="text"
                  required
                  value={formData.mainImage}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder={t('admin.imageUrlPlaceholder')}
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
                  {uploadingImage ? t('admin.uploading') : t('admin.uploadImage')}
                </button>
              </div>
              {imagePreview && (
                <div className={styles.previewContainer}>
                  <div className={styles.previewImageWrapper}>
                    <DefaultImage
                      src={imagePreview}
                      alt={t('admin.preview')}
                      fill
                      className={styles.previewImage}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('admin.additionalImages')}</h2>
            <div className={styles.uploadSection}>
              <div className={styles.uploadInputGroup}>
                <input
                  type="text"
                  value={additionalImageInput}
                  onChange={(e) => setAdditionalImageInput(e.target.value)}
                  placeholder={t('admin.imageUrlPlaceholder')}
                  className={`${styles.formInput} ${styles.uploadInput}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addAdditionalImage()
                    }
                  }}
                />
                <input
                  type="file"
                  ref={additionalImageInputRef}
                  accept="image/*"
                  onChange={handleAdditionalImageFileSelect}
                  className={styles.hiddenInput}
                />
                <button
                  type="button"
                  onClick={triggerAdditionalImageFileInput}
                  disabled={uploadingAdditionalImage}
                  className={styles.uploadButton}
                >
                  <Upload className={styles.uploadButtonIcon} />
                  {uploadingAdditionalImage ? t('admin.uploading') : t('admin.uploadImage')}
                </button>
                <button
                  type="button"
                  onClick={addAdditionalImage}
                  disabled={!additionalImageInput.trim()}
                  className={styles.addButton}
                >
                  <Plus className={styles.addButtonIcon} />
                  {t('admin.addUrl')}
                </button>
              </div>
              {formData.additionalImages.length > 0 && (
                <div className={styles.additionalImagesGrid}>
                  {formData.additionalImages.map((img, index) => (
                    <div key={index} className={styles.additionalImageItem}>
                      <div className={styles.additionalImageWrapper}>
                        <DefaultImage
                          src={img}
                          alt={`${t('admin.additional')} ${index + 1}`}
                          fill
                          className={styles.additionalImage}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className={styles.removeButton}
                      >
                        <X className={styles.removeButtonIcon} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={saving}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              <Save className={styles.buttonIcon} />
              {saving ? t('admin.saving') : t('admin.saveNewsItem')}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin-dashboard')}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              {t('admin.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}



