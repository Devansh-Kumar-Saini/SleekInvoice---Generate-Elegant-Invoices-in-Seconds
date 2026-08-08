import React from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { TESTIMONIALS } from '../data/content'
import { StarIcon, VerifiedIcon } from './Icons'

export default function Testimonials() {
  return (
    <section style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '100px 24px' }}>
      <SectionHeading eyebrow="Testimonials" title="Loved by people who hate busywork" maxWidth={600} />
      <Reveal delay={1} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
        {TESTIMONIALS.map((t) => (
          <div key={t.initials} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-hair)', borderRadius: 18, padding: 30 }}>
            <div style={{ display: 'flex', gap: 3, color: 'var(--blue-ink)', marginBottom: 16 }}>
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-primary)', margin: '0 0 22px' }}>{t.quote}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 18, borderTop: '1px solid var(--border-hair)' }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-surface-2)', border: '1px solid var(--border-hair-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--blue-ink)', flexShrink: 0 }}>
                {t.initials}
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.role} <VerifiedIcon />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Verified user</div>
              </div>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
