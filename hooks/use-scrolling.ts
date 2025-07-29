import { useEffect, useState } from 'react'

/**
 * Hook that tracks scrolling state
 * @param threshold - The scroll threshold to consider as "scrolling" (default: 5)
 * @returns Boolean indicating if the user is currently scrolling
 */
export function useScrolling(threshold: number = 5): boolean {
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let lastScrollTop = 0

    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop

      // Check if scroll position changed significantly
      if (Math.abs(currentScrollTop - lastScrollTop) > threshold) {
        setIsScrolling(true)
        lastScrollTop = currentScrollTop

        // Clear existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // Set scrolling to false after a delay
        timeoutId = setTimeout(() => {
          setIsScrolling(false)
        }, 150)
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [threshold])

  return isScrolling
}
