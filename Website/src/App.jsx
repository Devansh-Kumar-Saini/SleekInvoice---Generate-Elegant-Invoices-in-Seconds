import React from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
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

function Page() {
  const { theme } = useTheme()

  return (
    <div data-theme={theme} className="app-container">
      <div aria-hidden="true" className="mesh-background" />

      <Header />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Gallery />
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
