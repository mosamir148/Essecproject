'use client'

import Image, { ImageProps, StaticImageData } from 'next/image'
import { useState, useEffect, useRef } from 'react'

const DEFAULT_IMAGE = '/all.png'

/**
 * Type for image source that matches Next.js Image src prop type
 */
type ImageSource = ImageProps['src']

/**
 * Extracts the string path from an image source
 */
function getImagePath(src: ImageSource): string {
  if (!src) {
    return DEFAULT_IMAGE
  }
  
  // If it's a string, validate it
  if (typeof src === 'string') {
    if (src.trim() === '') {
      return DEFAULT_IMAGE
    }
    return src
  }
  
  // If it's a StaticImageData object, extract the src property
  if (typeof src === 'object' && 'src' in src) {
    const srcString = src.src
    if (!srcString || (typeof srcString === 'string' && srcString.trim() === '')) {
      return DEFAULT_IMAGE
    }
    return srcString
  }
  
  // If it's a StaticRequire object (has default property), extract from default
  if (typeof src === 'object' && src !== null && 'default' in src) {
    const defaultSrc = (src as { default: unknown }).default
    if (typeof defaultSrc === 'string') {
      return defaultSrc.trim() === '' ? DEFAULT_IMAGE : defaultSrc
    }
    if (typeof defaultSrc === 'object' && defaultSrc !== null && 'src' in defaultSrc) {
      const srcString = (defaultSrc as { src: unknown }).src
      if (typeof srcString === 'string') {
        return srcString.trim() === '' ? DEFAULT_IMAGE : srcString
      }
    }
  }
  
  return DEFAULT_IMAGE
}

/**
 * Utility function to get the default image if the provided image is empty/null/undefined
 * Returns the original src if valid, or DEFAULT_IMAGE if invalid
 */
export function getDefaultImage(src: ImageSource): ImageSource {
  if (!src) {
    return DEFAULT_IMAGE
  }
  
  // If it's a string, validate it
  if (typeof src === 'string') {
    if (src.trim() === '') {
      return DEFAULT_IMAGE
    }
    return src
  }
  
  // If it's a StaticImageData object, return it as-is (it's valid)
  if (typeof src === 'object' && 'src' in src) {
    const srcString = src.src
    if (!srcString || (typeof srcString === 'string' && srcString.trim() === '')) {
      return DEFAULT_IMAGE
    }
    return src
  }
  
  // If it's a StaticRequire object (has default property), return the default
  if (typeof src === 'object' && src !== null && 'default' in src) {
    const defaultSrc = (src as { default: unknown }).default
    if (typeof defaultSrc === 'string') {
      return defaultSrc.trim() === '' ? DEFAULT_IMAGE : defaultSrc
    }
    if (typeof defaultSrc === 'object' && defaultSrc !== null && 'src' in defaultSrc) {
      const srcString = (defaultSrc as { src: unknown }).src
      if (typeof srcString === 'string' && srcString.trim() !== '') {
        return defaultSrc as StaticImageData
      }
      return DEFAULT_IMAGE
    }
    // If default is a valid StaticImageData, return it
    if (typeof defaultSrc === 'object' && defaultSrc !== null) {
      return defaultSrc as StaticImageData
    }
  }
  
  return DEFAULT_IMAGE
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
 * - Supports both string paths and StaticImageData (imported images)
 */
export default function DefaultImage({ src, onError, onLoad, className, style, ...props }: ImageProps) {
  const [imageSrc, setImageSrc] = useState<ImageSource>(getDefaultImage(src))
  const [currentPath, setCurrentPath] = useState<string>(getImagePath(src))
  const [hasErrored, setHasErrored] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const hasLoadedRef = useRef(false)

  // Update imageSrc when src prop changes (but only if we haven't errored)
  useEffect(() => {
    if (!hasErrored) {
      const newSrc = getDefaultImage(src)
      setImageSrc(newSrc)
      setCurrentPath(getImagePath(newSrc))
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
    if (currentPath !== DEFAULT_IMAGE) {
      setHasErrored(true)
      setImageSrc(DEFAULT_IMAGE)
      setCurrentPath(DEFAULT_IMAGE)
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

