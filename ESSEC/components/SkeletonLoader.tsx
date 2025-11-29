'use client'

import styles from './SkeletonLoader.module.css'

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'image' | 'circle' | 'grid'
  count?: number
  width?: string
  height?: string
  className?: string
}

export default function SkeletonLoader({
  type = 'text',
  count = 1,
  width,
  height,
  className = ''
}: SkeletonLoaderProps) {
  const getSkeletonClass = () => {
    switch (type) {
      case 'card':
        return styles.skeletonCard
      case 'image':
        return styles.skeletonImage
      case 'circle':
        return styles.skeletonCircle
      case 'grid':
        return styles.skeletonGrid
      default:
        return styles.skeletonText
    }
  }

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${getSkeletonClass()} ${className}`}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    />
  ))

  return <>{skeletons}</>
}



