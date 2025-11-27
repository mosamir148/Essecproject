'use client'

import Image, { ImageProps } from 'next/image'
import { useState, useEffect } from 'react'

const DEFAULT_IMAGE = '/all.png'

/**
 * Utility function to get the default image if the provided image is empty/null/undefined
 */
export function getDefaultImage(src: string | undefined | null): string {
  if (!src || src.trim() === '') {
    return DEFAULT_IMAGE
  }
  return src
}

/**
 * Wrapper component for Next.js Image that automatically uses a default image
 * if no image is provided or if the image fails to load.
 * 
 * Logic:
 * - If src is empty/null/undefined → use default image
 * - If src is provided but fails to load → fallback to default image
 * - If src is provided and loads successfully → keep the original
 */
export default function DefaultImage({ src, onError, ...props }: ImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(getDefaultImage(src))
  const [hasErrored, setHasErrored] = useState(false)

  // Update imageSrc when src prop changes (but only if we haven't errored)
  useEffect(() => {
    if (!hasErrored) {
      setImageSrc(getDefaultImage(src))
    }
  }, [src, hasErrored])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If the image fails to load and it's not already the default image, use the default
    if (imageSrc !== DEFAULT_IMAGE) {
      setHasErrored(true)
      setImageSrc(DEFAULT_IMAGE)
    }
    // Call the original onError handler if provided
    if (onError) {
      onError(e)
    }
  }

  return (
    <Image
      {...props}
      src={imageSrc}
      onError={handleError}
    />
  )
}

