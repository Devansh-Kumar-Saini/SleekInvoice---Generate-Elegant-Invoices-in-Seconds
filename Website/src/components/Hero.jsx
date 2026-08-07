import React from 'react'
import { ForgeMark, BoltIcon, ArrowRightIcon, PlayIcon, DocIcon } from './Icons'

export default function Hero() {
  return (
    <section style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '88px 24px 72px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(400px,1fr))', gap: 56, alignItems: 'center' }}>
      <div className="fade-up">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 999, border: '1px solid var(--border-hair-strong)', background: 'var(--bg-surface-2)', width: 'fit-content', marginBottom: 24 }}>
          <BoltIcon />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: '.05em', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            GENERATE ELEGANT INVOICES IN SECONDS
          </span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulseDot 2s infinite', flexShrink: 0 }} />
        </div>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 'clamp(2.3rem,4.4vw,3.9rem)', lineHeight: 1.06, letterSpacing: '-0.02em', margin: '0 0 22px', color: 'var(--text-primary)' }}>
          Professional Invoices.<br />Effortlessly Built.<br /><span style={{ color: 'var(--amber-ink)' }}>Instantly Paid.</span>
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 0 34px' }}>
          The fastest invoice builder for freelancers, consultants, and teams. No login required, automatic tax math, and instant client-ready PDF downloads.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <a href="#try-it" className="btn-primary" style={{ padding: '16px 26px', borderRadius: 12, background: 'linear-gradient(135deg,var(--amber),var(--amber-soft))', color: '#1A1206', fontSize: 16, fontWeight: 600, textDecoration: 'none', boxShadow: 'var(--shadow-glow)', display: 'inline-flex', alignItems: 'center', gap: 9, transition: 'transform .2s' }}>
            Generate Free Invoice
            <ArrowRightIcon />
          </a>
          <a href="#how-it-works" className="btn-outline" style={{ padding: '16px 24px', borderRadius: 12, border: '1px solid var(--border-hair-strong)', color: 'var(--text-primary)', fontSize: 16, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border-hair-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PlayIcon />
            </span>
            Watch 1-Min Tour
          </a>
        </div>
      </div>

      <div style={{ perspective: 1400, position: 'relative' }} className="fade-up-slow">
        <div style={{ animation: 'floatY 6s ease-in-out infinite', transform: 'rotateX(6deg) rotateY(-8deg)', transformStyle: 'preserve-3d', background: 'var(--bg-surface)', border: '1px solid var(--border-hair-strong)', borderRadius: 20, boxShadow: 'var(--shadow-card)', padding: 28, position: 'relative', maxWidth: 440, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,var(--amber),var(--amber-soft))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ForgeMark size={11} />
              </span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: 'var(--text-tertiary)', letterSpacing: '.04em' }}>INV-2024-0847</span>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, letterSpacing: '.06em', color: 'var(--green)', background: 'rgba(52,211,153,.12)', border: '1px solid rgba(52,211,153,.3)', padding: '4px 10px', borderRadius: 999 }}>PAID</span>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Bill To</div>
            <div style={{ fontSize: 14.5, color: 'var(--text-primary)', fontWeight: 600 }}>Amelia Ross</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>amelia@northlightstudio.com</div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-hair)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Homepage redesign', '$1,200.00'],
              ['Logo & brand kit', '$450.00'],
              ['Monthly retainer (2x)', '$600.00'],
            ].map(([label, amt]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--text-secondary)' }}>{amt}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border-hair)', marginTop: 14, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-tertiary)' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>$2,250.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-tertiary)' }}>
              <span>Tax (8%)</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>$180.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, color: 'var(--amber-ink)', fontWeight: 700 }}>$2,430.00</span>
            </div>
          </div>
          <div style={{ position: 'absolute', right: -18, bottom: -18, background: 'var(--bg-surface-2)', border: '1px solid var(--border-hair-strong)', borderRadius: 14, padding: '12px 16px', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 10, transform: 'rotate(-4deg)' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(34,211,238,.14)', border: '1px solid rgba(34,211,238,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan-ink)', flexShrink: 0 }}>
              <DocIcon size={15} />
            </span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>PDF Exported</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'var(--text-tertiary)' }}>in 0.8s</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
