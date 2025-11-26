'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { Menu, X, Sun, Moon, Globe } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { t, language, setLanguage, dir } = useLanguage()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const isHomePage = pathname === '/'

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'about', href: '/about' },
    { key: 'solar', href: '/solar' },
    { key: 'services', href: '/services' },
    { key: 'projects', href: '/projects' },
    { key: 'contact', href: '/contact' },
  ]

  const languages = [
    { code: 'en' as const, name: 'EN', flag: '🇬🇧' },
    { code: 'ar' as const, name: 'AR', flag: '🇸🇦' },
    { code: 'fr' as const, name: 'FR', flag: '🇫🇷' },
  ]

  if (!mounted) return null

  // Determine navbar classes based on page and scroll state
  const getNavbarClasses = () => {
    if (isHomePage) {
      // On home page: transparent when not scrolled, background when scrolled
      return scrolled ? styles.navbarScrolledHome : styles.navbarTransparent
    } else {
      // On other pages: normal behavior
      return scrolled ? styles.navbarScrolled : styles.navbarNotScrolled
    }
  }

  // Determine which logo to use based on theme
  // Use resolvedTheme to handle 'system' theme, fallback to checking document class
  const isDarkMode = resolvedTheme === 'dark' || document.documentElement.classList.contains('dark')

  return (
    <nav className={`${styles.navbar} ${getNavbarClasses()}`}>
      <div className={styles.container}>
        <div className={styles.navbarContent}>
          {/* Logo */}
          <Link href="/" className={styles.logoLink}>
            {isHomePage && !scrolled ? (
              // On home page with transparent navbar, always use white logo
              <Image
                src="/logo w.PNG"
                alt="ESSEC Logo"
                width={180}
                height={64}
                className={styles.logoImage}
                priority
              />
            ) : isDarkMode ? (
              <Image
                src="/logo w.PNG"
                alt="ESSEC Logo"
                width={180}
                height={64}
                className={styles.logoImage}
                priority
              />
            ) : (
              <Image
                src="/logo.PNG"
                alt="ESSEC Logo"
                width={180}
                height={64}
                className={styles.logoImage}
                priority
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav}>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : styles.navLinkInactive}`}
                >
                  <span className={`${styles.navLinkBackground} ${isActive ? styles.navLinkBackgroundActive : styles.navLinkBackgroundInactive}`} />
                  <span className={styles.navLinkText}>{t(`nav.${item.key}`)}</span>
                </Link>
              )
            })}
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            {/* Language Switcher */}
            <div className={styles.languageSwitcher}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`${styles.languageButton} ${language === lang.code ? styles.languageButtonActive : styles.languageButtonInactive}`}
                  title={`Switch to ${lang.name}`}
                >
                  <span className={styles.languageFlag}>{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={styles.themeButton}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={styles.mobileMenuButton}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileNavItems}>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : styles.mobileNavLinkInactive}`}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                )
              })}
            </div>
            <div className={styles.mobileLanguageSection}>
              <div className={styles.mobileLanguageHeader}>
                <span className={styles.mobileLanguageTitle}>
                  <Globe size={16} className={styles.mobileLanguageIcon} />
                  Language
                </span>
              </div>
              <div className={styles.mobileLanguageButtons}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code)
                      setMobileMenuOpen(false)
                    }}
                    className={`${styles.mobileLanguageButton} ${language === lang.code ? styles.mobileLanguageButtonActive : styles.mobileLanguageButtonInactive}`}
                  >
                    <span className={styles.mobileLanguageFlag}>{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

