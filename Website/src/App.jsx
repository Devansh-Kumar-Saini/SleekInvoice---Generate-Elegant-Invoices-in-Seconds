import React, { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Gallery from './components/Gallery'
import Templates from './components/Templates'
import Testimonials from './components/Testimonials'
import Faqs from './components/Faqs'
import FinalCta from './components/FinalCta'
import Footer from './components/Footer'
import './styles/App.css'

export default function App() {
  const [theme, setTheme] = useState('dark')
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div data-theme={theme} className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div aria-hidden="true" className="mesh-background" />

      <Header theme={theme} toggleTheme={toggleTheme} />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Gallery />
        <Templates />
        <Testimonials />
        <Faqs />
        <FinalCta />
      </main>
      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  )
}
