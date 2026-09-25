import React from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { TEMPLATES } from '../data/content'
import '../styles/Templates.css'

export default function Templates() {
  return (
    <section id="templates" className="templates-section">
      <SectionHeading
        eyebrow="Templates"
        title="Pick a look, or make it yours"
        subtitle="5 layouts to start from, each with its own accent color you can swap to match your brand. Every template exports pixel-identical to what you see on screen."
        maxWidth={620}
      />
      <Reveal delay={1} className="templates-grid">
        {TEMPLATES.map((t) => (
          <div
            key={t.name}
            className={`template-card ${t.highlighted ? 'is-highlighted' : ''}`}
          >
            <div
              className={`template-preview ${t.bordered ? 'is-bordered' : ''}`}
              style={{ background: t.surface }}
            >
              <div className={`template-preview-bar-1 ${t.highlighted ? 'is-highlighted' : ''}`} />
              <div className="template-preview-bar-2" />
              <div className="template-preview-bar-3" />
              <div className="template-preview-accent" style={{ background: t.accent }} />
            </div>
            <div className="template-header">
              <h3 className="template-name">{t.name}</h3>
              {t.badge && (
                <span className="template-badge">{t.badge}</span>
              )}
            </div>
            <div className="template-custom-note">
              <span className="template-color-dot" style={{ background: t.accent }} />
              <span className="template-custom-text">Accent color customizable</span>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
