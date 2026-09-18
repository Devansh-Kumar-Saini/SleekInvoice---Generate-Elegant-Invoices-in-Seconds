import React from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { FAQS } from '../data/content'
import { ChevronDownIcon } from './Icons'

export default function Faqs() {
  return (
    <section id="faqs" style={{ scrollMarginTop: 84, position: 'relative', zIndex: 1, maxWidth: 840, margin: '0 auto', padding: '100px 24px' }}>
      <SectionHeading eyebrow="FAQ" title="Frequently asked questions" maxWidth={560} />
      <Reveal delay={1} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FAQS.map((faq) => (
          <details key={faq.q} className="faq-item" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-hair)', borderRadius: 14, overflow: 'hidden' }}>
            <summary
              style={{ width: '100%', textAlign: 'left', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)', fontSize: 15.5, fontWeight: 500, cursor: 'pointer', gap: 16, fontFamily: "'Inter',sans-serif", userSelect: 'none' }}
            >
              {faq.q}
              <span className="faq-chevron" style={{ flexShrink: 0, display: 'flex', color: 'var(--text-tertiary)', transition: 'transform .25s' }}>
                <ChevronDownIcon />
              </span>
            </summary>
            <div style={{ padding: '0 24px 22px', color: 'var(--text-secondary)', fontSize: 14.5, lineHeight: 1.65 }}>
              {faq.a}
            </div>
          </details>
        ))}
      </Reveal>
    </section>
  )
}
