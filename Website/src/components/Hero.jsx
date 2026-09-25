import React from 'react'
import { ForgeMark, BoltIcon, ArrowRightIcon, DocIcon } from './Icons'
import Reveal from './Reveal'
import '../styles/Hero.css'

export default function Hero() {
  return (
    <section className="hero-section">
      <Reveal>
        {/* <div className="hero-badge">
          <BoltIcon />
          <span className="hero-badge-text">
            GENERATE ELEGANT INVOICES IN SECONDS
          </span>
          <span className="hero-badge-dot" />
        </div> */}
        <div className="hero-badge">
          {/* <BoltIcon /> */}
          <span className="hero-badge-text">
            No login required
          </span>
          <span className="hero-badge-dot" />
        </div>
        <h1 className="hero-title">
          Professional Invoices.<br />Effortlessly Built.<br /><span className="hero-title-highlight">Instantly Paid.</span>
        </h1>
        <p className="hero-description">
          Fast invoices ● Zero friction
          <br />
          Create professional invoices in seconds with automatic tax calculations and instant client-ready PDF downloads.

        </p>
        <div className="hero-actions">
          <a href="https://allfreeinvoice.vercel.app/" className="btn-primary">
            Generate Free Invoice
            <ArrowRightIcon />
          </a>
          <a href="#features" className="btn-outline">
            See How It Works
          </a>
        </div>
        <div className="hero-trusted">
          <div className="hero-avatars">
            {['NC', 'CR', 'M', 'PG'].map((initials) => (
              <span
                key={initials}
                className="hero-avatar"
              >
                {initials}
              </span>
            ))}
          </div>
          <span className="hero-trusted-text">
            Trusted by <strong>freelancers, developers &amp; teams</strong>
          </span>
        </div>
      </Reveal>

      <Reveal delay={1} className="hero-preview-wrapper">
        <div className="hero-invoice-card">
          <div className="hero-card-header">
            <div className="hero-card-brand">
              <span className="hero-card-icon">
                <ForgeMark size={11} />
              </span>
              <span className="hero-card-inv-no">INV-2024-0847</span>
            </div>
            <span className="hero-card-status">PAID</span>
          </div>
          <div className="hero-bill-to">
            <div className="hero-bill-to-label">Bill To</div>
            <div className="hero-bill-to-name">Amelia Ross</div>
            <div className="hero-bill-to-email">amelia@northlightstudio.com</div>
          </div>
          <div className="hero-items-list">
            {[
              ['Homepage redesign', '$1,200.00'],
              ['Logo & brand kit', '$450.00'],
              ['Monthly retainer (2x)', '$600.00'],
            ].map(([label, amt]) => (
              <div key={label} className="hero-item-row">
                <span className="hero-item-label">{label}</span>
                <span className="hero-item-amount">{amt}</span>
              </div>
            ))}
          </div>
          <div className="hero-totals">
            <div className="hero-total-row">
              <span>Subtotal</span>
              <span className="hero-total-val">$2,250.00</span>
            </div>
            <div className="hero-total-row">
              <span>Tax (8%)</span>
              <span className="hero-total-val">$180.00</span>
            </div>
            <div className="hero-total-grand">
              <span className="hero-total-grand-label">Total</span>
              <span className="hero-total-grand-amount">$2,430.00</span>
            </div>
          </div>
          <div className="hero-export-badge">
            <span className="hero-export-icon">
              <DocIcon size={15} />
            </span>
            <div>
              <div className="hero-export-title">PDF Exported</div>
              <div className="hero-export-time">in 0.8s</div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
