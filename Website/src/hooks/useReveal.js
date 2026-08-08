import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-triggered reveal hook backed by IntersectionObserver.
 * Returns a ref to attach to the element and a boolean for visibility.
 * Once visible, stays visible (no re-hide on scroll back up).
 */
export function useReveal(options = {}) {
  const { threshold = 0.16, rootMargin = '0px 0px -8% 0px' } = options
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, visible]
}
