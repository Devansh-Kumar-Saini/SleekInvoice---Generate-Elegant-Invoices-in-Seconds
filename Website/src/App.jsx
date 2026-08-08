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
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `
            radial-gradient(680px 480px at 8% -8%, var(--mesh-1), transparent 60%),
            radial-gradient(720px 520px at 96% 22%, var(--mesh-2), transparent 60%),
            radial-gradient(600px 440px at 30% 100%, var(--mesh-3), transparent 60%)
          `,
          animation: 'meshDrift 22s ease-in-out infinite',
        }}
      />

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
