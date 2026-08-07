import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { ForgeMark, SunIcon, MoonIcon, MailIcon, CommunityIcon, UpdatesIcon } from './Icons'

const PRODUCT_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#templates', label: 'Templates' },
]

const RESOURCE_LINKS = [
  { href: '#faqs', label: 'FAQs' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms of Service' },
]

export default function Footer() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border-hair)', padding: '56px 24px 28px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="sv-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 36, marginBottom: 44 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,var(--amber),var(--amber-soft))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ForgeMark size={14} />
              </span>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>InvoiceForge</span>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: 240, margin: '0 0 16px' }}>
              Elegant invoices, built in seconds. No login required.
            </p>
            <button
              onClick={toggleTheme}
              className="mode-toggle"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999, border: '1px solid var(--border-hair-strong)', background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', fontSize: 12.5, fontFamily: "'Inter',sans-serif", cursor: 'pointer', transition: 'all .2s' }}
            >
              {isDark ? <MoonIcon size={13} /> : <SunIcon size={13} />}
              {isDark ? 'Dark mode' : 'Light mode'}
            </button>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Product</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {PRODUCT_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="footer-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {RESOURCE_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="footer-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Connect</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Email', Icon: MailIcon },
                { label: 'Community', Icon: CommunityIcon },
                { label: 'Updates', Icon: UpdatesIcon },
              ].map(({ label, Icon }) => (
                <a key={label} href="#" aria-label={label} className="social-icon" style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-hair-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all .2s' }}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-hair)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: 'var(--text-tertiary)' }}>© 2026 InvoiceForge. All rights reserved.</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulseDot 2s infinite' }} />
            All Systems Operational
          </span>
        </div>

        <div className="sv-reveal" style={{ marginTop: 40, border: '6px solid var(--amber)', borderRadius: 16, overflow: 'hidden', position: 'relative', background: 'var(--bg-canvas)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(245,158,11,.14) 1px,transparent 1.4px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', height: 'clamp(84px,14vw,180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2.5rem,10vw,10rem)', lineHeight: 1, color: '#F8AF18', textShadow: '3px 3px 0 rgba(0,0,0,.35)', whiteSpace: 'nowrap', transform: 'scale(1.05)' }}>
              INVOICEFORGE
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
