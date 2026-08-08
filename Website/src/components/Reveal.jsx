import React from 'react'
import { useReveal } from '../hooks/useReveal'

/**
 * Wraps children in a scroll-triggered fade/slide-up reveal.
 * Pass `as` to change the wrapper element, `delay` (1|2|3) to stagger,
 * and `className`/`style` are merged onto the wrapper.
 */
export default function Reveal({ as: Tag = 'div', delay, className = '', style, children, ...rest }) {
  const [ref, visible] = useReveal()
  const delayClass = delay ? ` reveal-d${delay}` : ''
  const classes = `reveal${delayClass}${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`

  return (
    <Tag ref={ref} className={classes} style={style} {...rest}>
      {children}
    </Tag>
  )
}
