import React from 'react'
import Reveal from './Reveal'
import '../styles/SectionHeading.css'

export default function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <Reveal className="section-heading-wrapper">
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
