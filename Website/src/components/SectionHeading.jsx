import React from 'react'

export default function SectionHeading({ eyebrow, title, subtitle, maxWidth = 620 }) {
  return (
    <div className="sv-reveal" style={{ textAlign: 'center', maxWidth, margin: '0 auto 52px' }}>
      <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: 999, border: '1px solid var(--border-hair-strong)', background: 'var(--bg-surface-2)', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.08em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 18 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 'clamp(2rem,3.2vw,2.6rem)', letterSpacing: '-0.01em', margin: '0 0 14px' }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{subtitle}</p>
      )}
    </div>
  )
}
