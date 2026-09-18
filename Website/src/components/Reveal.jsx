import React, { useEffect, useRef, useState } from 'react'

export default function Reveal({ as: Tag = 'div', delay, className = '', style, children, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const delayClass = delay ? ` reveal-d${delay}` : ''
  const classes = `reveal${delayClass}${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`

  return (
    <Tag ref={ref} className={classes} style={style} {...rest}>
      {children}
    </Tag>
  )
}
