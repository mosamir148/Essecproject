'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import styles from './Footer.module.css'

export default function Footer() {
  const { t } = useLanguage()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which logo to use based on theme
  // Use resolvedTheme to handle 'system' theme, fallback to checking document class
  const isDarkMode = mounted && (resolvedTheme === 'dark' || (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')))
  const logoSrc = isDarkMode ? '/logo w.PNG' : '/logo.PNG'

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Company Info */}
          <div className={styles.companySection}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src={logoSrc}
                alt="ESSEC Solar Engineering Logo"
                width={200}
                height={70}
                className={styles.logoImage}
                priority
              />
            </Link>
            <h3 className={styles.companyTitle}>ESSEC Solar Engineering</h3>
            <p className={styles.companyDescription}>
              Leading provider of solar energy solutions, committed to sustainable and efficient renewable energy systems.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
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
            <h4 className={styles.sectionTitle}>{t('nav.contact')}</h4>
            <ul className={styles.contactList}>
              <li>Email: info@essec-solar.com</li>
              <li>Phone: +123 456 7890</li>
              <li>Address: Solar Energy District</li>
            </ul>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} ESSEC Solar Engineering. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

