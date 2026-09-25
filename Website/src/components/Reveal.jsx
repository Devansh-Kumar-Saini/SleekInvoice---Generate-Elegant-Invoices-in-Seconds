import React, { useEffect, useRef } from 'react'

let sharedObserver
function getObserver() {
  if (!sharedObserver && typeof IntersectionObserver !== 'undefined') {
    sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          sharedObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })
  }
  return sharedObserver
}

export default function Reveal({ as: Tag = 'div', delay, className = '', style, children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = getObserver()
    if (!obs) {
      el.classList.add('is-visible')
      return
    }
    obs.observe(el)
    return () => obs.unobserve(el)
  }, [])

  const delayClass = delay ? ` reveal-d${delay}` : ''
  return (
    <Tag ref={ref} className={`reveal${delayClass}${className ? ` ${className}` : ''}`} style={style} {...rest}>
      {children}
    </Tag>
  )
}
