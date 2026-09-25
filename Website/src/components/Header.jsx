import React, { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { NAV_LINKS } from '../data/content'
import { ForgeMark, SunIcon, MoonIcon, CloseIcon, MenuIcon } from './Icons'
import '../styles/Header.css'

export default function Header() {
  const { toggleTheme, isLight } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header
      id="top"
      className={`header ${scrolled ? 'header-scrolled' : ''}`}
    >
      <div className="header-inner">
        <a href="#top" className="header-brand">
          <span className="header-logo-icon">
            <ForgeMark />
          </span>
          <span className="header-logo-text">InvoiceForge</span>
        </a>

        <div className="nav-desktop">
          <nav className="nav-links">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="icon-btn"
            >
              {isLight ? <SunIcon /> : <MoonIcon />}
            </button>
            <a href="https://allfreeinvoice.vercel.app/" className="btn-primary-sm">
              Create Invoice Now
            </a>
          </div>
        </div>

        <div className="nav-mobile">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="nav-mobile-btn"
          >
            {isLight ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Menu"
            className="nav-mobile-btn nav-mobile-btn-toggle"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMobileMenu} className="mobile-menu-link">
              {link.label}
            </a>
          ))}
          <div className="mobile-menu-actions">
            <a href="#gallery" onClick={closeMobileMenu} className="mobile-menu-btn-outline">
              View Gallery
            </a>
            <a href="https://allfreeinvoice.vercel.app/" onClick={closeMobileMenu} className="mobile-menu-btn-primary">
              Create Invoice
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
