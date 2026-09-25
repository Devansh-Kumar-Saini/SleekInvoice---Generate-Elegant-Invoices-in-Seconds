import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { ForgeMark, SunIcon, MoonIcon, MailIcon, CommunityIcon, UpdatesIcon, XIcon, LinkedinIcon, YoutubeIcon } from './Icons'
import Reveal from './Reveal'
import '../styles/Footer.css'

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
    <footer className="footer">
      <div className="footer-inner">
        <Reveal className="footer-grid">
          <div>
            <div className="footer-brand-header">
              <span className="footer-brand-icon">
                <ForgeMark size={14} />
              </span>
              <span className="footer-brand-name">InvoiceForge</span>
            </div>
            <p className="footer-brand-tagline">
              Elegant invoices, built in seconds. No login required.
            </p>
            <button
              onClick={toggleTheme}
              className="mode-toggle"
            >
              {isDark ? <MoonIcon size={13} /> : <SunIcon size={13} />}
              {isDark ? 'Dark mode' : 'Light mode'}
            </button>
          </div>
          <div>
            <div className="footer-col-title">Product</div>
            <div className="footer-links-list">
              {PRODUCT_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="footer-link">{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-col-title">Resources</div>
            <div className="footer-links-list">
              {RESOURCE_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="footer-link">{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-col-title">Connect</div>
            <div className="footer-socials">
              {[
                { label: 'Email', Icon: MailIcon },
                { label: 'Community', Icon: CommunityIcon },
                { label: 'Updates', Icon: UpdatesIcon },
              ].map(({ label, Icon }) => (
                <a key={label} href="#" aria-label={label} className="social-icon">
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="footer-status-bar">
          <span className="footer-copyright">© 2026 InvoiceForge. All rights reserved.</span>
          <span className="footer-status-pill">
            <span className="footer-status-dot" />
            All Systems Operational
          </span>
        </div>
      </div>

      <div className="footer-watermark-wrap">
        <div aria-hidden="true" className="footer-watermark-glow" />
        <div className="footer-watermark-inner">
          <div aria-hidden="true" className="footer-watermark-text">
            INVOICEFORGE
          </div>
          <div className="footer-bottom-socials">
            {[
              { label: 'X', Icon: XIcon, href: '#' },
              { label: 'LinkedIn', Icon: LinkedinIcon, href: '#' },
              { label: 'YouTube', Icon: YoutubeIcon, href: '#' },
            ].map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="social-icon-circle"
              >
                <Icon />
              </a>
            ))}
          </div>
          <span className="footer-bottom-copy">
            InvoiceForge © 2026
          </span>
        </div>
      </div>
    </footer>
  )
}
