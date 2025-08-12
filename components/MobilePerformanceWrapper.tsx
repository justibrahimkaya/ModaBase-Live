'use client'

import { useEffect } from 'react'

export default function MobilePerformanceWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useEffect(() => {
    // Lazy load non-critical images
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-lazy]')
      images.forEach(img => {
        img.setAttribute('loading', 'lazy')
      })
    }

    // Prevent touch delay on mobile
    if ('ontouchstart' in window) {
      document.documentElement.style.touchAction = 'manipulation'
    }

    // Optimize scroll performance
    let ticking = false
    function updateScrollPosition() {
      ticking = false
      // Add scroll-based optimizations here if needed
    }

    function requestTick() {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollPosition)
        ticking = true
      }
    }

    window.addEventListener('scroll', requestTick, { passive: true })

    return () => {
      window.removeEventListener('scroll', requestTick)
    }
  }, [])

  return (
    <>
      {/* Preconnect to critical domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      
      {children}
    </>
  )
}
