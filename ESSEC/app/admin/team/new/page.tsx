'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
      alert('Name, role, and bio are required')
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
      alert(err instanceof Error ? err.message : 'Failed to create team member')
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
      alert('Please select an image file')
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('Image file is too large. Please use a file smaller than 10MB or upload via URL instead.')
      return
    }

    setUploadingImage(true)
    const reader = new FileReader()
    
    reader.onloadend = () => {
      try {
        const result = reader.result as string
        if (result) {
          setFormData({ ...formData, profileImage: result })
          alert('Image uploaded successfully!')
        }
      } catch (error) {
        alert('Error processing image file')
      } finally {
        setUploadingImage(false)
        if (imageInputRef.current) {
          imageInputRef.current.value = ''
        }
      }
    }
    
    reader.onerror = () => {
      alert('Error reading image file')
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
      alert('Please select a PDF or image file (JPG, PNG)')
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('CV file is too large. Please use a file smaller than 10MB or upload via URL instead.')
      return
    }

    setUploadingCv(true)
    const reader = new FileReader()
    
    reader.onloadend = () => {
      try {
        const result = reader.result as string
        if (result) {
          setFormData({ ...formData, cvUrl: result })
          alert('CV uploaded successfully!')
        }
      } catch (error) {
        alert('Error processing CV file')
      } finally {
        setUploadingCv(false)
        if (cvInputRef.current) {
          cvInputRef.current.value = ''
        }
      }
    }
    
    reader.onerror = () => {
      alert('Error reading CV file')
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
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={() => router.push('/admin-dashboard')}
          className={styles.backButton}
        >
          <ArrowLeft className={styles.backIcon} />
          Back to Dashboard
        </button>
        <h1 className={styles.title}>Add New Team Member</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Role / Job Title *
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Senior Solar Engineer"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Short Bio *
            </label>
            <textarea
              required
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Enter a short biography"
              rows={5}
              className={styles.formTextarea}
            />
          </div>
        </div>

        {/* Profile Image */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile Image</h2>
          <div className={styles.uploadSection}>
            <div className={styles.uploadInputGroup}>
              <input
                type="text"
                value={formData.profileImage}
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
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
            {imagePreview && (
              <div className={styles.previewContainer}>
                <DefaultImage
                  src={imagePreview}
                  alt="Profile preview"
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
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Social Media Links */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Social Media Links (Optional)</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>LinkedIn</label>
            <input
              type="url"
              value={formData.socialLinks.linkedin}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
              })}
              placeholder="https://linkedin.com/in/username"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Twitter</label>
            <input
              type="url"
              value={formData.socialLinks.twitter}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, twitter: e.target.value }
              })}
              placeholder="https://twitter.com/username"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Facebook</label>
            <input
              type="url"
              value={formData.socialLinks.facebook}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, facebook: e.target.value }
              })}
              placeholder="https://facebook.com/username"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Instagram</label>
            <input
              type="url"
              value={formData.socialLinks.instagram}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, instagram: e.target.value }
              })}
              placeholder="https://instagram.com/username"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Website</label>
            <input
              type="url"
              value={formData.socialLinks.website}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, website: e.target.value }
              })}
              placeholder="https://example.com"
              className={styles.formInput}
            />
          </div>
        </div>

        {/* CV */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>CV / Resume (Optional)</h2>
          <div className={styles.uploadSection}>
            <div className={styles.uploadInputGroup}>
              <input
                type="text"
                value={formData.cvUrl}
                onChange={(e) => handleCvUrlChange(e.target.value)}
                placeholder="https://example.com/cv.pdf or upload PDF/image"
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
                {uploadingCv ? 'Uploading...' : 'Upload CV'}
              </button>
            </div>
            {cvPreview && (
              <div className={styles.previewContainer}>
                <p className={styles.cvPreviewText}>
                  CV uploaded: {cvPreview.substring(0, 50)}...
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
                  Remove
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
            {saving ? 'Saving...' : 'Save Team Member'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin-dashboard')}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

