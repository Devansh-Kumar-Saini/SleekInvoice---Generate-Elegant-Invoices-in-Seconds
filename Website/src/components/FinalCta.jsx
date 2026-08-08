import React from 'react'
import { ArrowRightIcon } from './Icons'
import Reveal from './Reveal'

export default function FinalCta() {
  return (
    <section style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '20px auto 100px', padding: '0 24px' }}>
      <Reveal style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--border-hair-strong)', borderRadius: 28, padding: '72px 40px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -140, left: '50%', transform: 'translateX(-50%)', width: 520, height: 320, background: 'var(--blue)', opacity: 0.16, filter: 'blur(110px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: 999, border: '1px solid var(--border-hair-strong)', background: 'var(--bg-surface-2)', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.08em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 22 }}>
            No Sign-Up Required
          </div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 'clamp(1.9rem,3.4vw,2.7rem)', letterSpacing: '-0.01em', margin: '0 0 30px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Ready to upgrade your invoicing experience?
          </h2>
          <a href="https://allfreeinvoice.vercel.app/" className="cta-final" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '16px 28px', borderRadius: 12, background: 'linear-gradient(135deg,var(--blue),var(--blue-soft))', color: '#F5F9FF', fontSize: 16, fontWeight: 600, textDecoration: 'none', boxShadow: 'var(--shadow-glow)', transition: 'transform .2s, box-shadow .2s' }}>
            Create Your First Invoice Free
            <ArrowRightIcon />
          </a>
        </div>
      </Reveal>
    </section>
  )
}
