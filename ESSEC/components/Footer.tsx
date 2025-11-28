'use client'

import Link from 'next/link'
import DefaultImage from '@/components/DefaultImage'
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import styles from './Footer.module.css'

export default function Footer() {
  const { t, dir } = useLanguage()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update isDarkMode when resolvedTheme changes
  useEffect(() => {
    if (mounted) {
      const checkDarkMode = () => {
        const dark = resolvedTheme === 'dark' || 
                    (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
        setIsDarkMode(dark)
      }
      checkDarkMode()
      
      // Also listen for DOM changes in case the class is updated asynchronously
      const observer = new MutationObserver(checkDarkMode)
      if (typeof document !== 'undefined') {
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class']
        })
      }
      
      return () => observer.disconnect()
    }
  }, [mounted, resolvedTheme])

  // Determine which logo to use based on theme
  const logoSrc = isDarkMode ? '/logo w.PNG' : '/logo.PNG'

  return (
    <footer className={styles.footer} dir={dir}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Company Info */}
          <div className={styles.companySection}>
            <Link href="/" className={styles.logoLink}>
              <DefaultImage
                src={logoSrc}
                alt={t('footer.logoAlt')}
                width={200}
                height={70}
                className={styles.logoImage}
                priority
              />
            </Link>
            <h3 className={styles.companyTitle}>{t('footer.companyName')}</h3>
            <p className={styles.companyDescription}>
              {t('footer.companyDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.sectionTitle}>{t('footer.quickLinks')}</h4>
            <ul className={styles.linksList}>
              <li>
                <Link href="/" className={styles.link}>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.link}>
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href="/solar" className={styles.link}>
                  {t('nav.solar')}
                </Link>
              </li>
              <li>
                <Link href="/projects" className={styles.link}>
                  {t('nav.projects')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={styles.sectionTitle}>{t('footer.contact')}</h4>
            <ul className={styles.contactList}>
              <li>
                <span className={styles.contactLabel}>{t('footer.email')}: </span>
                {t('footer.emailValue')}
              </li>
              <li>
                <span className={styles.contactLabel}>{t('footer.phone')}: </span>
                {t('footer.phoneValue')}
              </li>
              <li>
                <span className={styles.contactLabel}>{t('footer.address')}: </span>
                {t('footer.addressValue')}
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} {t('footer.companyName')}. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

