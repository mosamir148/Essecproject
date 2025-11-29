'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { api, auth } from '@/lib/api'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import DefaultImage from '@/components/DefaultImage'
import styles from './page.module.css'

interface TeamMemberFormData {
  name: string
  role: string
  bio: string
  profileImage: string
  socialLinks: {
    linkedin: string
    twitter: string
    facebook: string
    instagram: string
    website: string
  }
  cvUrl: string
}

export default function NewTeamMemberPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: '',
    role: '',
    bio: '',
    profileImage: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      website: '',
    },
    cvUrl: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [cvPreview, setCvPreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (formData.profileImage) {
      setImagePreview(formData.profileImage)
    } else {
      setImagePreview(null)
    }
  }, [formData.profileImage])

  useEffect(() => {
    if (formData.cvUrl) {
      setCvPreview(formData.cvUrl)
    } else {
      setCvPreview(null)
    }
  }, [formData.cvUrl])

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
    
    if (!formData.name.trim() || !formData.role.trim() || !formData.bio.trim()) {
      alert(t('admin.nameRoleBioRequired'))
      return
    }

    setSaving(true)

    try {
      await api.createTeamMember({
        name: formData.name.trim(),
        role: formData.role.trim(),
        bio: formData.bio.trim(),
        profileImage: formData.profileImage || undefined,
        socialLinks: Object.values(formData.socialLinks).some(v => v.trim()) 
          ? formData.socialLinks 
          : undefined,
        cvUrl: formData.cvUrl || undefined,
      })
      router.push('/admin-dashboard')
    } catch (err) {
      alert(err instanceof Error ? err.message : t('admin.failedToCreateTeamMember'))
    } finally {
      setSaving(false)
    }
  }

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, profileImage: url })
  }

  const handleCvUrlChange = (url: string) => {
    setFormData({ ...formData, cvUrl: url })
  }

  const triggerImageFileInput = () => {
    imageInputRef.current?.click()
  }

  const triggerCvFileInput = () => {
    cvInputRef.current?.click()
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
          setFormData({ ...formData, profileImage: result })
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

  const handleCvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Accept PDF and images
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      alert(t('admin.pleaseSelectPdfOrImage'))
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert(t('admin.cvFileTooLarge'))
      return
    }

    setUploadingCv(true)
    const reader = new FileReader()
    
    reader.onloadend = () => {
      try {
        const result = reader.result as string
        if (result) {
          setFormData({ ...formData, cvUrl: result })
          alert(t('admin.cvUploadedSuccess'))
        }
      } catch (error) {
        alert(t('admin.errorProcessingCv'))
      } finally {
        setUploadingCv(false)
        if (cvInputRef.current) {
          cvInputRef.current.value = ''
        }
      }
    }
    
    reader.onerror = () => {
      alert(t('admin.errorReadingCv'))
      setUploadingCv(false)
      if (cvInputRef.current) {
        cvInputRef.current.value = ''
      }
    }
    
    reader.readAsDataURL(file)
  }

  if (loading || !authenticated) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p>{t('admin.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container} dir={dir}>
      <div className={styles.header}>
        <button
          onClick={() => router.push('/admin-dashboard')}
          className={styles.backButton}
        >
          <ArrowLeft className={styles.backIcon} />
          {t('admin.backToDashboard')}
        </button>
        <h1 className={styles.title}>{t('admin.addNewTeamMember')}</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('admin.basicInformation')}</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t('admin.nameRequired')}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('admin.enterFullName')}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t('admin.roleJobTitle')}
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder={t('admin.rolePlaceholder')}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t('admin.shortBio')}
            </label>
            <textarea
              required
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder={t('admin.enterShortBio')}
              rows={5}
              className={styles.formTextarea}
            />
          </div>
        </div>

        {/* Profile Image */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('admin.profileImage')}</h2>
          <div className={styles.uploadSection}>
            <div className={styles.uploadInputGroup}>
              <input
                type="text"
                value={formData.profileImage}
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
                <DefaultImage
                  src={imagePreview}
                  alt={t('admin.profilePreview')}
                  width={200}
                  height={200}
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, profileImage: '' })
                    setImagePreview(null)
                  }}
                  className={styles.removeButton}
                >
                  <X className={styles.removeIcon} />
                  {t('admin.remove')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Social Media Links */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('admin.socialMediaLinks')}</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('admin.linkedin')}</label>
            <input
              type="url"
              value={formData.socialLinks.linkedin}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
              })}
              placeholder={t('admin.linkedinPlaceholder')}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('admin.twitter')}</label>
            <input
              type="url"
              value={formData.socialLinks.twitter}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, twitter: e.target.value }
              })}
              placeholder={t('admin.twitterPlaceholder')}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('admin.facebook')}</label>
            <input
              type="url"
              value={formData.socialLinks.facebook}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, facebook: e.target.value }
              })}
              placeholder={t('admin.facebookPlaceholder')}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('admin.instagram')}</label>
            <input
              type="url"
              value={formData.socialLinks.instagram}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, instagram: e.target.value }
              })}
              placeholder={t('admin.instagramPlaceholder')}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('admin.website')}</label>
            <input
              type="url"
              value={formData.socialLinks.website}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, website: e.target.value }
              })}
              placeholder={t('admin.websitePlaceholder')}
              className={styles.formInput}
            />
          </div>
        </div>

        {/* CV */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('admin.cvResume')}</h2>
          <div className={styles.uploadSection}>
            <div className={styles.uploadInputGroup}>
              <input
                type="text"
                value={formData.cvUrl}
                onChange={(e) => handleCvUrlChange(e.target.value)}
                placeholder={t('admin.cvUrlPlaceholder')}
                className={`${styles.formInput} ${styles.uploadInput}`}
              />
              <input
                type="file"
                ref={cvInputRef}
                accept=".pdf,image/jpeg,image/jpg,image/png"
                onChange={handleCvFileSelect}
                className={styles.hiddenInput}
              />
              <button
                type="button"
                onClick={triggerCvFileInput}
                disabled={uploadingCv}
                className={styles.uploadButton}
              >
                <Upload className={styles.uploadButtonIcon} />
                {uploadingCv ? t('admin.uploading') : t('admin.uploadCv')}
              </button>
            </div>
            {cvPreview && (
              <div className={styles.previewContainer}>
                <p className={styles.cvPreviewText}>
                  {t('admin.cvUploaded')} {cvPreview.substring(0, 50)}...
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, cvUrl: '' })
                    setCvPreview(null)
                  }}
                  className={styles.removeButton}
                >
                  <X className={styles.removeIcon} />
                  {t('admin.remove')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={saving}
            className={styles.submitButton}
          >
            <Save className={styles.buttonIcon} />
            {saving ? t('admin.saving') : t('admin.saveTeamMember')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin-dashboard')}
            className={styles.cancelButton}
          >
            {t('admin.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}

