import React from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { GridIcon, DocIcon, GlobeIcon, UsersIcon, PaletteIcon } from './Icons'
import '../styles/Features.css'

const SMALL_FEATURES = [
  {
    Icon: DocIcon,
    title: '1-Click PDF Export',
    body: 'High-speed vector rendering with your own logo and brand colors baked in.',
  },
  {
    Icon: PaletteIcon,
    title: 'Custom Accent Colors',
    body: '5 templates, each with every color slot overridable — pick your brand hex per template and it’s remembered independently the next time you switch.',
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
    <section id="features" className="features-section">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need to invoice like a pro"
        subtitle="A tight, focused toolkit — not a bloated accounting suite."
      />

      <Reveal delay={1} className="features-hero-card">
        <div>
          <div className="features-icon-box">
            <GridIcon />
          </div>
          <h3 className="features-hero-title">Live Real-Time Preview</h3>
          <p className="features-hero-desc">
            Every field you type renders instantly into a print-ready invoice, split-screen — no refresh, no surprises at export time.
          </p>
        </div>
        <div className="features-preview-grid">
          <div className="features-mockup-card">
            <div className="features-mockup-tag">Form</div>
            <div className="mockup-line w-70" />
            <div className="mockup-line w-90" />
            <div className="mockup-line w-55" />
            <div className="mockup-line w-80" />
          </div>
          <div className="features-mockup-card is-accent">
            <div className="features-mockup-tag is-blue">Invoice</div>
            <div className="mockup-line w-85" />
            <div className="mockup-line w-65" />
            <div className="mockup-line w-75" />
            <div className="mockup-line w-40-accent" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={2} className="features-grid">
        {SMALL_FEATURES.map(({ Icon, title, body }) => (
          <div key={title} className="feature-card">
            <div className="features-icon-box">
              <Icon />
            </div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-desc">{body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
