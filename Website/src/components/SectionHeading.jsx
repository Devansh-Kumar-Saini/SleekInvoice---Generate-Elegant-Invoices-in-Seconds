import React from 'react'
import Reveal from './Reveal'
import '../styles/SectionHeading.css'

export default function SectionHeading({ eyebrow, title, subtitle, maxWidth = 620 }) {
  return (
    <Reveal className="section-heading-wrapper" style={maxWidth ? { maxWidth } : undefined}>
      <div className="section-eyebrow">
        {eyebrow}
      </div>
      <h2 className="section-title">
        {title}
      </h2>
      {subtitle && (
        <p className="section-subtitle">{subtitle}</p>
      )}
    </Reveal>
  )
}
