import { useCallback, useRef } from 'react'

/**
 * Hook that throttles a callback function to limit how often it can be called
 * @param callback - The function to throttle
 * @param delay - The delay in milliseconds
 * @returns A throttled version of the callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallTime = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastCallTime.current >= delay) {
        lastCallTime.current = now
        return callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallTime.current = Date.now()
          callback(...args)
        }, delay - (now - lastCallTime.current))
      }
    },
    [callback, delay]
  ) as T

  return throttledCallback
}
