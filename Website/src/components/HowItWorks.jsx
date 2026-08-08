import React from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { HOW_IT_WORKS } from '../data/content'

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ scrollMarginTop: 84, position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '100px 24px' }}>
      <SectionHeading eyebrow="How It Works" title="From blank page to paid, in three steps" maxWidth={600} />
      <Reveal delay={1} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
        {HOW_IT_WORKS.map((step) => (
          <div key={step.num} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-hair)', borderRadius: 18, padding: 32 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 34, fontWeight: 700, color: 'var(--blue-ink)', opacity: 0.85, marginBottom: 14 }}>{step.num}</div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>{step.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{step.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
