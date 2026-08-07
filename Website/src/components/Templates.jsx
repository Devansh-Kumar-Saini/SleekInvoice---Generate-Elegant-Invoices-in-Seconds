import React from 'react'
import SectionHeading from './SectionHeading'
import { TEMPLATES } from '../data/content'

export default function Templates() {
  return (
    <section id="templates" style={{ scrollMarginTop: 84, position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '100px 24px' }}>
      <SectionHeading
        eyebrow="Templates"
        title="Pick a look, or make it yours"
        subtitle="Every template exports pixel-identical to what you see on screen."
        maxWidth={600}
      />
      <div className="sv-reveal sv-d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 20 }}>
        {TEMPLATES.map((t) => (
          <div
            key={t.name}
            className="template-card"
            style={{
              background: 'var(--bg-surface)',
              border: t.highlighted ? '1px solid var(--border-hair-strong)' : '1px solid var(--border-hair)',
              borderRadius: 18, padding: 20, transition: 'all .25s',
              boxShadow: t.highlighted ? 'var(--shadow-glow)' : 'none',
            }}
          >
            <div style={{ background: t.surface, border: t.bordered ? '1px solid var(--border-hair)' : 'none', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ height: 6, width: '55%', background: t.highlighted ? 'var(--amber-ink)' : 'var(--text-tertiary)', opacity: t.highlighted ? 1 : 0.5, borderRadius: 3, marginBottom: 10 }} />
              <div style={{ height: 5, width: '80%', background: 'var(--border-hair-strong)', borderRadius: 3, marginBottom: 6 }} />
              <div style={{ height: 5, width: '65%', background: 'var(--border-hair-strong)', borderRadius: 3, marginBottom: 14 }} />
              <div style={{ height: 7, width: '38%', background: t.accent, borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15.5, fontWeight: 600, margin: 0 }}>{t.name}</h3>
              {t.badge && (
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, letterSpacing: '.05em', color: 'var(--amber-ink)', textTransform: 'uppercase' }}>{t.badge}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
