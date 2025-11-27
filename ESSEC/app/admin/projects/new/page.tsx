'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from 'next-themes'
import { api, auth } from '@/lib/api'
import { Project } from '@/data/projects'
import { ArrowLeft, Save, X, Plus, Image as ImageIcon, Video, Upload, Eye } from 'lucide-react'
import DefaultImage from '@/components/DefaultImage'

export default function NewProjectPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const { theme } = useTheme()
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

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

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('admin.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.createProject')}</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{t('admin.manageProjects')}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.projectName')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.location')} *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.year')} *
              </label>
              <input
                type="number"
                required
                min="2000"
                max="2100"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.duration')} *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 12 months"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Image URL with Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.imageUrl')} *
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg or upload from PC"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerImageFileInput}
                disabled={uploadingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {uploadingImage ? t('admin.loading') : t('admin.uploadImage')}
              </button>
            </div>
            {imagePreview && (
              <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <DefaultImage
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, image: '' })
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Video URL with Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.videoUrl')}
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.video || ''}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="https://example.com/video.mp4 or upload from PC"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerVideoFileInput}
                disabled={uploadingVideo}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {uploadingVideo ? t('admin.loading') : t('admin.uploadVideo')}
              </button>
            </div>
            {videoPreview && (
              <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-black">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full"
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
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.description')} *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Challenges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.challenges')}
            </label>
            <div className="flex gap-2 mb-2">
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
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => addArrayItem('challenges', challengeInput)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.challenges || []).map((challenge, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2"
                >
                  {challenge}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('challenges', idx)}
                    className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Execution Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.executionMethods')}
            </label>
            <div className="flex gap-2 mb-2">
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
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => addArrayItem('executionMethods', methodInput)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.executionMethods || []).map((method, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center gap-2"
                >
                  {method}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('executionMethods', idx)}
                    className="text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Results */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.results')}
            </label>
            <div className="flex gap-2 mb-2">
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
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => addArrayItem('results', resultInput)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.results || []).map((result, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm flex items-center gap-2"
                >
                  {result}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('results', idx)}
                    className="text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Technical Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.technicalNotes')}
            </label>
            <textarea
              rows={3}
              value={formData.technicalNotes || ''}
              onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.gallery')}
            </label>
            <div className="flex gap-2 mb-2">
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
                placeholder={t('admin.addGalleryImage')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => addArrayItem('gallery', galleryInput)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.gallery || []).map((url, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm flex items-center gap-2"
                >
                  Image {idx + 1}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('gallery', idx)}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('admin.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? t('admin.loading') : t('admin.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

