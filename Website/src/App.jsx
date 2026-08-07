import React from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Header from './components/Header'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import TryItLive from './components/TryItLive'
import Templates from './components/Templates'
import Testimonials from './components/Testimonials'
import Faqs from './components/Faqs'
import FinalCta from './components/FinalCta'
import Footer from './components/Footer'

function Page() {
  const { theme } = useTheme()

  return (
    <div
      data-theme={theme}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter',sans-serif",
        overflowX: 'hidden',
      }}
    >
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle,var(--grid-dot) 1px,transparent 1.4px)', backgroundSize: '28px 28px' }} />
      <div style={{ position: 'fixed', top: -220, left: -140, width: 520, height: 520, borderRadius: '50%', background: 'var(--amber)', opacity: 0.14, filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: 260, right: -200, width: 560, height: 560, borderRadius: '50%', background: 'var(--cyan)', opacity: 0.10, filter: 'blur(130px)', zIndex: 0, pointerEvents: 'none' }} />

      <Header />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <TryItLive />
      <Templates />
      <Testimonials />
      <Faqs />
      <FinalCta />
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Page />
    </ThemeProvider>
  )
}
