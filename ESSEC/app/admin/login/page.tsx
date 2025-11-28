'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import DefaultImage from '@/components/DefaultImage'
import { api, auth } from '@/lib/api'
import { Lock, Mail, User, LogIn, AlertCircle } from 'lucide-react'
import styles from './login.module.css'

export default function AdminLogin() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if already logged in
    if (auth.getToken()) {
      router.push('/admin-dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }

    if (!formData.password.trim()) {
      setError('Password is required')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!isLogin && !formData.name.trim()) {
      setError('Name is required for registration')
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        const result = await api.login(formData.email.trim(), formData.password)
        if (result.token) {
          // Clear form on success
          setFormData({ email: '', password: '', name: '' })
          router.push('/admin-dashboard')
        }
      } else {
        const result = await api.register(
          formData.email.trim(),
          formData.password,
          formData.name.trim()
        )
        if (result.token) {
          // Clear form on success
          setFormData({ email: '', password: '', name: '' })
          router.push('/admin-dashboard')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      // Clear password on error for security
      setFormData(prev => ({ ...prev, password: '' }))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  if (!mounted) return null

  const isDarkMode = resolvedTheme === 'dark' || (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))
  const logoSrc = isDarkMode ? '/logo w.PNG' : '/logo.PNG'

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            <DefaultImage
              src={logoSrc}
              alt="ESSEC Logo"
              width={200}
              height={70}
              className={styles.logoImage}
              priority
            />
          </div>
        </div>

        {/* Card Container */}
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>
              {isLogin ? 'Admin Login' : 'Create Admin Account'}
            </h2>
            <p className={styles.subtitle}>
              {isLogin
                ? 'Sign in to access the admin dashboard'
                : 'Create a new admin account to get started'}
            </p>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle className={styles.errorIcon} />
                <p className={styles.errorText}>{error}</p>
              </div>
            )}

            {/* Name Field (Registration only) */}
            {!isLogin && (
              <div className={styles.fieldGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <div className={styles.iconContainer}>
                    <User className={styles.icon} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className={styles.input}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.iconContainer}>
                  <Mail className={styles.icon} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={styles.input}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>
                Password <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.iconContainer}>
                  <Lock className={styles.icon} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={styles.input}
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>
              {!isLogin && (
                <p className={styles.helpText}>
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className={styles.buttonContainer}>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <LogIn className={styles.buttonIcon} />
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Toggle Login/Register */}
            <div className={styles.toggleSection}>
           {/*   <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                  setFormData({ email: '', password: '', name: '' })
                }}
                disabled={loading}
                className={styles.toggleButton}
              >
                {isLogin
                  ? "Don't have an account? Create one"
                  : 'Already have an account? Sign in'}
              </button>*/}
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className={styles.footer}>
          Secure admin access • ESSEC Solar Engineering
        </p>
      </div>
    </div>
  )
}

