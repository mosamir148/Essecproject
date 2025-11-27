'use client'

import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import styles from './page.module.css'

export default function ContactPage() {
  const { t, dir } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      alert(t('contact.form.successMessage'))
      setFormData({ name: '', email: '', phone: '', message: '' })
      setIsSubmitting(false)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className={styles.page} dir={dir}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {t('contact.title')}
            </h1>
            <p className={styles.heroSubtitle}>
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.contentGrid}>
            {/* Contact Form */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                {t('contact.form.title')}
              </h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder={t('contact.form.name')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder={t('contact.form.email')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.formLabel}>
                    {t('contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={t('contact.form.phone')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={styles.formTextarea}
                    placeholder={t('contact.form.message')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  <Send className={styles.submitButtonIcon} />
                  <span>{t('contact.form.send')}</span>
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className={styles.infoSection}>
              <div className={styles.infoCard}>
                <h2 className={styles.sectionTitle}>
                  {t('contact.info.title')}
                </h2>
                <div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrapper}>
                      <MapPin className={styles.infoIcon} />
                    </div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>
                        {t('contact.info.address')}
                      </div>
                      <div className={styles.infoValue}>
                        {t('contact.info.addressValue').split('\n').map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < t('contact.info.addressValue').split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrapper}>
                      <Phone className={styles.infoIcon} />
                    </div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>
                        {t('contact.info.phone')}
                      </div>
                      <div className={styles.infoValue}>
                        {t('contact.info.phoneValue').split('\n').map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < t('contact.info.phoneValue').split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIconWrapper}>
                      <Mail className={styles.infoIcon} />
                    </div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>
                        {t('contact.info.email')}
                      </div>
                      <div className={styles.infoValue}>
                        {t('contact.info.emailValue').split('\n').map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < t('contact.info.emailValue').split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.hoursCard}>
                <h3 className={styles.hoursTitle}>
                  {t('contact.hours.title')}
                </h3>
                <div className={styles.hoursList}>
                  <div className={styles.hoursItem}>
                    <span className={styles.hoursItemStrong}>{t('contact.hours.weekdays')}:</span> {t('contact.hours.weekdaysTime')}
                  </div>
                  <div className={styles.hoursItem}>
                    <span className={styles.hoursItemStrong}>{t('contact.hours.saturday')}:</span> {t('contact.hours.saturdayTime')}
                  </div>
                  <div className={styles.hoursItem}>
                    <span className={styles.hoursItemStrong}>{t('contact.hours.sunday')}:</span> {t('contact.hours.sundayTime')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

