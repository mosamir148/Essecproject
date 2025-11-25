'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import styles from './ScrollToTop.module.css'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`${styles.button} ${isVisible ? styles.buttonVisible : styles.buttonHidden}`}
      aria-label="Scroll to top"
    >
      <ArrowUp className={styles.icon} size={24} />
    </button>
  )
}

