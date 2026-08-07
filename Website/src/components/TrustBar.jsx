import React from 'react'
import { TRUSTED_LOGOS } from '../data/content'

export default function TrustBar() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '36px 24px', borderTop: '1px solid var(--border-hair)', borderBottom: '1px solid var(--border-hair)' }}>
      <p className="sv-reveal" style={{ textAlign: 'center', fontSize: 12.5, letterSpacing: '.05em', color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', margin: '0 0 26px' }}>
        Trusted by 25,000+ freelancers, developers, and agency founders worldwide
      </p>
      <div className="sv-reveal sv-d1" style={{ display: 'flex', justifyContent: 'center', gap: 44, flexWrap: 'wrap', maxWidth: 1000, margin: '0 auto' }}>
        {TRUSTED_LOGOS.map((logo) => (
          <span key={logo} className="trust-logo" style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: '.03em', color: 'var(--text-tertiary)', opacity: 0.7, transition: 'all .25s', cursor: 'default' }}>
            {logo}
          </span>
        ))}
      </div>
    </section>
  )
}
