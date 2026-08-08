import React, { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { NAV_LINKS } from '../data/content'
import { ForgeMark, SunIcon, MoonIcon, CloseIcon, MenuIcon } from './Icons'

export default function Header() {
  const { theme, toggleTheme, isLight, isDark } = useTheme()
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
      className={scrolled ? 'header-scrolled' : ''}
      style={{
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-hair)',
        transition: 'box-shadow .3s ease',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--blue-soft))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)', flexShrink: 0 }}>
            <ForgeMark />
          </span>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 19, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>InvoiceForge</span>
        </a>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="nav-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14.5, fontWeight: 500 }}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="icon-btn"
                style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-hair-strong)', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {isLight ? <SunIcon /> : <MoonIcon />}
              </button>
              <a href="#try-it" className="btn-outline" style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border-hair-strong)', color: 'var(--text-primary)', background: 'transparent', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                Try Live Demo
              </a>
              <a href="#try-it" className="btn-primary-sm" style={{ padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--blue-soft))', color: '#F5F9FF', fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: 'var(--shadow-glow)', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'transform .2s' }}>
                Create Invoice Now
              </a>
            </div>
          </div>
        )}

        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-hair-strong)', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {isLight ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Menu"
              style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-hair-strong)', background: 'transparent', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        )}
      </div>

      {mobileMenuOpen && (
        <div style={{ borderTop: '1px solid var(--border-hair)', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg-canvas)' }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMobileMenu} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, fontWeight: 500, padding: '10px 0' }}>
              {link.label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <a href="#try-it" onClick={closeMobileMenu} style={{ flex: 1, textAlign: 'center', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-hair-strong)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Try Live Demo
            </a>
            <a href="#try-it" onClick={closeMobileMenu} style={{ flex: 1, textAlign: 'center', padding: '12px 16px', borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--blue-soft))', color: '#F5F9FF', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Create Invoice
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
