'use client'

import Image, { ImageProps } from 'next/image'
import { useState, useEffect, useRef } from 'react'

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
 * - Prevents flickering by maintaining visibility once loaded
 */
export default function DefaultImage({ src, onError, onLoad, className, style, ...props }: ImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(getDefaultImage(src))
  const [hasErrored, setHasErrored] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const hasLoadedRef = useRef(false)

  // Update imageSrc when src prop changes (but only if we haven't errored)
  useEffect(() => {
    if (!hasErrored) {
      setImageSrc(getDefaultImage(src))
      // Reset loaded state when src changes
      if (hasLoadedRef.current) {
        setIsLoaded(false)
        hasLoadedRef.current = false
      }
    }
  }, [src, hasErrored])

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      setIsLoaded(true)
    }
    // Call the original onLoad handler if provided
    if (onLoad) {
      onLoad(e)
    }
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If the image fails to load and it's not already the default image, use the default
    if (imageSrc !== DEFAULT_IMAGE) {
      setHasErrored(true)
      setImageSrc(DEFAULT_IMAGE)
      // Reset loaded state when error occurs
      setIsLoaded(false)
      hasLoadedRef.current = false
    }
    // Call the original onError handler if provided
    if (onError) {
      onError(e)
    }
  }

  // Combine className with loaded state
  const combinedClassName = isLoaded 
    ? `${className || ''} image-loaded`.trim()
    : className

  // Combine styles
  const combinedStyle = {
    ...style,
    opacity: isLoaded ? 1 : (props.priority ? 1 : 0),
    transition: isLoaded ? 'opacity 0.3s ease-in-out' : 'none',
  }

  return (
    <Image
      {...props}
      src={imageSrc}
      onError={handleError}
      onLoad={handleLoad}
      className={combinedClassName}
      style={combinedStyle}
    />
  )
}

