import React from 'react'
import SectionHeading from './SectionHeading'
import { GridIcon, DocIcon, GlobeIcon, UsersIcon } from './Icons'

const SMALL_FEATURES = [
  {
    Icon: DocIcon,
    title: '1-Click PDF Export',
    body: 'High-speed vector rendering with your own logo and brand colors baked in.',
  },
  {
    Icon: GlobeIcon,
    title: 'Multi-Currency & Tax Automation',
    body: 'Auto-calculates VAT, GST, discounts, and line-item totals in 30+ currencies.',
  },
  {
    Icon: UsersIcon,
    title: 'Client Catalog & CRM',
    body: 'Save frequent clients and products for instant auto-complete invoice building.',
  },
]

export default function Features() {
  return (
    <section id="features" style={{ scrollMarginTop: 84, position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '100px 24px' }}>
      <SectionHeading
        eyebrow="Features"
        title="Everything you need to invoice like a pro"
        subtitle="A tight, focused toolkit — not a bloated accounting suite."
      />

      <div className="sv-reveal sv-d1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-hair)', borderRadius: 20, padding: 40, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 40, alignItems: 'center' }}>
        <div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-surface-2)', border: '1px solid var(--border-hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-ink)', marginBottom: 18 }}>
            <GridIcon />
          </div>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 21, fontWeight: 600, margin: '0 0 10px' }}>Live Real-Time Preview</h3>
          <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Every field you type renders instantly into a print-ready invoice, split-screen — no refresh, no surprises at export time.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
          <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-hair)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Form</div>
            <div style={{ height: 8, width: '70%', background: 'var(--border-hair-strong)', borderRadius: 4 }} />
            <div style={{ height: 8, width: '90%', background: 'var(--border-hair-strong)', borderRadius: 4 }} />
            <div style={{ height: 8, width: '55%', background: 'var(--border-hair-strong)', borderRadius: 4 }} />
            <div style={{ height: 8, width: '80%', background: 'var(--border-hair-strong)', borderRadius: 4 }} />
          </div>
          <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-hair-strong)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--amber-ink)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Invoice</div>
            <div style={{ height: 8, width: '85%', background: 'var(--amber)', opacity: 0.5, borderRadius: 4 }} />
            <div style={{ height: 8, width: '65%', background: 'var(--border-hair-strong)', borderRadius: 4 }} />
            <div style={{ height: 8, width: '75%', background: 'var(--border-hair-strong)', borderRadius: 4 }} />
            <div style={{ height: 9, width: '40%', background: 'var(--amber-ink)', borderRadius: 4, marginTop: 4 }} />
          </div>
        </div>
      </div>

      <div className="sv-reveal sv-d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
        {SMALL_FEATURES.map(({ Icon, title, body }) => (
          <div key={title} className="feature-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-hair)', borderRadius: 18, padding: 32, transition: 'all .25s' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-surface-2)', border: '1px solid var(--border-hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-ink)', marginBottom: 18 }}>
              <Icon />
            </div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17.5, fontWeight: 600, margin: '0 0 8px' }}>{title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
